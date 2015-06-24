var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var passwordHash = require('password-hash');
var distance = require('google-distance');

// Verbindung zur Datenbank herstellen
var DB = mongoose.createConnection('mongodb://localhost/db_teamdrive');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

//Schemen für die Daten erstellen
var personSchema = {
    per_mannschaft: String,
    per_vorname: String,
    per_name: String,
    per_tel: Number,
    per_mobil: Number,
    per_email: String,
    per_status: String,
    per_strasse: String,
    per_stadt: String,
    per_auto: Boolean,
    per_sitzplaetze: Number,
    per_benutzer: String,
    per_pw: String
};
var eventSchema = {
    e_mannschaft: String,
    e_eventname: String,
    e_gegner: String,
    e_strasse: String,
    e_stadt: String,
    e_datum: String,
    e_uhrzeit: String,
    e_treffpunkt: String
};
var mannschaftSchema = {
    man_name: String,
    man_strasse: String,
    man_stadt: String,
};
var fahrerSchema = {
    p_id: ObjectId,
    e_id: ObjectId,
    longitude: Number,
    latitude:  Number
};
var mitfahrerSchema = {
    p_id: ObjectId,
    e_id: ObjectId,
    longitude: Number,
    latitude:  Number
};
var autoSchema = {
    f_id: ObjectId,
    m_id: ObjectId,
    e_id: ObjectId
};
var nachrichtSchema = {
    f_id: ObjectId,
    m_id: ObjectId,
    e_id: ObjectId,
    msg: String
};

// Models an die Datenbank anbinden
var Person = DB.model('Person', personSchema, 'person');
var Event = DB.model('Event', eventSchema, 'events');
var Mannschaft = DB.model('Mannschaft', mannschaftSchema, 'mannschaft');
var Fahrer = DB.model('Fahrer', fahrerSchema, 'fahrer');
var Mitfahrer = DB.model('Mitfahrer', mitfahrerSchema, 'mitfahrer');
var Auto = DB.model('Auto', autoSchema, 'auto');
var Nachricht = DB.model('Nachricht', nachrichtSchema, 'nachricht');

