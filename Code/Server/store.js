//Benötigte Module
var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var distance = require('google-distance');

// Verbindung zur Datenbank herstellen
var DB = mongoose.createConnection('mongodb://localhost/db_teamdrive');

// Schema und ObjectId mit mongoose verbinden
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Schemen für die Daten erstellen
// Für die einheitliche Datendarstellung in der Datenbank
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

// Schemen an Models und Models an die Datenbank anbinden
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
        // Übersendetes Passwort wird gehashed
        var hashedPassword = passwordHash.generate(pass);
        // Sucht Benuter in der Datenbank mit "usernamen"
        Person.findOne({per_benutzer: user}, function(err, users) {
            if (users == null || users.per_benutzer != user){
                callback('Benutzer nicht gefunden!');
            }else{
                // Stimmen die Passwörter überein, wird das User Array zurück geliefert
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
        // Sucht Benuter in der Datenbank mit "id"
        Person.findById(pid, function(err, users) {
            // Findet die Abfrage nichts oder die ID ungleich der Datenbank ID
            // dann Fehlerausgabe, sonst wird das User Array zurück geliefert
            if (users == null || users._id != pid){
                callback('User ID wurde nicht gefunden!');
            }else{
                callback(null, users);
            }
        });
    },
    getAllPlayers: function(mannschaft, callback) {
        // Sucht alle Spieler, die der "mannschaft" angehören
        Person.find({per_mannschaft:mannschaft}, function(err, player) {
            if (err) callback(err)
            // Gibt ein Array mit allen Spielern zurück
            else callback(null, player)
        });
    },
    deletePlayer: function(id, callback){
        // Löscht eine Person mit der ID
        Person.remove({per_benutzer:id}, callback);
    },
    addNewPlayer: function(per_data, callback) {
        // Sucht eine Person nach dem "benutzernamen"
        // Falls vorhanden, Fehlerausgabe, sonst wird die Person erstellt 
        Person.findOne({per_benutzer:per_data.per_benutzer}, function(err, users) {
            if (users){
                callback('Benutzername wurde schon verwendet!');
            }else{
                Person.create(per_data, callback);
            }
        });
    },
    getAllEvents: function(mannschaft, callback) {
        // Sucht alle Events einer Mannschaft, die nicht älter sind als gestern und sortiert diese nach Uhrzeit und Datum
        Event.find({e_mannschaft:mannschaft}).where('e_datum').gt(yesterday).sort({'e_datum': 1}).sort({'e_uhrzeit': 1}).exec(function(err, event) {
            if (err) callback(err)
            // Gibt ein Array mit allen Spielen zurück
            else callback(null, event)
        });
    },
    deleteEvent: function(id, callback){
        // Löscht ein Event mit dem Eventnamen
        Event.remove({e_eventname:id}, callback);
    },
    addNewEvent: function(e_data, callback) {
        // Erzeugt ein neues Event
        Event.create(e_data, callback);
    },
    getComingEvent: function(id, callback) {
        // Sucht Person mit der "id" heraus
        Person.findById(id, function(err, player){
            // Ergebnis wir überprüft. 
            if (player == null && player._id != id){
                callback('Spieler ID wurde nicht gefunden!');
            }else{
                // Sucht das nächste Event, das der zu suchenden Mannschaft angehört
                Event.findOne({e_mannschaft:player.per_mannschaft}).where('e_datum').gt(yesterday).sort({'e_datum': 1}).sort({'e_uhrzeit': 1}).limit(1).exec(function(err, event) {
                    // Gibt ein Array mit kommenden Event zurück
                    callback(null, event);
                });
            } 
        });
    },
    savePlayerStatus: function(data, status, callback) {
        // Überrüfungsvariable, ob data und status gefüllt ist
        var tf = data == null &&  status == null;
        // Falls Überprüfungsvariable false ist, dann Fehler
        if (tf = false){
               callback('Ohne Daten, kein Fahrer-/ Mitfahrereintrag möglich!');
        // Falls Status true ist, trage Spieler als Fahrer ein
        }else if (status == "true"){
            Fahrer.findOne({p_id:data.p_id, e_id:data.e_id}, function(err, eintrag){
                if (eintrag == null) Fahrer.create(data, callback);
                else callback('Spieler ist bereits als Fahrer eingetragen!');
            });
        // Falls Status false ist, trage Spieler als Mitfahrer ein
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
            // Sucht mit der "mitfahrer id" und der "event id" die "fahrer id"
            Auto.findOne({m_id:data.mid, e_id:data.eid}, function(err, driver){
                if (driver != null){
                    // "fahrer id" wird benötigt um Fahrernamen zu ermitteln
                    Person.findOne(driver.f_id, function(err, user) {
                        if (user == null || driver.f_id == user._id){
                            callback('Benutzer ID wurde nicht gefunden!');
                        }else{
                            // Schreibe Fahrerdaten in das Array
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
        // Wenn "data" leer ist, dann Fehlermeldung
        if (data == null){
               callback('Ohne die benötigten Daten kann keine Nachricht weitergeleitet werden!');
        // Wenn die erforderlichen Daten nicht leer sind, dann speichere Daten ab
        }else if (data.f_id != null && data.m_id != null && data.e_id != null && data.msg != null){
            Nachricht.create(data, callback);    
        // sonst gib Fehlermeldung aus
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getMessage: function(data, callback) { 
        var nachrichten = [];
        // Wenn "data" leer ist, dann Fehlermeldung
        if (data == null){
               callback('Ohne die benötigten Daten können keine Nachricht abgerufen werden!');
        // Wenn die erforderlichen Daten nicht leer sind, dann suche Nachricht für den Fahrer mit der "fahrer id"
        }else if (data.f_id != null && data.e_id != null){
            Nachricht.find({f_id:data.f_id, e_id:data.e_id}, function(err, messages){
                // speichere alle Nachrichten mit "mitfahrer id" und "nachricht" ab
                messages.forEach(function(msg){
                    nachrichten.push({
                        m_id: msg.m_id,
                        msg: msg.msg});
                });
                // Gebe alle IDs und Nachrichten zurück
                callback(null, nachrichten);
            });            
        }else callback("Es fehlen Daten, die benötigt werden.");
    },
    getName: function(data, callback) {
        var sender = [];
        var count = 0;
        var anzahl = data.length;
        // Wenn "data" leer ist, dann Fehlermeldung
        if (data == null){
               callback('Es wurden keine Daten gefunden!');
        }else{
            // gib alle "ids" aus 
            data.forEach(function(person){
                // suche mit den "ids" die benutzer
                Person.find({_id:person.m_id}, function(err, user){
                    user.forEach(function(name){
                        count++;
                        // speichere die Namen zu den "ids" ab
                        sender.push({
                            m_id: person.m_id,
                            mname: name.per_vorname+" "+name.per_name,
                            msg: person.msg});
                        // Wenn count-variable gleich der Anzahl an ids ist, dann sende Daten zurück
                        if(anzahl == count) callback(null, sender);
                    });
                });
            });
        }
    },
    saveGPS: function(data, callback) {
        // Wenn "data" leer ist, dann Fehlermeldung
        if (data == null){
               callback('Ohne die benötigten Daten können keine Berechnungen stattfinden!');
        // Wenn benötigte Daten nicht leer sind dann suche Fahrer mit der "personen id" und der "event id"
        }else if (data.pid != null && data.eid != null && data.longitude != null && data.latitude != null){
            Fahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, feintrag){
                // Wenn nichts gefunden wurde, dann suche bei den Mitfahrern
                if (feintrag == null){
                    Mitfahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, meintrag){
                        // wenn gefunden, dann update die Daten ab
                        console.log("Mitfahrerposition wird abgedatet.");
                        Mitfahrer.update(meintrag, data, callback);
                    });
                }else{
                    // wenn fahrer gefunden wurde, überprüfe die Daten und update die Daten ab
                    if (feintrag.p_id == data.pid && feintrag.e_id == data.eid){
                        console.log("Fahrerposition wird abgedatet.");
                        Fahrer.update(feintrag, data, callback);
                    }
                }
            });      
        }else callback("Es fehlen Daten, die benötigt werden!");
    },
    getMitfahrer: function(data, callback) { 
        var mitfahrer = [];
        // Wenn "data" leer ist, dann Fehlermeldung
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
        // Wenn "data" leer ist, dann Fehlermeldung
        if (data == null){
               callback('Es wurden keine Daten gefunden!');
        }else{
            // gib alle "ids" aus 
            data.forEach(function(person){
                // suche mit den "ids" die mitfahrer
                Mitfahrer.find({p_id:person.m_id}, function(err, user){
                    user.forEach(function(position){
                        count++;
                        // speichere die Namen zu den "ids" ab
                        mitfahrer.push({
                            m_id: person.m_id,
                            mname: person.mname,
                            latitude: position.latitude,
                            longitude: position.longitude});
                        // Wenn count-variable gleich der Anzahl an ids ist, dann sende Daten zurück
                        if(anzahl == count) callback(null, mitfahrer);
                    });
                });
            });
        }
    },
    getEventDestination: function(eid, callback) {
        // Suche Event mit der "event id"
        Event.findById(eid, function(err, ziel){
            var tf = ziel == null && eid == ziel._id;
            if (tf == true){
                callback('Event wurde nicht gefunden');
            }else{
                // schreibe erfragte Daten in die Variablen ab
                var dest = ziel.e_strasse;
                dest += ", "+ziel.e_stadt
                var destination = [];
                destination.push(dest);
                var anstoss = ziel.e_treffpunkt;
                // Sende Ziel und treffpunkt ab
                callback(null, destination, anstoss);
            }
        });
    },
    getDriverOrigin: function(data, callback) {
        // Suche Fahrer in Fahrer Collection mit "personen id" und "event id"
        Fahrer.findOne({p_id:data.pid, e_id:data.eid}, function(err, start){
            if (start == null || data.eid != start.e_id || data.pid != start.p_id){
                callback('Es wurden keine passenden Daten gefunden!');
            }else{    
                // schreibe erfragte Daten in die Variablen ab
                var gps = start.latitude;
                gps += ", "+start.longitude;
                var origin = [];
                origin.push(gps);
                // Sende GPS Koordinaten ab
                callback(null, origin);
            }
        });
    },
    getNeededTime: function(origin, destinations, callback) {
        var duration = [];
        // Rufe Google API auf, um die Zeit zu bestimmen, die man vom Abfahrtort zum Ziel benötigt
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
    getStatus: function(pid, eid, callback) {
        var status = 0;
        // Suche Fahrer mit der "personen id" und der "event id"
        Fahrer.findOne({p_id:pid, e_id:eid}, function(err, feintrag){
                // wenn kein eintrag gefunden wurde, dann suche beim Mitfahrer 
                if (feintrag == null){
                    Mitfahrer.findOne({p_id:pid, e_id:eid}, function(err, meintrag){
                        // wenn da auch nichts gefunden wurde, dann sende Status "0" ab
                        if (meintrag == null) callback(null, status);
                        else{
                            // wenn mitfahrer gefunden wurde, dann sende Status "2" ab
                            status = 2;
                            callback(null, status);
                        }
                    });
                }else{ 
                    // wenn fahrer gefunden wurde, dann sende Status "2" ab
                    status = 1;
                    callback(null, status);
                }
            });      
    },
};
//----------------------------------------------------------------------------------------------------------------------------------------------
//Weitere Variablen vom Server ----------------------------------------------------------------------------------------------------------------
var datum = new Date();
var today = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+datum.getDate()).slice(-2);
var yesterday = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+(datum.getDate()-1)).slice(-2);

//Modul exportieren ----------------------------------------------------------------------------------------------------------------------------
module.exports = store;