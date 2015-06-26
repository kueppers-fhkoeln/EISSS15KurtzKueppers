var store = require('./store.js');
var distance = require('google-distance');

var test_id  = "5581991f65135bf01999a408";
/* Was fehlt: vorherige Prüfung: zuviele Mitfahrer / zu wenige Fahrer muss seperat gemacht werden. Überlegen was bei zu vielen Fahrern ist.
Die Übertragung der var Fahrer.Mitfahrer in die Datenbank (das ist die entgültige Aufteilung) fehlt. Wo genau sollen die Fahrer.Mitfahrer (ist nen Array) gespeichert werden?
*/




var fill = {

Zuteilung: function(e_id, callback){

var Fahrer = [];
var Mitfahrer = [];


function ersteDBAbfrage(){
store.getAllEventDriver(e_id, function(err, driver){
    if (err){
        callback("Error");
    }
    else {
        //console.log("driver");
        //console.log(driver);
        driver.forEach(function(itemdriver){
            console.log("itemdriver._id");
            console.log(itemdriver._id);
            var plaetze = 4;  //die Abfrage funktinert noch nicht
            /*
            store.getPerson(itemdriver._id, function(err, user){
                if (err){
                    console.log(err);
                    plaetze = 5; //Achtung muss geändert werden, am besten kommen die Plätze in eine andere Collection
                    console.log("AnzahlPlätzt: "+ plaetze);
                }
                else {
                plaetze = user.per_sitzplaetze; 
                if (person.per_sitzplaetze == 0){
                    callback("Keine Sitzplärtzt-Fataler Fehler");
                };
                };
            }); */
            Fahrer.push({
                Fahrer_id: itemdriver._id,
                longitude: itemdriver.longitude,
                latitude:  itemdriver.latitude,
                FreiePlaetze: plaetze,
                Mitfahrer: []
            });

            });
    };
});
            
        //console.log("Fahrerarray");
        //console.log(Fahrer);
        //Fahrer[0].Mitfahrer.push({Mitfahrer_id:"test"});
        //console.log("Fahrer[0]: ");
        //console.log(Fahrer[0]);
 

store.getAllEventRider(test_id, function(err, rider){
    if (err){
        callback("Error");
    }
    else {
        //console.log("rider");
        //console.log(rider);
        rider.forEach(function(itemrider){
            Mitfahrer.push({
                Mitfahrer_id: itemrider._id,
                longitude: itemrider.longitude,
                latitude:  itemrider.latitude,
                Fahrer: []
            });
        });
        /*
        console.log("MitFahrerarray");
        console.log(Mitfahrer);
        Mitfahrer[0].Fahrer.push({Fahrer_id:"test"});
        console.log("MitFahrer[0]: ");
        console.log(Mitfahrer[0]);
        console.log("MitfaherermitArray");
        console.log(Mitfahrer);*/
    }
});
};

function distanzen(){
Mitfahrer.forEach(function(itemMitfahrer){
    var Ursprung = itemMitfahrer.latitude + ","+ itemMitfahrer.longitude;
    //console.log(Ursprung);
    Fahrer.forEach(function(itemFahrer){
        var Ziel = itemFahrer.latitude + "," + itemFahrer.longitude;
        
        distance.get(
            {
                origin: Ursprung, 
                destination: Ziel
            },
            function(err, data){
                if (err) {
                    return console.log("Error von Distacne: "+ err)
                }
                else {
                    //console.log("Data von Google: ");
                    //console.log(data);
                    itemMitfahrer.Fahrer.push({
                        Fahrer_id: itemFahrer.Fahrer_id,
                        Entfernung: data.durationValue
                    });
                    console.log("itemMitfahrer.Fahrer:s");
                    console.log(itemMitfahrer.Fahrer);
                }
            });

        });
    });
};

function ersterssortieren(){
Mitfahrer.forEach(function (itemMitfahrer) {  //Die Entfernungen des Mitfahrers zu den Fahreren werden von klein nach gro� sortiert.
itemMitfahrer.Fahrer.sort(function(a,b) {
        return a.Entfernung - b.Entfernung;   
});
itemMitfahrer.minEntfernung = itemMitfahrer.Fahrer[0].Entfernung; //Die minimalste Entfernung wird zur weiteren Verarbeitung seperat gespeichert.
console.log("itemMitfahrer");
console.log(itemMitfahrer);
});

Mitfahrer.sort(function(a,b) {  //Die Mitfahrer werden anhand ihrer minimalesten Entfernung zum n�chsten Fahrer von klein nach gro� sortiert.
     return a.minEntfernung - b.minEntfernung;

});
};
    
function zweitessortiern(){
Mitfahrer.forEach(function (itemM) {
    itemM.Fahrer.some(function (itemMF) {
        var Fahrer_id = itemMF.Fahrer_id
        console.log("itemMF.Fahrer_id"+Fahrer_id);
        Fahrer.some(function (itemF) {
            console.log("Fahrer.FAhrer_id"+itemF.Fahrer_id);
            if( (Fahrer_id == itemF.Fahrer_id) && (itemF.FreiePlaetze > 0) )
            {
                itemF.Mitfahrer.push(itemM.Mitfahrer_id);
                //console.log("Mitfahrer_ID"+itemM.Mitfahrer_id);
                console.log("ERfolgreiche Zuweisung");
                itemF.FreiePlaetze -=1;
                console.log("FreiePlatze: " +  itemF.FreiePlaetze);
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
function endausgabe(){
    console.log("________________________________________________________________________");
    console.log("Mitfahrer");
    console.log(Mitfahrer);
    console.log("Fahrer");
    console.log(Fahrer);
};

ersteDBAbfrage();
setTimeout(distanzen, 1000);
setTimeout(ersterssortieren,2000);
setTimeout(zweitessortiern,3000);
setTimeout(endausgabe, 4000);


}};

module.exports = fill;




        

/*
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