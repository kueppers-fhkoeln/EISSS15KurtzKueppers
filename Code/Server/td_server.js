// Benötigte Module
var express = require('express');
<<<<<<< HEAD
var app = express();
=======
var faye = require('faye');
>>>>>>> origin/master
var http = require('http');
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
var moment = require("moment");
<<<<<<< HEAD
=======
// Express und Server
var app = express();
var server = http.createServer(app);
>>>>>>> origin/master

// Verlinkung der Datenbankabfragen
var store = require('./store.js');
var fill = require('./fill.js'); //testweise app.get('/home/:id/events')


// Nodeadapter konfigurieren
// Nodeadapter zu http-Server hinzufügen
//PubSub-Client erzeugen
var bayeux = new faye.NodeAdapter({
	mount: '/faye',
	timeout: 45
});

bayeux.attach(server);
var pubClient = bayeux.getClient();

// Variablen für den Server werden gesetzt
var port = 3000;
var server = http.createServer(app);

// Applikation(Express-Engine) konfigurieren
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Errorhandler einstellen
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.writeHead(500);
	res.end(err.messages);
});

// Transportvariable für die SMTP Verbindung
var transporter = nodemailer.createTransport("SMTP",{
  service: 'Gmail',
  auth: { user: 'vskueppers@gmail.com',
        pass: '' }
});

