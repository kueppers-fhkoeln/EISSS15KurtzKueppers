package com.teamdrive.example;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;

import org.json.JSONException;
import org.json.JSONObject;

public class RegisterActivity extends Activity {
	ProgressDialog prgDialog;
	TextView errorMsg;
	EditText mannschaftET;
	EditText vornameET;
	EditText nachnameET;
    EditText telET;
    EditText mobilET;
    EditText emailET;
    EditText statusET;
    EditText strasseET;
    EditText stadtET;
    EditText plaetzeET;
    EditText userET;
    EditText pwdET;
    CheckBox cbxauto;
    String serverUrl;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.register);
		errorMsg = (TextView)findViewById(R.id.register_error);
        mannschaftET = (EditText)findViewById(R.id.registerMannschaft);
        vornameET = (EditText)findViewById(R.id.registerVorname);
        nachnameET = (EditText)findViewById(R.id.registerNachname);
        telET = (EditText)findViewById(R.id.registerTelefon);
        mobilET = (EditText)findViewById(R.id.registerMobile);
        emailET = (EditText)findViewById(R.id.registerEmail);
        statusET = (EditText)findViewById(R.id.registerStatus);
        strasseET = (EditText)findViewById(R.id.registerStrasse);
        stadtET = (EditText)findViewById(R.id.registerStadt);
        plaetzeET = (EditText)findViewById(R.id.registerPlaetze);
        cbxauto = (CheckBox)findViewById(R.id.checkrRegAuto);
        userET = (EditText)findViewById(R.id.registerBenutzername);
        pwdET = (EditText)findViewById(R.id.registerPasswort);
		prgDialog = new ProgressDialog(this);
        prgDialog.setMessage("Haben Sie einen moment Geduld...");
        prgDialog.setCancelable(false);

        GlobalClass global = new GlobalClass();
        serverUrl = global.getServerip();

        plaetzeET.setEnabled(false);
        cbxauto.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                plaetzeET.setEnabled(isChecked);
            }
        });
	}

	/**
	 * Ausgeführte Methode, wenn Registrieren gedrückt wird
	 */
	public void registerUser(View view){
		String mannschaft = mannschaftET.getText().toString();
		String vorname = vornameET.getText().toString();
		String nachname = nachnameET.getText().toString();
        String tel = telET.getText().toString();
        String mobile = mobilET.getText().toString();
        String email = emailET.getText().toString();
        String status = statusET.getText().toString();
        String strasse = strasseET.getText().toString();
        String stadt = stadtET.getText().toString();
        String auto = cbxauto.isChecked() ? "true" : "false";
        String plaetze =cbxauto.isChecked() ? plaetzeET.getText().toString() : "0";
        String user = userET.getText().toString();
        String pwd = pwdET.getText().toString();

		// Instanziert Http Request mit Paramater Object
		RequestParams params = new RequestParams();
		// Überprüft, ob Email String korrekt ist und die anderen String nicht " " sind
		if(Utility.isNotNull(mannschaft) && Utility.isNotNull(vorname) && Utility.isNotNull(nachname) && Utility.isNotNull(tel)
                && Utility.isNotNull(mobile) && Utility.isNotNull(email) && Utility.isNotNull(status) && Utility.isNotNull(strasse)
                && Utility.isNotNull(stadt) && Utility.isNotNull(auto) && Utility.isNotNull(plaetze) && Utility.isNotNull(user)
                && Utility.isNotNull(pwd)){
			// Ruft Email Validierung auf
			if(Utility.validate(email)){
				// Put Http Parameter von Edit Views
				params.put("mannschaft", mannschaft);
				params.put("vorname", vorname);
				params.put("nachname", nachname);
                params.put("telefon", tel);
                params.put("mobile", mobile);
                params.put("email", email);
                params.put("status", status);
                params.put("strasse", strasse);
                params.put("stadt", stadt);
                params.put("auto", auto);
                params.put("sitzplaetze", plaetze);
                params.put("benutzer", user);
                params.put("passwort", pwd);
				// Ruft RESTful Web Service mit Http Parametern auf
				invokeWS(params);
			}
			// Wenn Email nicht korrekt geschrieben wurde
			else{
				Toast.makeText(getApplicationContext(), "Bitte geben Sie eine korrekte E-Mail Adresse an", Toast.LENGTH_LONG).show();
			}
		} 
		// Wenn ein Edit View Feld leer ist
		else{
			Toast.makeText(getApplicationContext(), "Bitte fühlen Sie alle Felder aus", Toast.LENGTH_LONG).show();
		}
		
	}
	
	/**
	 * Methode für Aufruf des REST Webservices
	 */
	public void invokeWS(RequestParams params){
		// Zeige Progress Dialog
		prgDialog.show();
		// Erzeuge RESTful webservice Ruf mit einem AsyncHttpClient Objekt
		AsyncHttpClient client = new AsyncHttpClient();
        client.post(serverUrl + "/register",params ,new AsyncHttpResponseHandler() {
        	// Wenn der response Wert des REST Webservices 200 ist
             @Override
             public void onSuccess(String response) {
            	// Verstecke Progress Dialog
                 Log.d("response", response);
            	 prgDialog.hide();
                 try {
                	 	 // JSON Objekt
                         JSONObject obj = new JSONObject(response);
                         // When the JSON response has status boolean value assigned with true
                         if(obj.getBoolean("status")){
                        	 setDefaultValues();
                        	 Toast.makeText(getApplicationContext(), "Sie wurden erfolgreich registriert.", Toast.LENGTH_LONG).show();
                         } 
                         // Zeige Error Meldung
                         else{
                        	 errorMsg.setText(obj.getString("error_msg"));
                        	 Toast.makeText(getApplicationContext(), obj.getString("error_msg"), Toast.LENGTH_LONG).show();
                         }
                 } catch (JSONException e) {
                     // TODO Auto-generated catch block
                     Toast.makeText(getApplicationContext(), "Fehler aufgetreten (Server's JSON Antwort ist nicht valide)", Toast.LENGTH_LONG).show();
                     e.printStackTrace();
                     
                 }
             }
            // Wenn der response Wert des REST Webservices != 200 ist
             @Override
             public void onFailure(int statusCode, Throwable error,
                 String content) {
                 // Verstecke Progress Dialog
                 prgDialog.hide();
                 // Wenn Http response 404 ist
                 if(statusCode == 404){
                     Toast.makeText(getApplicationContext(), "Resource nicht gefunden.", Toast.LENGTH_LONG).show();
                 } 
                 // Wenn Http response 500 ist
                 else if(statusCode == 500){
                     Toast.makeText(getApplicationContext(), "Auf der Serverseite ist etwas schief gelaufen.", Toast.LENGTH_LONG).show();
                 } 
                 // Wenn Http response != 200, 404, 500
                 else{
                     Toast.makeText(getApplicationContext(), "Unerwarteter Fehler! (Wahrscheinlicher Fehler: Das Gerät ist nicht mit dem Internet verbunden oder Webservice läuft nicht)", Toast.LENGTH_LONG).show();
                 }
             }
         });
	}
	
	/**
	 * Methode navigiert von Register Activity zu Login Activity
	 */
	public void navigatetoLoginActivity(View view){
		Intent loginIntent = new Intent(getApplicationContext(),LoginActivity.class);
		loginIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(loginIntent);
	}
	
	/**
	 * Setze Default Werte für Edit Views
	 */
	public void setDefaultValues(){
		mannschaftET.setText("");
		vornameET.setText("");
		nachnameET.setText("");
        telET.setText("");
        mobilET.setText("");
        emailET.setText("");
        statusET.setText("");
        strasseET.setText("");
        stadtET.setText("");
        plaetzeET.setText("");
        userET.setText("");
        pwdET.setText("");
	}
}
