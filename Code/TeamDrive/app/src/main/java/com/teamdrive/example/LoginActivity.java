package com.teamdrive.example;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;

import org.json.JSONException;
import org.json.JSONObject;

public class LoginActivity extends Activity {
    ProgressDialog prgDialog;
    TextView errorMsg;
    EditText userET;
    EditText pwdET;


    /*
    loginactivity
     */
    SharedPreferences sharedPref;
    Context context;

    String serverUrl = "";

    String USERID = "id",VORNAME = "vorname", NAME = "name", EMAIL = "email", EVENTID = "eventid";
    String AKTUELLEEVENTID = "aktuelleventid", EMANNSCHAFT = "emannschaft", ENAME = "eventname", EGEGNER = "egegner", ESTRASSE ="estrasse";
    String ESTADT = "estadt", EDATUM = "edatum", EUHRZEIT = "eurhzeit", ETREFFPUNKT = "etreffpunkt";
    String AKTUELLGMELDETEVENTID = "aktuellgemeldetevent", GEMELDETALS = "gemeldetals", AUTO = "auto";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);
        errorMsg = (TextView) findViewById(R.id.login_error);
        userET = (EditText) findViewById(R.id.loginUser);
        pwdET = (EditText) findViewById(R.id.loginPasswort);
        prgDialog = new ProgressDialog(this);
        prgDialog.setMessage("Haben Sie einen moment Geduld...");
        prgDialog.setCancelable(false);

        GlobalClass global = new GlobalClass();
        serverUrl = global.getServerip();

        context = this.getApplicationContext();
        sharedPref = context.getSharedPreferences(
                "prefs", Context.MODE_PRIVATE);
    }

    /**
     * Ausgeführte Methode, wenn Login gedrückt wird
     */

    /*
    funktion zum einloggen von user
     */
    public void loginUser(View view) {
        // Hole Edit View Werte
        String user = userET.getText().toString();
        String password = pwdET.getText().toString();
        // Instanziert Http Request mit Paramater Object
        // Wenn Edit Views != 0 sind
        if (Utility.isNotNull(user) && Utility.isNotNull(password)) {
            JsonObject json = new JsonObject();
            json.addProperty("benutzer", user);
            json.addProperty("passowort", password);
            final Context context = this.getApplicationContext();

            Ion.with(getApplicationContext())
                    .load(serverUrl + "/login")
                    .setBodyParameter("benutzer", user)
                    .setBodyParameter("passwort", password)
                    .asJsonObject()
                    .setCallback(new FutureCallback<JsonObject>() {
                        @Override
                        public void onCompleted(Exception e, JsonObject result) {

                            prgDialog.hide();
                            int state = result.get("state").getAsInt();
                            /*
                            wenn state = 1, ist der login erfolgreich, die daten (fahrerdaten, eventdaten, angemeldet status) werden in sharedpreferences gespeichert und i den anderen activitys ausgelesen
                             */
                            if (state == 1)//successfull, do stuff
                            {
                                int eventstate = result.get("status").getAsInt();
                                //den ganzen kram speichern, vorerst nur in shared preferences
                                saveToSharedPref(result.getAsJsonObject("person"), result.getAsJsonObject("event"), eventstate);
                                navigatetoHomeActivity();
                            } else {//login failed, show errormessage
                                Toast.makeText(getApplicationContext(), result.get("message").getAsString(), Toast.LENGTH_SHORT).show();
                            }
                        }
                    });
        }
        // Wenn ein Edit View Feld leer ist
        else {
            Toast.makeText(getApplicationContext(), "Bitte füllen Sie alle Felder aus", Toast.LENGTH_LONG).show();
        }

    }

    private void saveToSharedPref(JsonObject result, JsonObject event, int eventstatus) {

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(USERID, result.get("_id").getAsString());
        editor.putString("mannschaft", result.get("per_mannschaft").getAsString());
        editor.putString(VORNAME, result.get("per_vorname").getAsString());
        editor.putString(NAME, result.get("per_name").getAsString());
//        editor.putString("tel", result.get("per_tel").getAsString());
        editor.putString("mobil", result.get("per_mobil").getAsString());
//        editor.putString(EMAIL, result.get("per_email").getAsString());
        editor.putString("status", result.get("per_status").getAsString());
        editor.putString("stadt", result.get("per_stadt").getAsString());
        editor.putBoolean(AUTO, result.get("per_auto").getAsBoolean());
        editor.putString("benutzer", result.get("per_benutzer").getAsString());
        editor.putString("pw", result.get("per_pw").getAsString());

        //TODO: unbedingt wieder entfernen, dient zum testen
//        editor.putString(GEMELDETALS, "fahrer");
//        editor.putString(AKTUELLGMELDETEVENTID, event.get("_id").getAsString());



        editor.putString(AKTUELLEEVENTID, event.get("_id").getAsString());
        editor.putString(EMANNSCHAFT, event.get("e_mannschaft").getAsString());
        editor.putString(ENAME, event.get("e_eventname").getAsString());
        editor.putString(EGEGNER, event.get("e_gegner").getAsString());
        editor.putString(ESTRASSE, event.get("e_strasse").getAsString());
        editor.putString(ESTADT, event.get("e_stadt").getAsString());
        editor.putString(EDATUM, event.get("e_datum").getAsString());
        editor.putString(EUHRZEIT, event.get("e_uhrzeit").getAsString());
        editor.putString(ETREFFPUNKT, event.get("e_treffpunkt").getAsString());


        if (eventstatus == 0){
            editor.putString(GEMELDETALS, "");
            editor.putString(AKTUELLGMELDETEVENTID, "");
        }else if (eventstatus == 1) {
            editor.putString(GEMELDETALS, "fahrer");
            editor.putString(AKTUELLGMELDETEVENTID, event.get("_id").getAsString());
        }else {
            editor.putString(GEMELDETALS, "mitfahrer");
            editor.putString(AKTUELLGMELDETEVENTID, event.get("_id").getAsString());
        }

        editor.commit();

    }

    /**
     * Methode navigiert von Login Activity zu Home Activity
     */
    public void navigatetoHomeActivity() {
        Intent homeIntent = new Intent(getApplicationContext(), HomeActivity.class);
//        homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(homeIntent);
        finish();
    }

    /**
     * Method gets triggered when Register button is clicked
     *
     * @param view
     */
    public void navigatetoRegisterActivity(View view) {
        Intent loginIntent = new Intent(getApplicationContext(), RegisterActivity.class);
        loginIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(loginIntent);
    }

}