//--------------------------------------------------------------------------------------------------------------------------------------
//---------------- Für die Website
//--------------------------------------------------------------------------------------------------------------------------------------
app.get('/', function(req, res){
    res.render('login');    
});
app.post('/', function(req, res){
    // Aufruf der Funktion userLogin mit "benutzer" und "passwort"
    // Rückgabewert ist ein Array mit den Personendaten
    store.userLogin(req.body.benutzer, req.body.passwort, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
            // Überprüft, ob der Status der Person "Administrator" ist
            // Wenn "true" -> login erfolgreich
            // Wenn "false" -> login nicht erfolgreich
            if(person.per_status == "Administrator"){
                console.log("Anmeldung Admin-Dashboard erfolgreich. Gebe ID "+person._id+" zurück.");
                console.log("Mitarbeiterstatus "+person.per_status);
                res.redirect('/home/'+person._id);
            }else{
                console.log("Anmeldung nicht erfolgreich.");
                console.log("Der Personenstatus muss Administrator sein und nicht "+person.per_status+"!");
                res.redirect('/');
            }
        }
    });
});
app.get('/home/:id', function(req, res){
    // Aufruf der Funktion getPerson mit "benutzer id"
    // Rückgabewert ist ein Array mit den Personendaten
    store.getPerson(req.params.id, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
            res.render('home', {person:person});    
        }
    });
});
app.get('/home/:id/players', function(req, res){
    // Aufruf der Funktion getPerson mit "benutzer id"
    // Rückgabewert ist ein Array mit den Personendaten
    store.getPerson(req.params.id, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
            // Aufruf der Funktion getAllPlayers mit "mannschaftsnamen"
            // Rückgabewert ist ein Array mit allen Spielern der Mannschaft zurück
            store.getAllPlayers(person.per_mannschaft, function(err, players){
                if(err) {
                    res.writeHead(500, "Es ist ein Fehler aufgetreten");
                }else{
                    res.render('players', {person:person, players:players});    
                }
            });
        }
    });
});
app.post('/deletePlayer', function(req, res){
    // Setzen der Variable für spätere Verwendung
    var id = req.body.id;
    // Aufruf der Funktion deletePlayer mit "spieler id"
    store.deletePlayer(req.body.spieler, function(err, spieler){
        if (!err){
            console.log('Spieler wurde gelöscht!');
            res.redirect('/home/'+id+'/players');
        }else{
            res.send('Kein Spieler mit dieser Kennung gefunden!', 400);
        }
    });
});
app.get('/home/:id/new_player', function(req, res){
    // Aufruf der Funktion getPerson mit "benutzer id"
    // Rückgabewert ist ein Array mit den Personendaten
    store.getPerson(req.params.id, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
            res.render('newplayer', {person:person});    
        }
    });                   
});
app.post('/home/:id/new_player', function(req, res){
    // Setzen der Variablen für spätere Verwendung
    var _id= req.params.id;
    var vorname= req.body.firstname;
    var name= req.body.lastname;
    // Aufruf der Funktion addNewPlayer mit einem gefüllten Array
    store.addNewPlayer({
        per_mannschaft      : req.body.mannschaft,
        per_vorname         : req.body.firstname,
        per_name            : req.body.lastname,
        per_tel             : req.body.tel,
        per_mobil           : req.body.mobile,
        per_email           : req.body.email,
        per_status          : req.body.status,
        per_strasse         : req.body.street,
        per_stadt           : req.body.city,
        per_auto            : req.body.auto,
        per_sitzplaetze     : req.body.plaetze,
        per_benutzer        : req.body.user,
        per_pw              : req.body.pwd,
    }, function(err){
        if (err){
            res.status(400).send(err);
        }else{
            // Email Daten werden für das versenden gesetzt
            var mailOptions = {
                from: "noreply <vskueppers@gmail.com>", // Absender
                to: email, // Empfänger
                subject: "TeamDrive - Sie wurden angemeldet", // Betreffe
                html: "<b>Sie sind für TeamDrive registriert.</b><span>Ihr Trainer oder Ihr Betreuer hat Sie für TeamDrive freigeschaltet. Ihre Anmeldendaten sind Benutzername "+benutzer+"und das Passwort "+pw+" .</span>" // Die Nachricht
            }
            // Mail wird mir der Transportervariable versendet
            transporter.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Mail gesendet: " + response.message);
                }
            });
            console.log("Spieler: "+vorname+" "+name+" wurde angelegt.");
            res.redirect('/home/'+_id+'/players');
        }
    });
});
app.get('/home/:id/events', function(req, res){
    // Aufruf der Funktion getPerson mit "benutzer id"
    // Rückgabewert ist ein Array mit den Personendaten
    store.getPerson(req.params.id, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
<<<<<<< HEAD
            // Aufruf der Funktion getAllEvents mit "mannschaftsnamen"
            // Rückgabewert ist ein Array mit allen Events, die der Mannschaft zugeordnet sind
=======
            
>>>>>>> origin/master
            store.getAllEvents(person.per_mannschaft, function(err, events){
                if(err) {
                    res.writeHead(500, "Es ist ein Fehler aufgetreten");
                }else{
                    res.render('events', {person:person, events:events});
                    fill.Zuteilung("FC Gummersbach", function(err, driver){}); 
                }
            });
        }
    });
});
app.post('/deleteEvent', function(req, res){
    // Setzen der Variable für spätere Verwendung
    var id = req.body.id;
    // Aufruf der Funktion deleteEvent mit "eventnamen"
    store.deleteEvent(req.body.event, function(err, event){
        if (!err){
            console.log('Event wurde gelöscht!');
            res.redirect('/home/'+id+'/events');
        }	else{
            res.send('Kein Event mit dieser ID gefunden!', 400);
        }
    });
});
app.get('/home/:id/new_event', function(req, res){
    // Aufruf der Funktion getPerson mit "benutzer id"
    // Rückgabewert ist ein Array mit den Personendaten
    store.getPerson(req.params.id, function(err, person){
        if (!person){
            res.status(400).send(err);
        }else{
            res.render('newevent', {person:person});    
        }
    });                   
});
app.post('/home/:id/new_event', function(req, res){
    // Setzen der Variablen für spätere Verwendung
    var _id= req.params.id;
    var eventname= req.body.eventname;
    var date= req.body.date;
    var time= req.body.time;
    // Aufruf der Funktion addNewEvent mit einem gefülltem Array
    store.addNewEvent({
        e_mannschaft    : req.body.mannschaft,
        e_eventname     : req.body.eventname,
        e_gegner        : req.body.gegner,
        e_strasse       : req.body.street,
        e_stadt         : req.body.city,
        e_datum         : req.body.date,
        e_uhrzeit       : req.body.time,
        e_treffpunkt    : req.body.treff
    }, function(err){
        if (err){
            res.status(400).send(err);
        }else{
            console.log("Das Event "+eventname+" wurde für den "+date+" um "+time+" eingetragen.");
            res.redirect('/home/'+_id+'/events');
        }
    });
});
<<<<<<< HEAD

