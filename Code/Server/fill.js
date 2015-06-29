var store = require('./store.js');
var distance = require('google-distance');


var fill = {
//Annahme: es sind genügend Fahrer bzw. Sitzplätze vorhanden
Zuteilung: function(mannschaft, callback){

var Fahrer = [];
var Mitfahrer = [];
var e_id;
    
/* Aufbau der beiden Variablen
 var Mitfahrer = [{
        Mitfahrer_id:'',
        longitude: '',
        latitude:  '',
        minEntfernung: '',
        fahrer: [{Fahrer_id:'', Entfernung: ''}]
    }];
            
    var Fahrer = [{
        Fahrer_id: '',
        longitude: '',
        latitude:  '',
        mitfahrer: [{Mitfahrer_id: ''}]*/
    
function getEvent_iD(){
    //Speichere die ID des nächsten Events in die Variable e_id
store.getActualEvent(mannschaft, function(err, event){
    if(err){
        callback("Error");
    }
    else{
        e_id = event[0]._id;
    };
});
};
        

function ersteDBAbfrage(){
store.getAllEventDriver(e_id, function(err, driver){
    if (err){
        callback("Error");
    }
    else {
        //Gehe alle Einträge in der Collection "Fahrer" durch...
        driver.forEach(function(itemdriver){
            //...Speicher mit der jeweiligen ID der Fahrer die Anzahl der Sitzplaetze (in der Collection Person enthalten)...
            store.getPerson(itemdriver.p_id.toString(), function(err, user){
                if (err){
                    callback(err);
                    console.log(err);
                }
                else {
                    //...in die Variale Fahrer sowie entsprechende weitere Werte des jweiligen Fahrers aus der Collection Fahrer
                    Fahrer.push({
                            Fahrer_id: itemdriver.p_id,
                            longitude: itemdriver.longitude,
                            latitude:  itemdriver.latitude,
                            FreiePlaetze: (user.per_sitzplaetze - 1),
                            Mitfahrer: []
                    });
                }
            });
            
        });
    };
});
       

store.getAllEventRider(e_id, function(err, rider){
    if (err){
        callback("Error");
    }
    else {
        //Speicher die entsprechenden Werte des Mitfahrers aus der Collection Mitfahrer in die Variable Mitfahrer
        rider.forEach(function(itemrider){
            Mitfahrer.push({
                Mitfahrer_id: itemrider.p_id,
                longitude: itemrider.longitude,
                latitude:  itemrider.latitude,
                Fahrer: []
            });
        });
    }
});
};

    //Berechne für jeden Mitfahrer die Distanz zu jedem Fahrer...
function distanzen(){
    //(Die Koordinaten des Mitfahrers und der Fahrer werden für die Google-Distance-Abfrage angepasst.)
Mitfahrer.forEach(function(itemMitfahrer){
    var Ursprung = itemMitfahrer.latitude + ","+ itemMitfahrer.longitude;
    Fahrer.forEach(function(itemFahrer){
        var Ziel = itemFahrer.latitude + "," + itemFahrer.longitude;
        //(Google-Distance-Abfrage)
        distance.get(
            {
                origin: Ursprung, 
                destination: Ziel
            },
            function(err, data){
                if (err) {
                    return err;
                }
                else {
                    //Speicher in dem Array Fahrer der Variable Mitfahrer [itemMitfahrer.Fahrer] alle Fahrer und die entsprechende zeitliche Entfernung
                    itemMitfahrer.Fahrer.push({
                        Fahrer_id: itemFahrer.Fahrer_id,
                        Entfernung: data.durationValue
                    });
                }
            });

        });
    });
};

function ersterssortieren(){
    //Die Entfernungen (in dem Array Fahrer der Variable Mitfahrer [itemMitfahrer.Fahrer]) des Mitfahrers zu den Fahreren werden von klein nach gross sortiert.
Mitfahrer.forEach(function (itemMitfahrer) {  
    itemMitfahrer.Fahrer.sort(function(a,b) {
            return a.Entfernung - b.Entfernung;   
    });
    //Die minimalste Entfernung wird zur weiteren Verarbeitung seperat gespeichert.
    itemMitfahrer.minEntfernung = itemMitfahrer.Fahrer[0].Entfernung; 
    });
    //Die Mitfahrer der Variable Mitfahrer werden anhand ihrer minimalesten Entfernung zum naechsten Fahrer von klein nach gross sortiert.
    Mitfahrer.sort(function(a,b) {  
         return a.minEntfernung - b.minEntfernung;
});
};
    
function zweitessortiern(){
    //Jeder Mitfahrer der Variable Mitfahrer [itemMitfahrer] wird dem Fahrer mit der jeweils geringsten Entfernung zugewiesen...
Mitfahrer.forEach(function (itemMitfahrer) {
    //(Dafür werden die Fahrer des Arrays Fahrer aus der Variable Mitfahrer[itemMitfahrerFahrer] durchgegangen)
    itemMitfahrer.Fahrer.some(function (itemMitfahrerFahrer) {
        var Fahrer_id = itemMitfahrerFahrer.Fahrer_id
        Fahrer.some(function (itemFahrer) {
            //...wenn der Fahrer noch freie Plätze hat, sonst wird der naeste Fahrer gewählt  (Bei Erfolgreicher Zuweisung werden die beiden some-Schleife jeweils vorzeitg beendet)
            if( (Fahrer_id == itemFahrer.Fahrer_id) && (itemFahrer.FreiePlaetze > 0) )
            {
                //Der Mitfahrer werden in dem Array Mitfahrer der Variable Fahrer [itemFahrer.Mitfahrer] gespeichert und die Anzahl der freien Sitzplaezte verringert.
                itemFahrer.Mitfahrer.push(itemMitfahrer.Mitfahrer_id);
                itemFahrer.FreiePlaetze -=1;
                return true;
            }
            else 
            {
                //delete itemM.Fahrer[Index];
            }
                
        });
        return true;
       });
});
};

function SpeichernDB(){
    //Speicher für jeden Fahrer aus der Variable Fahrer...
Fahrer.forEach(function (itemFahrer) {
    //...und jeden seiner Mitfahrer [itemFahrerMitfahrer]...
    itemFahrer.Mitfahrer.forEach(function (itemFahrerMitfahrer) {
        //... in der Collection Auto die Fahrer_id, die Mitfahrer_id und die Event_id. 
        store.saveAuto(itemFahrer.Fahrer_id,itemFahrerMitfahrer, e_id, function(err, callback){
            if (err){
                err;
            } else { 
                callback;
            }
        });
    });
});
};
 /* Gibt die beiden Variablen Mitfahrer und Fahrer aus (nur für Tests)  
function ausgabe(){
    console.log("________________________________________________________________________");
    console.log("Mitfahrer");
    console.log(Mitfahrer);
    console.log("Fahrer");
    console.log(Fahrer);
};*/

//Da die Funktionen in der festgelegten Reihenfolge ablaufen müssen wurden setTimeouts benutzt    
getEvent_iD();
setTimeout(ersteDBAbfrage, 500);    
setTimeout(distanzen, 1000);
setTimeout(ersterssortieren,2000);
setTimeout(zweitessortiern,3000);
setTimeout(SpeichernDB,4000);    
setTimeout(ausgabe, 5000);


}};

module.exports = fill;