var mongoDB = require('mongoskin');
var BSON = mongoDB.BSONPure;
var crypto 	= require('crypto');
var passwordHash = require('password-hash');
var moment = require('moment');

// Verbindung zur Datenbank herstellen
//Anlegen von NJM-System Datenbank
var db_teamdrive = mongoDB.db('mongodb://localhost/db_teamdrive?auto_reconnect=true', {safe: true});
// Gibt eine Konsolenausgabe, wenn die Datenbank verbunden ist
db_teamdrive.open(function(err, d){
	if (err){
		console.log(err);
	}else{
		console.log('Mit der TeamDrive Datenbank verbunden.');
	}
});

//Collections zu der Datenbank hinzufügen.
var Mannschaft = db_teamdrive.collection("mannschaft");
var Person = db_teamdrive.collection("person");
var Events = db_teamdrive.collection("events");
var Nachricht = db_teamdrive.collection("nachricht");
var Fahrer = db_teamdrive.collection("fahrer");
var Mitfahrer = db_teamdrive.collection("mitfahrer");
var Auto = db_teamdrive.collection("auto");

//Datenbankabfragen an dan Server
var store = {
    userLogin: function(user, pass, callback){
        var hashedPassword = passwordHash.generate(pass);
        Person.findOne({per_benutzer:user}, function(err, personen) {
            if (personen == null || personen.per_benutzer != user){
                callback('Benutzer-nicht-gefunden');
            }else{
                var validate = passwordHash.verify(personen.per_pw, hashedPassword);
                if (validate == true){
                    callback(null, personen);
                }else{
                    callback('ungültiges-Passwort');
                }
            }
        });
    },
    getPerson: function(id, callback){
        var pid = (id);
        Person.findById(pid, function(err, personen) {
            if (personen == null || personen._id != pid){
                callback('ID-nicht-gefunden');
            }else{
                callback(null, personen);
            }
        });
    },
    getAllPlayers: function(mannschaft, callback) {
        Person.find({per_mannschaft:mannschaft}).toArray(
            function(err, res) {
            if (err) callback(err)
            else callback(null, res)
        });
    },
    deletePlayer: function(id, callback){
	   Person.remove({per_benutzer:id}, true, callback);
    },
    addNewPlayer: function(per_data, callback) {
        Person.findOne({per_benutzer:per_data.per_benutzer}, function(err, person) {
            if (person){
                callback('Benutzername-schon-verwendet');
            }else{
                Person.insert(per_data, {safe: true}, callback);
            }
        });
    },
    getAllEvents: function(mannschaft, callback) {
        Events.find({e_mannschaft:mannschaft}).toArray(
            function(err, res) {
            if (err) callback(err)
            else callback(null, res)
        });
    },
    deleteEvent: function(id, callback){
	   Events.remove({e_eventname:id}, true, callback);
    },
    addNewEvent: function(e_data, callback) {
        Events.insert(e_data, {safe: true}, callback);
    },
};
//----------------------------------------------------------------------------------------------------------------------------------------------

//Modul exportieren
module.exports = store;