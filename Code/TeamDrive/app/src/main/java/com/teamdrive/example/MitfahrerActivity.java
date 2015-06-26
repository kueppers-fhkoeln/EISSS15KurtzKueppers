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
import android.widget.*;
import butterknife.ButterKnife;
import butterknife.InjectView;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;
import org.w3c.dom.Text;

import java.util.List;
import java.util.Locale;


public class MitfahrerActivity extends ActionBarActivity  implements TextToSpeech.OnInitListener {


    /*
    Mitfahrermenü
     */
    private TextToSpeech tts;


    SharedPreferences sharedPref;

    Context context;

    @InjectView(R.id.btn_mitfahrermenu_senden)
    Button sendenButton;


    List<Nachricht> eintragListe;


    EintragListAdapter eintragListAdapter;

    @InjectView(R.id.txtMitfahrerName)
    TextView txtName;

    @InjectView(R.id.edtMitfaherNachricht)
    EditText edtnachricht;

    @InjectView(R.id.lwMitfahrerachrichten)
    ListView lwnachrichten;
    String message = "";

    String serverUrl;
    String user_id = "";
    String vorname = "";
    String name = "", email = "", aktuelleventid = "", emannschaft = "", ename = "", egegner = "", estrasse  = "", estadt = "", edatum = "";
    String euhrzeit = "", etreffpunkt = "", aktuellgemeldeteventid = "", gemeldetals = "";

    String USERID = "id",VORNAME = "vorname", NAME = "name", EMAIL = "email", EVENTID = "eventid";
    String AKTUELLEEVENTID = "aktuelleventid", EMANNSCHAFT = "emannschaft", ENAME = "eventname", EGEGNER = "egegner", ESTRASSE ="estrasse";
    String ESTADT = "estadt", EDATUM = "edatum", EUHRZEIT = "eurhzeit", ETREFFPUNKT = "etreffpunkt";
    String AKTUELLGMELDETEVENTID = "aktuellgemeldetevent", GEMELDETALS = "gemeldetals";

    DatabaseHelper db;
    String fvorname = "", fnachname = "", f_id = "";
    boolean cansend = false;

    /*
    beim start muss erstmal der Fahrer ermittelt werden. nur wenn das gelingt könen nachrichten gesendet werden
     */
    public void getFahrer(){
        Log.d("p_id", user_id);
        Log.d("e_id", aktuelleventid);
        Ion.with(getApplicationContext())
                .load(serverUrl + "/getDriver")
                .setBodyParameter("p_id", user_id)
                .setBodyParameter("e_id", aktuelleventid)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {



                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            fvorname = result.getAsJsonObject("driver").get("vorname").getAsString();
                            fnachname= result.getAsJsonObject("driver").get("nachname").getAsString();
                            f_id= result.getAsJsonObject("driver").get("f_id").getAsString();
                            txtName.setText(fvorname + " " + fnachname);
                            cansend = true;
                        }

                        initializeDataFromSharedPref();
                    }
                });
    }
    private void setEintragList() {
        DatabaseHelper db = new DatabaseHelper(context);
        eintragListe = db.getEintraege(aktuelleventid);

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

    /*
    funktion zum senden der nachrichten
     */

    public void sendMessage(){
        message = edtnachricht.getText().toString();
        Ion.with(getApplicationContext())
                .load(serverUrl + "/sendMessage")
                .setBodyParameter("p_id", user_id)
                .setBodyParameter("f_id", f_id)
                .setBodyParameter("e_id", aktuelleventid)
                .setBodyParameter("msg", message)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {

                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            Log.d("erfolgreich", "erfolgreich");
                            edtnachricht.setText("");
                            Nachricht nachricht = new Nachricht(0, aktuelleventid, fvorname,"", fnachname, "ja", message);
                            db.createnachricht(nachricht);
                            //update listview
                        }
                        setEintragList();
                        /*
                        wenn fertig, kann weiter gesendet werden
                         */
                        cansend = true;
                    }
                });
    }

    @Override
    protected void onResume() {
        super.onResume();
        cansend = false;
        initializeDataFromSharedPref();
        getFahrer();
        setEintragList();

        /*
        sendenbutton. kann nur gedrückt werden wenn senden = true, also wenn fahrer geholt wurde, und alte nachricht erfolgreich versendet wurde, bzw fehlgeschlagen ist
         */
        sendenButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(cansend){
                    cansend = false;
                    sendMessage();
                }
            }
        });
    }

    /*
    holt daten von sharedPreferences für diese activty
     */

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
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mitfahrer);

        GlobalClass global = new GlobalClass();
        serverUrl = global.getServerip();

        ButterKnife.inject(this);
        tts = new TextToSpeech(this, this);

        context = this.getApplicationContext();
        sharedPref = context.getSharedPreferences(
                "prefs", Context.MODE_PRIVATE);

        db = new DatabaseHelper(context);
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_mitfahrer, menu);
        return true;
    }
    @Override
    public void onDestroy() {
        // Don't forget to shutdown tts!
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
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

    private void speakOut() {

//        String text = txtText.getText().toString();

//        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
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
}