// Gibt es die geforderte Ressource nicht, so kommt eine 404-Seite zurück
=======
>>>>>>> origin/master
app.get('*', function(req, res){ 
    res.render('404');
});

//--------------------------------------------------------------------------------------------------------------------------------------
//---------------- Für die APP
//--------------------------------------------------------------------------------------------------------------------------------------
app.post('/login', function(req, res){
    // Setzen der Variablen für spätere Verwendung
    var user = req.body.benutzer;
    var passwort = req.body.passwort;
    
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion userLogin mit "benutzer" und "passwort"
    // Rückgabewert ist ein Array mit den Personendaten
    store.userLogin(user, passwort, function(err, person){
        if (!person){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            // Aufruf der Funktion getComingEvent mit "benutzer id"
            // Rückgabewert ist ein Array mit dem nächsten Event
            store.getComingEvent(person._id, function(err, event){
                if(event == null) event = 1;
                if (!event){
                    res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                }else{
                    // Aufruf der Funktion getStatus mit "benutzer id" und "event id"
                    // Rückgabewert ist eine Variable, die den Status(Fahrer/Mitfahrer) des Benutzers anzeigt
                    store.getStatus(person._id, event._id, function(err, status){
                        if(event == null) event = 1;
                        if (!event){
                            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                        }else{
                            console.log(status);
                            res.status(200).send({"state": 1, person:person, event:event, status:status});
                        }
                    });
                }
            });
        }
    });  
});
app.post('/register', function(req, res){
    // Setzen der Variablen für spätere Verwendung
    var vorname= req.body.vorname;
    var name= req.body.nachname;

    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion addNewPlayer mit gefülltem Array
    store.addNewPlayer({
        per_mannschaft      : req.body.mannschaft,
        per_vorname         : req.body.vorname,
        per_name            : req.body.nachname,
        per_tel             : req.body.telefon,
        per_mobil           : req.body.mobile,
        per_email           : req.body.email,
        per_status          : req.body.status,
        per_strasse         : req.body.strasse,
        per_stadt           : req.body.stadt,
        per_auto            : req.body.auto,
        per_sitzplaetze     : req.body.sitzplaetze,
        per_benutzer        : req.body.benutzer,
        per_pw              : req.body.passwort,
    }, function(err){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            // Email Daten werden für das versenden gesetzt
            var mailOptions = {
                from: "noreply <vskueppers@gmail.com>", // Absender
                to: email, // Empfänger
                subject: "TeamDrive - Erfolgreich registriert", // Betreff
                html: "<b>Sie haben sich auf TeamDrive registriert.</b><span>Ihre Anmeldendaten sind Benutzername "+benutzer+"und das Passwort "+pw+" .</span>" // Nachricht
            }
            // Mail wird mir der Transportervariable versendet
            transporter.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Mail wurde gesendet.");
                }
            });
            res.status(200).send(JSON.stringify({ "state": 1, "message" : "erfolgreich" }));
        }
    });
});