//Datenbankabfragen an den Server --------------------------------------------------------------------------------------------------------------
var store = {
    userLogin: function(user, pass, callback){
        var hashedPassword = passwordHash.generate(pass);
        Person.findOne({per_benutzer: user}, function(err, users) {
            if (users == null || users.per_benutzer != user){
                callback('Benutzer nicht gefunden!');
            }else{
                var validate = passwordHash.verify(users.per_pw, hashedPassword);
                if (validate == true){
                    callback(null, users);
                }else{
                    callback('Das Passwort ist ungültig!');
                }
            }
        });
    },
    getPerson: function(id, callback){
        var pid = (id);
        Person.findById(pid, function(err, users) {
            if (users == null || users._id != pid){
                callback('User ID wurde nicht gefunden!');
            }else{
                callback(null, users);
            }
        });
    },
    getAllPlayers: function(mannschaft, callback) {
        Person.find({per_mannschaft:mannschaft}, function(err, player) {
            if (err) callback(err)
            else callback(null, player)
        });
    },
    deletePlayer: function(id, callback){
	   Person.remove({per_benutzer:id}, callback);
    },
    addNewPlayer: function(per_data, callback) {
        Person.findOne({per_benutzer:per_data.per_benutzer}, function(err, users) {
            if (users){
                callback('Benutzername wurde schon verwendet!');
            }else{
                Person.create(per_data, callback);
            }
        });
    },
    getAllEvents: function(mannschaft, callback) {
        Event.find({e_mannschaft:mannschaft}).where('e_datum').gt(yesterday).sort({'e_datum': 1}).sort({'e_uhrzeit': 1}).exec(function(err, event) {
            if (err) callback(err)
            else callback(null, event)
        });
    },
    deleteEvent: function(id, callback){
	   Event.remove({e_eventname:id}, callback);
    },
    addNewEvent: function(e_data, callback) {
        Event.create(e_data, callback);
    },
    getComingEvent: function(id, callback) {
        Person.findById(id, function(err, player){
            if (player == null && player._id != id){
                callback('Spieler ID wurde nicht gefunden!');
            }else{
                Event.findOne({e_mannschaft:player.per_mannschaft}).where('e_datum').gt(yesterday).sort({'e_datum': 1}).sort({'e_uhrzeit': 1}).limit(1).exec(function(err, event) {
                    if (event == null && player.per_mannschaft != event.e_mannschaft){
                        callback('Kein passendes Event gefunden!');
                    }else{
                        callback(null, event)
                    }
                });
            } 
        });
    },
    savePlayerStatus: function(data, status, callback) {
        var tf = data == null &&  status == null;
        if (tf = false){
               callback('Ohne Daten, kein Fahrer-/ Mitfahrereintrag möglich!');
        }else if (status == "true"){
            Fahrer.findOne({p_id:data.p_id, e_id:data.e_id}, function(err, eintrag){
                if (eintrag == null) Fahrer.create(data, callback);
                else callback('Spieler ist bereits als Fahrer eingetragen!');
            });
        }else{
            Mitfahrer.findOne({p_id:data.p_id, e_id:data.e_id}, function(err, eintrag){
                if (eintrag == null) Mitfahrer.create(data, callback);
                else callback('Spieler ist bereits als Mitfahrer eingetragen!');
            });
        }
    },
    getEventDriver: function(data, callback) {
        if (data == null){
               callback('Ohne Mitfahrer und Event ID ist keine Fahrerermittlung möglich!');
        }else{
            Auto.findOne({m_id:data.mid, e_id:data.eid}, function(err, driver){
                if (driver != null){
                    Person.findOne(driver.f_id, function(err, user) {
                        if (user == null || driver.f_id == user._id){
                            callback('Benutzer ID wurde nicht gefunden!');
                        }else{
                            var fahrer = ({
                                f_id : user._id,
                                vorname : user.per_vorname,
                                nachname: user.per_name});
                            callback(null, fahrer);
                        }
                    });
                }else callback('Kein Fahrer mit dieser ID gefunden!');
            });      
        }
    },
    saveMessage: function(data, callback) {
        if (data == null){
               callback('Ohne die benötigten Daten kann keine Nachricht weitergeleitet werden!');
        }else if (data.f_id != null && data.m_id != null && data.e_id != null && data.msg != null){
            Nachricht.create(data, callback);      
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getMessage: function(data, callback) { 
        var nachrichten = [];
        if (data == null){
               callback('Ohne die benötigten Daten können keine Nachricht abgerufen werden!');
        }else if (data.f_id != null && data.e_id != null){
            Nachricht.find({f_id:data.f_id, e_id:data.e_id}, function(err, messages){
                messages.forEach(function(msg){
                    nachrichten.push({
                        m_id: msg.m_id,
                        msg: msg.msg});
                });
                callback(null, nachrichten);
            });            
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getName: function(data, callback) {
        var sender = [];
        var count = 0;
        var anzahl = data.length;
        if (data == null){
               callback('Es wurden keine Daten gefunden!');
        }else{
            data.forEach(function(person){
                Person.find({_id:person.m_id}, function(err, user){
                    user.forEach(function(name){
                        count++;
                        sender.push({
                            m_id: person.m_id,
                            mname: name.per_vorname+" "+name.per_name,
                            msg: person.msg});
                        if(anzahl == count) callback(null, sender);
                    });
                });
            });
        }
    },
    saveGPS: function(data, callback) {
        if (data == null){
               callback('Ohne die benötigten Daten können keine Berechnungen stattfinden!');
        }else if (data.pid != null && data.eid != null && data.longitude != null && data.latitude != null){
            Fahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, feintrag){
                if (feintrag == null){
                    Mitfahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, meintrag){
                        var tf = data.latitude == meintrag.latitude && data.longitude == meintrag.longitude;                    
                        if (tf == false){ 
                            console.log("Mitfahrerposition wird abgedatet.");
                            Mitfahrer.update(meintrag, data, callback);
                        }else if(tf == true){ 
                            callback("GPS Daten haben sich nicht verändert.");
                        }else callback("GPS Daten konnten keiner Person zugeordnet werden!");
                    });
                }else{ 
                    if (feintrag.p_id == data.pid && feintrag.e_id == data.eid){ 
                        var tf = data.latitude == feintrag.latitude && data.longitude == feintrag.longitude;                    
                        if (tf == false){ 
                            console.log("Fahrerposition wird abgedatet.");
                            Fahrer.update(feintrag, data, callback);
                        }else if(tf == true){ 
                            callback("GPS Daten haben sich nicht verändert.");
                        }else callback("GPS Daten konnten keiner Person zugeordnet werden!");
                    }
                }
            });      
        }else callback("Es fehlen Daten, die benötigt werden!");
    },
    getMitfahrer: function(data, callback) { 
        var mitfahrer = [];
        if (data == null){
               callback('Ohne die benötigten Daten können keine Mitfahrer abgerufen werden!');
        }else if (data.f_id != null && data.e_id != null){
            Auto.find({f_id:data.f_id, e_id:data.e_id}, function(err, fahrer){
                fahrer.forEach(function(rider){
                    mitfahrer.push({m_id: rider.m_id});
                });
                callback(null, mitfahrer);
            });            
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getPosition: function(data, callback) {
        var mitfahrer = [];
        var count = 0;
        var anzahl = data.length;
        if (data == null){
               callback('Es wurden keine Daten gefunden!');
        }else{
            data.forEach(function(person){
                Mitfahrer.find({p_id:person.m_id}, function(err, user){
                    user.forEach(function(position){
                        count++;
                        mitfahrer.push({
                            m_id: person.m_id,
                            mname: person.mname,
                            latitude: position.latitude,
                            longitude: position.longitude});
                        if(anzahl == count) callback(null, mitfahrer);
                    });
                });
            });
        }
    },
    getEventDestination: function(eid, callback) {
        Event.findById(eid, function(err, ziel){
            var tf = ziel == null && eid == ziel._id;
            if (tf == true){
                callback('Event wurde nicht gefunden');
            }else{
                var dest = ziel.e_strasse;
                dest += ", "+ziel.e_stadt
                var destination = [];
                destination.push(dest);
                var anstoss = ziel.e_treffpunkt;
                callback(null, destination, anstoss);
            }
        });
    },
    getDriverOrigin: function(data, callback) {
        Fahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, start){
            if (start == null || data.eid != start.e_id || data.pid != start.p_id){
                callback('Es wurden keine passenden Daten gefunden!');
            }else{    
                var gps = start.latitude;
                gps += ", "+start.longitude;
                var origin = [];
                origin.push(gps);
                callback(null, origin);
            }
        });
    },
    getNeededTime: function(origin, destinations, callback) {
        var duration = [];
        distance.get({
            origins: origin,
            destinations: destinations,
            mode: 'driving'
            }, function(err, data) {
                if (err) callback(err);
                data.forEach(function(value) {
                    duration = value.duration;
                });
                callback(null, duration);
        });
    },
    auto: function(data) {
        var mitfahrer = new Auto(data);
        mitfahrer.save(function (err) {
          if (err) return handleError(err);
          // saved!
        })
    },
};
//----------------------------------------------------------------------------------------------------------------------------------------------
//Weitere Variablen vom Server ----------------------------------------------------------------------------------------------------------------
var datum = new Date();
var today = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+datum.getDate()).slice(-2);
var yesterday = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+(datum.getDate()-1)).slice(-2);

//Modul exportieren ----------------------------------------------------------------------------------------------------------------------------
module.exports = store;


/*Mitfahrer.where('p_id').equals(mitfahrer_id[count-1]).where('e_id').equals(data.eid).find(function(err, positionen){
    positionen.forEach(function (gps_person){
        position[count]= gps_person;
        destinations.push(position[count].latitude);
        destinations.push(position[count].longitude);
    });
});*/