package com.teamdrive.example;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import butterknife.ButterKnife;
import butterknife.InjectView;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;


public class FahrtActivity extends ActionBarActivity {

    @InjectView(R.id.txtFahrtEventname)
    TextView txtName;

    @InjectView(R.id.txtFahrtGegener)
    TextView txtGegner;
    @InjectView(R.id.txtFahrtZeitpunkt)
    TextView txtDatum;
    @InjectView(R.id.txtFahrtstadt)
    TextView txtStadt;
    @InjectView(R.id.txtFahrtStrasse)
    TextView txtStrasse;
    @InjectView(R.id.txtFahrtTreffpunkt)
    TextView txtTreffpunkt;

    SharedPreferences sharedPref;

    Context context;


    @InjectView(R.id.btnFahrtMitfahrer)
    Button btnMitfahrer;
    @InjectView(R.id.btnFahrtfahrer)
    Button btnGahrer;

    boolean auto;
    String user_id = "";
    String vorname = "";
    String name = "", email = "", aktuelleventid = "", emannschaft = "", ename = "", egegner = "", estrasse  = "", estadt = "", edatum = "";
    String euhrzeit = "", etreffpunkt = "", aktuellgemeldeteventid = "", gemeldetals = "";

    String USERID = "id",VORNAME = "vorname", NAME = "name", EMAIL = "email", EVENTID = "eventid";
    String AKTUELLEEVENTID = "aktuelleventid", EMANNSCHAFT = "emannschaft", ENAME = "eventname", EGEGNER = "egegner", ESTRASSE ="estrasse";
    String ESTADT = "estadt", EDATUM = "edatum", EUHRZEIT = "eurhzeit", ETREFFPUNKT = "etreffpunkt";
    String AKTUELLGMELDETEVENTID = "aktuellgemeldetevent", GEMELDETALS = "gemeldetals",  AUTO = "auto";


    String serverUrl;
    @Override
    protected void onResume() {
        super.onResume();

        this.initializeDataFromSharedPref();
        initializeButtons();

        GlobalClass global = new GlobalClass();
        serverUrl = global.getServerip();
    }

    private void anmeldenalsfahrer(){
        Ion.with(getApplicationContext())
                .load(serverUrl + "/fahrtauswahl")
                .setBodyParameter("p_id", this.user_id)
                .setBodyParameter("e_id", this.aktuelleventid)
                .setBodyParameter("status", "true")
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            SharedPreferences.Editor editor = sharedPref.edit();
                            editor.putString(AKTUELLGMELDETEVENTID, aktuelleventid);
                            editor.putString(GEMELDETALS, "fahrer");
                            editor.commit();
                            finish();
                        }else if(state == 0){
                            Toast.makeText(context, result.get("message").getAsString(), Toast.LENGTH_LONG).show();
                        }
                    }
                });
    }
    private void anmeldenalsmitfahrer(){
        Ion.with(getApplicationContext())
                .load(serverUrl + "/fahrtauswahl")
                .setBodyParameter("p_id", this.user_id)
                .setBodyParameter("e_id", this.aktuelleventid)
                .setBodyParameter("status", "false")
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        int state = result.get("state").getAsInt();
                        if (state == 1)//successfull, do stuff
                        {
                            SharedPreferences.Editor editor = sharedPref.edit();
                            editor.putString(AKTUELLGMELDETEVENTID, aktuelleventid);
                            editor.putString(GEMELDETALS, "mitfahrer");
                            editor.commit();
                            finish();
                        } else if (state == 0) {
                            Toast.makeText(context, result.get("message").getAsString(), Toast.LENGTH_LONG).show();
                        }
                    }
                });

    }
    private void initializeButtons(){

        if (auto){
            btnGahrer.setEnabled(true);
            btnGahrer.setBackgroundColor(Color.parseColor("#00e7e9"));
        }else{
            btnGahrer.setEnabled(false);
            btnGahrer.setBackgroundColor(Color.parseColor("#e6e7e9"));
        }
        btnMitfahrer.setBackgroundColor(Color.parseColor("#00e7e9"));

        if (aktuelleventid.equals(aktuellgemeldeteventid)){
            btnGahrer.setEnabled(false);
            btnGahrer.setBackgroundColor(Color.parseColor("#e6e7e9"));
            btnMitfahrer.setEnabled(false);
            btnMitfahrer.setBackgroundColor(Color.parseColor("#e6e7e9"));
        }
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

        this.txtName.setText(this.ename);
        this.txtGegner.setText(this.egegner);
        this.txtStadt.setText(this.estadt);
        this.txtStrasse.setText(this.estrasse);
        this.txtTreffpunkt.setText(this.etreffpunkt);
        this.txtDatum.setText(this.edatum + " " + this.euhrzeit);

        this.auto = sharedPref.getBoolean(AUTO, false);

    }

    public String getFromPref(String key){
        return sharedPref.getString(key, "");
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fahrt);


        ButterKnife.inject(this);

        context = this.getApplicationContext();
        sharedPref = context.getSharedPreferences(
                "prefs", Context.MODE_PRIVATE);

        btnMitfahrer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                new AlertDialog.Builder(FahrtActivity.this)
                        .setMessage(getString(R.string.confirm_anmelden_fahrer))
                        .setCancelable(false)
                        .setPositiveButton("Ja", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {

                                anmeldenalsmitfahrer();
                            }
                        })
                        .setNegativeButton("Nein", null)
                        .show();
            }
        });
        btnGahrer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new AlertDialog.Builder(FahrtActivity.this)
                        .setMessage(getString(R.string.confirm_anmelden_fahrer_text))
                        .setCancelable(false)
                        .setPositiveButton("Ja", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {

                                anmeldenalsfahrer();
                            }
                        })
                        .setNegativeButton("Nein", null)
                        .show();

            }
        });
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_fahrt, menu);
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
}
