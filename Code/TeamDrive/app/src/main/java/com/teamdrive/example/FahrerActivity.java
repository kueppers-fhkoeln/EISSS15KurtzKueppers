package com.teamdrive.example;

import android.content.Context;
import android.content.SharedPreferences;
import android.speech.tts.TextToSpeech;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;
import butterknife.ButterKnife;
import butterknife.InjectView;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

import java.util.List;
import java.util.Locale;


public class FahrerActivity extends ActionBarActivity implements TextToSpeech.OnInitListener {
/*
activity für den Fahrer
 */
    String user_id = "";
    String vorname = "";
    String name = "", email = "", aktuelleventid = "", emannschaft = "", ename = "", egegner = "", estrasse  = "", estadt = "", edatum = "";
    String euhrzeit = "", etreffpunkt = "", aktuellgemeldeteventid = "", gemeldetals = "";

    String USERID = "id",VORNAME = "vorname", NAME = "name", EMAIL = "email", EVENTID = "eventid";
    String AKTUELLEEVENTID = "aktuelleventid", EMANNSCHAFT = "emannschaft", ENAME = "eventname", EGEGNER = "egegner", ESTRASSE ="estrasse";
    String ESTADT = "estadt", EDATUM = "edatum", EUHRZEIT = "eurhzeit", ETREFFPUNKT = "etreffpunkt";
    String AKTUELLGMELDETEVENTID = "aktuellgemeldetevent", GEMELDETALS = "gemeldetals";

    SharedPreferences sharedPref;

    Context context;

    // Google Map
   /*
   google maps karte zum anzeigen der mitfahrer
    */
    private GoogleMap googleMap;

    /*liste der angekommenen nachrichten
     */
    List<Nachricht> eintragListe;

    private TextToSpeech tts;


    EintragListAdapter eintragListAdapter;

    @InjectView(R.id.listviewFahrerNachrichten)
    ListView lwnachrichten;

    DatabaseHelper db;