app.post('/fahrtmenue', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion getComingEvent mit "benutzer id"
    // Rückgabewert ist ein Array mit dem nächsten Event
    store.getComingEvent(req.body.p_id, function(err, event){
        if (!event){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, event:event}));
            //res.status(200).send(event);
        }
    });  
});
app.post('/fahrtauswahl', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion savePlayerStatus mit gefülltem Array und einem status
    store.savePlayerStatus({
        pid     : req.body.p_id,
        eid     : req.body.e_id,
    }, req.body.status, function(err){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, "message" : "erfolgreich" }));
        }
    });  
});
app.post('/getDriver', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion getEventDriver mit gefülltem Array
    // Rückgabewert ist ein Array mit dem zugeordneten Fahrer zum Mitfahrer
    store.getEventDriver({
        mid     : req.body.p_id,
        eid     : req.body.e_id
    }, function(err, driver){
        if (!driver){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, driver:driver}));
        }
    });  
});
app.post('/sendMessage', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion saveMessage mit gefülltem Array
    store.saveMessage({
        fid     : req.body.f_id,
        mid     : req.body.p_id,
        eid     : req.body.e_id,
        msg     : req.body.msg
    }, function(err){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, "message" : "erfolgreich" }));
        }
    });  
});
<<<<<<< HEAD
app.post('/getMessage', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion getMessage mit gefülltem Array
    // Rückgabewert ist ein Array mit "Sender ID" und "Nachricht"
    store.getMessage({
        f_id     : req.body.f_id,
        e_id     : req.body.e_id
    }, function(err, id){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            // Aufruf der Funktion getName mit "sender id"
            // Rückgabewert ist ein Array mit Sender ID und Nachricht
            store.getName(id, function(err, nachrichten){
                if (err){
                    res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                }else{
                    res.status(200).send(JSON.stringify({ "state": 1, nachrichten:nachrichten }));
                }
            });
        }
    });  
});
=======
>>>>>>> origin/master
app.post('/sendGPS', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion saveGPS mit gefülltem Array
    store.saveGPS({
        pid          : req.body.p_id,
        eid          : req.body.e_id,
        longitude    : req.body.longitude,
        latitude     : req.body.latitude
    }, function(err){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, "message" : "erfolgreich" }));
        }
    });  
});
<<<<<<< HEAD
app.post('/getMitfahrer', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion getMitfahrer mit gefülltem Array
    // Rückgabewert ist ein Array mit Mitfahrer ID
    store.getMitfahrer({
        f_id     : req.body.f_id,
        e_id     : req.body.e_id
    }, function(err, id){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            // Aufruf der Funktion getName mit der "mitfahrer id"
            // Rückgabewert ist ein Array mit "namen" zu den "mitfahrer ids"
            store.getName(id, function(err, namen){
                if (err){
                    res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                }else{
                    // Aufruf der Funktion getPosition mit der "namen id"
                    // Rückgabewert ist ein Array mit "positionen" zu den "namen ids"
                    store.getPosition(namen, function(err, mitf_position){
                        if (err){
                            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                        }else{
                            res.status(200).send(JSON.stringify({ "state": 1, mitf_position:mitf_position }));
                        }
                    });
                }
            });
=======
app.post('/auto', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    store.auto({
        fid          : req.body.f_id,
        mid          : req.body.m_id,
        eid          : req.body.e_id
    }, function(err){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            res.status(200).send(JSON.stringify({ "state": 1, "message" : "erfolgreich" }));
>>>>>>> origin/master
        }
    });  
});
app.post('/abfahrtzeitpunkt', function(req, res){
    // Daten als JSON an die Applikation setzen
    res.setHeader('Content-Type', 'application/json');
    // Aufruf der Funktion getEventDestination mit der "event id"
    // Rückgabewert sind zwei Variablen mit Treffpunkt(Uhrzeit) und Zielort
    store.getEventDestination(req.body.e_id, function(err, destination, treffpunkt){
        if (err){
            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
        }else{
            // Aufruf der Funktion getDriverOrigin mit der "event id" und "fahrer id"
            // Rückgabewert die Variable Origin mit Fahrerposition
            store.getDriverOrigin({pid:req.body.p_id, eid:req.body.e_id}, function(err, origin){
                if (err){
                    res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                }else{
                    // Aufruf der Funktion getNeededTime mit der "fahrerposition" und dem "zielort"
                    // Rückgabewert ist die benötigte Zeit
                    store.getNeededTime(origin, destination, function(err, time){
                        if (err){
                            res.status(400).send(JSON.stringify({ "state": 0, "message" : err }));
                        }else{
<<<<<<< HEAD
                            // Berechnung des Abfahrtzeitpunkts für den Fahrer (mit Puffer)
=======
                            //var b = moment(time, "mm");
>>>>>>> origin/master
                            var abfahrt = moment(treffpunkt, "hh:mm").subtract(moment(time, "mm")).subtract(20, 'minute').format("hh:mm");
                            //c = moment(c, "hh:mm");
                            res.status(200).send(JSON.stringify({ "state": 1, abfahrt:abfahrt}));
                        }
                    });
                }
            });
        }
    }); 
});


<<<<<<< HEAD
//Starte Server mit der Portvariable
server.listen(port, function () {
	console.log('Der Server wurde mit dem Port '+port+' gestartet.');
});
=======
//Start Server on Port
server.listen(3000, function () {
	console.log('Der Server wurde mit dem Port 3000 gestartet.');
});
>>>>>>> origin/master
