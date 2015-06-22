var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var crypto 	= require('crypto');
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
                callback('Benutzer-nicht-gefunden');
            }else{
                var validate = passwordHash.verify(users.per_pw, hashedPassword);
                if (validate == true){
                    callback(null, users);
                }else{
                    callback('ungültiges-Passwort');
                }
            }
        });
    },
    getPerson: function(id, callback){
        var pid = (id);
        Person.findById(pid, function(err, users) {
            if (users == null || users._id != pid){
                callback('ID-nicht-gefunden');
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
                callback('Benutzername-schon-verwendet');
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
            if (player == null || player._id != id){
                callback('Spieler-nicht-gefunden');
            }else{
                Event.findOne({e_mannschaft:player.per_mannschaft}).where('e_datum').gt(yesterday).sort({'e_datum': 1}).sort({'e_uhrzeit': 1}).limit(1).exec(function(err, event) {
                    if (event == null || player.per_mannschaft != event.e_mannschaft){
                        callback('Event-nicht-gefunden');
                    }else{
                        callback(null, event)
                    }
                });
            } 
        });
    },
    savePlayerStatus: function(fm_data, status, callback) {
        if (fm_data == null &&  status == null){
               callback('Ohne Daten, kein Fahrer-/ Mitfahrereintrag möglich!');
        }else if (status == "true"){
            Fahrer.findOne({p_id:fm_data.pid}, {e_id:fm_data.eid}, function(err, eintrag){
                if (eintrag == null) Fahrer.create(fm_data, callback);
                else callback('Spieler bereits als Fahrer eingetragen!');
            });
        }else{
            Mitfahrer.findOne({p_id:fm_data.pid}, {e_id:fm_data.eid}, function(err, eintrag){
                if (eintrag == null) Mitfahrer.create(fm_data, callback);
                else callback('Spieler bereits als Mitfahrer eingetragen!');
            });
        }
    },
    getEventDriver: function(m_data, callback) {
        if (m_data == null){
               callback('Ohne Mitfahrer und Event ID ist keine Fahrerermittlung möglich!');
        }else{
            Auto.findOne({m_id:m_data.mid, e_id:m_data.eid}, function(err, driver){
                if (driver != null){
                    Person.findOne(driver.fid, function(err, user) {
                        if (user == null || driver.fid == user._id){
                            callback('ID-nicht-gefunden');
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
    saveMessage: function(m_data, callback) {
        if (m_data == null){
               callback('Ohne die benötigten Daten kann keine Nachricht weitergeleitet werden!');
        }else if (m_data.fid != null && m_data.mid != null && m_data.eid != null && m_data.msg != null){
            Nachricht.create(m_data, callback);      
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    saveGPS: function(gps_data, callback) {
        if (gps_data == null){
               callback('Ohne die benötigten Daten können keine Berechnungen stattfinden!');
        }else if (gps_data.pid != null && gps_data.eid != null && gps_data.longitude != null && gps_data.latitude != null){
            Fahrer.findOne({p_id:gps_data.pid, e_id:gps_data.eid}, function(err, feintrag){
                if (feintrag == null){
                    Mitfahrer.findOne({p_id:gps_data.pid, e_id:gps_data.eid}, function(err, meintrag){ 
                        if (meintrag.pid == gps_data.pid && meintrag.eid == gps_data.eid){ 
                                    Mitfahrer.update(meintrag, gps_data, callback);
                        }else callback("GPS Daten konnten keiner Person zugeordnet werden!");
                    });
                }else{ 
                    if (feintrag.pid == gps_data.pid && feintrag.eid == gps_data.eid){ 
                        if (feintrag.longitude != gps_data.longitude && feintrag.latitude != gps_data.latitude)
                            //ToDO: Sende Daten an den Fahrer
                            Fahrer.update(feintrag, gps_data, callback);
                    }
                }
            });      
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getDistance: function(data,callback) {
        var fahrer_id = "";
        var mitfahrer_id = [];    
        Auto.where('f_id').equals(data.pid).where('e_id').equals(data.eid).find(function(err, abzuholende){
            var count = 1;
            var personen = {};
            abzuholende.forEach(function (mitfahrer){
                personen[count]= mitfahrer;
                fahrer_id = personen[count].f_id;
                mitfahrer_id.push(personen[count].m_id);
                count++;
            });
            //callback(abzuholende);
        });
        
        var ursprung = ({
            long: "",
            lat: ""});
        Fahrer.where('p_id').equals(data.pid).where('e_id').equals(data.eid).find(function(err, start){
            start.forEach(function(item) {
                ursprung.lat= item.latitude;
                ursprung.long= item.longitude;
                console.log(ursprung);
            });
        });
        
        
        /*var strasse ="";
        var stadt ="";
        var destina =[];
        var test = "";
        Event.findById(data.eid, function(err, ziel){
            strasse =ziel.e_strasse;
            stadt =ziel.e_stadt;
            test = "[ '"+strasse+", "+stadt+"' ]";
            destina.push(ziel.e_strasse);
            destina.push(ziel.e_stadt);
            console.log("Ziel1: "+test);
            console.log("Destina1: "+destina);
        });*/
        
        
        var origin = ['51.152408, 7.339643'];
        var destinations = ['Bornbacher Straße 11, Bergisch Born'];
        distance.get({
            origins: origin,
            destinations: destinations,
            mode: 'driving'
            }, function(err,data) {
                if (err) callback(err);
                console.log(data);
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