    /*
    funktion zum holen dr Nachrichten, wird alle 10 sekunden aufgerufen. bei erfolgreichem abruf wird die liste geleert und mit den neuen daten gefüllt. wenn mehr element als vorher drinen sind, also
    eine neue nachricht dazugekommen ist, wird die letzte vorgelesen.
     */
    public void holeNachrichten(){
        Ion.with(getApplicationContext())
                .load(serverUrl + "/getMessage")
                .setBodyParameter("f_id", user_id)
                .setBodyParameter("e_id", aktuelleventid)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {

                    @Override
                    public void onCompleted(Exception e, JsonObject result) {

                        int anzahlalt = 0;
                        if (eintragListe != null)
                            anzahlalt = eintragListe.size();
                        eintragListe = db.getEintraege(aktuelleventid);
                        eintragListe.clear();
                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            /*
                            hold das nachrichten array aus dem ergebnis
                             */
                            JsonArray nachrichtenarray = result.getAsJsonArray("nachrichten");
                            /*
                            iteriert über das array und legt tempprär ein nachrichten element an
                             */
                            for(int i = 0; i<nachrichtenarray.size(); i++){

                                Nachricht nachricht = new Nachricht(0, "event", "voranme", "datum",
                                        "nachmame","nein",
                                        nachrichtenarray.get(i).getAsJsonObject().get("mname").getAsString() + ": \n" +
                                                nachrichtenarray.get(i).getAsJsonObject().get("msg").getAsString());
                                eintragListe.add(nachricht);
                            }
                        }
                        //nachrichtenliste wird neu initialisert mit den neuen Nachrichten
                        setEintragList();
                        int anzahlneu = eintragListe.size();
                        /*
                        neue Nachricht wird vorgelsen
                         */
                        for (int i = anzahlalt; i < anzahlneu; i++){
                            tts.speak(eintragListe.get(i).getNachricht(), TextToSpeech.QUEUE_FLUSH, null);
                        }
                    }
                });
    }

    /*
    holt die Daten der Mitfahrer, wird auch alle 10 sekunden ausgeführt
     */
    public void holeMitfahrer(){
        Ion.with(getApplicationContext())
                .load(serverUrl + "/getMitfahrer")
                .setBodyParameter("f_id", user_id)
                .setBodyParameter("e_id", aktuelleventid)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {

                    @Override
                    public void onCompleted(Exception e, JsonObject result) {

                        int anzahlalt = 0;
                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            /*
                            holt namen und gps werte aus dem Ergebnis und zeigt diese auf der Karte an
                             */
                            JsonArray mitfahrer = result.getAsJsonArray("mitf_position");
                            for(int i = 0; i<mitfahrer.size(); i++){

                                double longitude = 0;
                                double latitude = 0;
                                if (mitfahrer.get(i).getAsJsonObject().has("longitude"))
                                 longitude= mitfahrer.get(i).getAsJsonObject().get("longitude").getAsDouble();
                                if (mitfahrer.get(i).getAsJsonObject().has("latitude"))
                                 latitude= mitfahrer.get(i).getAsJsonObject().get("latitude").getAsDouble();
                                String fahrername = mitfahrer.get(i).getAsJsonObject().get("mname").getAsString();
                                MarkerOptions marker = new MarkerOptions().position(new LatLng(latitude, longitude)).title(fahrername);
                                 if (latitude > 0)
                                googleMap.addMarker(marker);
                            }
                        }
                    }
                });
    }
    String serverUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fahrer);


        ButterKnife.inject(this);
        tts = new TextToSpeech(this, this);

        GlobalClass global = new GlobalClass();
        serverUrl = global.getServerip();

        context = this.getApplicationContext();
        sharedPref = context.getSharedPreferences(
                "prefs", Context.MODE_PRIVATE);

        db = new DatabaseHelper(context);

        try {
            // Loading map
            initilizeMap();

        } catch (Exception e) {
            e.printStackTrace();
        }
        googleMap.setMyLocationEnabled(true);
        googleMap.getUiSettings().setMyLocationButtonEnabled(true);
    }

    /*
    setzt die nachrichtenliste
    Adapter wird der Liste zugewisen und Nachrichtenlsite die geholt wurde übereben
     */
    private void setEintragList() {
        eintragListAdapter = new EintragListAdapter(this, R.layout.nachricht_item, eintragListe);
        lwnachrichten.setAdapter(eintragListAdapter);
        lwnachrichten.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                tts.speak(eintragListe.get(position).getNachricht(), TextToSpeech.QUEUE_FLUSH, null);
            }
        });

        lwnachrichten.setSelection(eintragListAdapter.getCount() - 1);
    }

    @Override
    public void onInit(int status) {

        if (status == TextToSpeech.SUCCESS) {

            int result = tts.setLanguage(Locale.GERMAN);

            if (result == TextToSpeech.LANG_MISSING_DATA
                    || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "This Language is not supported");
            } else {
//                btnSpeak.setEnabled(true);
//                speakOut();
            }

        } else {
            Log.e("TTS", "Initilization Failed!");
        }

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_fahrer, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    public void initializeDataFromSharedPref(){
        this.user_id = getFromPref(USERID);
        this.vorname = getFromPref(VORNAME);
        this.name = getFromPref(NAME);
        this.aktuelleventid = getFromPref(AKTUELLEEVENTID);
        this.emannschaft = getFromPref(EMANNSCHAFT);
        this.ename = getFromPref(ENAME);
        this.egegner = getFromPref(EGEGNER);
        this.estrasse = getFromPref(ESTRASSE);
        this.estadt = getFromPref(ESTADT);
        this.edatum = getFromPref(EDATUM);
        this.euhrzeit = getFromPref(EUHRZEIT);
        this.etreffpunkt = getFromPref(ETREFFPUNKT);
        this.aktuellgemeldeteventid = getFromPref(AKTUELLGMELDETEVENTID);
        this.gemeldetals = getFromPref(GEMELDETALS);

    }
    public String getFromPref(String key){
        return sharedPref.getString(key, "");
    }
    boolean ende = false;
    @Override
    protected void onResume() {
        super.onResume();
        initializeDataFromSharedPref();

        /*
        Thread der lle 10 sekunden mitfahrer und nachrichten holt wird gestartet.
        wenn die activity verlassen wird wird ende auf true gesetzt, und der thread somit beendet
         */
        Thread thread = new Thread(){
            public void run(){
                while(true){
                    holeNachrichten();

                    holeMitfahrer();
                    if (ende)
                        break;
                        try {
                            Thread.sleep(10000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }


        };
		thread.start();
        initilizeMap();
    }
    @Override
    protected void onPause() {
        super.onPause();
       ende = true;
        }

    /**
     * function to load map. If map is not created it will create it for you
     * */
    private void initilizeMap() {
        if (googleMap == null) {
            googleMap = ((MapFragment) getFragmentManager().findFragmentById(
                    R.id.map)).getMap();

            // check if map is created successfully or not
            if (googleMap == null) {
                Toast.makeText(getApplicationContext(),
                        "Sorry! unable to create maps", Toast.LENGTH_SHORT)
                        .show();
            }
        }
    }


}
