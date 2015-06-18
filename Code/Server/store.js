var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var crypto 	= require('crypto');
var passwordHash = require('password-hash');

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
    pid: ObjectId,
    eid: ObjectId
};
var mitfahrerSchema = {
    pid: ObjectId,
    eid: ObjectId
};
var autoSchema = {
    fid: ObjectId,
    mid: ObjectId,
    eid: ObjectId
};
var nachrichtSchema = {
    fid: ObjectId,
    mid: ObjectId,
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
            Fahrer.findOne({pid:fm_data.pid}, {eid:fm_data.eid}, function(err, eintrag){
                if (eintrag == null) Fahrer.create(fm_data, callback);
                else callback('Spieler bereits als Fahrer eingetragen!');
            });
        }else{
            Mitfahrer.findOne({pid:fm_data.pid}, {eid:fm_data.eid}, function(err, eintrag){
                if (eintrag == null) Mitfahrer.create(fm_data, callback);
                else callback('Spieler bereits als Mitfahrer eingetragen!');
            });
        }
    },
    getEventDriver: function(m_data, callback) {
        if (m_data == null){
               callback('Ohne Mitfahrer und Event ID ist keine Fahrerermittlung möglich!');
        }else{
            Auto.findOne({mid:m_data.mid, eid:m_data.eid}, function(err, driver){
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
};
//----------------------------------------------------------------------------------------------------------------------------------------------
//Weitere Funktionen vom Server ----------------------------------------------------------------------------------------------------------------
var datum = new Date();
var today = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+datum.getDate()).slice(-2);
var yesterday = datum.getFullYear()+"-"+("0"+(datum.getMonth()+1)).slice(-2)+"-"+("0"+(datum.getDate()-1)).slice(-2);

//Modul exportieren ----------------------------------------------------------------------------------------------------------------------------
module.exports = store;