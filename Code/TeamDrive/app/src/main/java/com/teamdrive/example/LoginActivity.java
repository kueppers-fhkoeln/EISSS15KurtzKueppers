package com.teamdrive.example;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

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
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.login);
		errorMsg = (TextView)findViewById(R.id.login_error);
		userET = (EditText)findViewById(R.id.loginUser);
		pwdET = (EditText)findViewById(R.id.loginPasswort);
		prgDialog = new ProgressDialog(this);
        prgDialog.setMessage("Haben Sie einen moment Geduld...");
        prgDialog.setCancelable(false);
	}

	/**
	 * Ausgeführte Methode, wenn Login gedrückt wird
	 *
	 * @param view
	 */
	public void loginUser(View view){
		// Hole Edit View Werte
		String user = userET.getText().toString();
		String password = pwdET.getText().toString();
        // Instanziert Http Request mit Paramater Object
		RequestParams params = new RequestParams();
		// Wenn Edit Views != 0 sind
		if(Utility.isNotNull(user) && Utility.isNotNull(password)){
                // Put Http Parameter von Edit Views
				params.put("benutzer", user);
				params.put("passwort", password);
                // Ruft RESTful Web Service mit Http Parametern auf
				invokeWS(params);
		}
        // Wenn ein Edit View Feld leer ist
		else{
			Toast.makeText(getApplicationContext(), "Bitte fühlen Sie alle Felder aus", Toast.LENGTH_LONG).show();
		}

	}

	/**
	 * Methode für Aufruf des REST Webservices
	 *
	 * @param params
	 */
	public void invokeWS(RequestParams params){
		// Zeige Progress Dialog
		 prgDialog.show();
        // Erzeuge RESTful webservice Ruf mit einem AsyncHttpClient Objekt
		 AsyncHttpClient client = new AsyncHttpClient();
         client.post("http://192.168.178.207:3000/login",params ,new AsyncHttpResponseHandler() {
             // Wenn der response Wert des REST Webservices 200 ist
             @Override
             public void onSuccess(String response) {
            	 // Verstecke Progress Dialog
            	 prgDialog.hide();
                 try {
                	 	 // JSON Objekt
                         JSONObject obj = new JSONObject(response);
                         // When the JSON response has status boolean value assigned with true
                         if(obj.getBoolean("status")){
                        	 Toast.makeText(getApplicationContext(), "Anmeldedaten korrekt!", Toast.LENGTH_LONG).show();
                        	 // Navigiere zum Homescreen
                        	 navigatetoHomeActivity();
                         }
                         // Zeige Error Meldung
                         else{
                        	 errorMsg.setText(obj.getString("error_msg"));
                        	 Toast.makeText(getApplicationContext(), obj.getString("error_msg"), Toast.LENGTH_LONG).show();
                         }
                 } catch (JSONException e) {
                     // TODO Auto-generated catch block
                     Toast.makeText(getApplicationContext(), "Fehler aufgetreten (Server's JSON Antwort ist nicht valide)!", Toast.LENGTH_LONG).show();
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
                     Toast.makeText(getApplicationContext(), "Resource nicht gefunden", Toast.LENGTH_LONG).show();
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
     * Methode navigiert von Login Activity zu Home Activity
	 */
	public void navigatetoHomeActivity(){
		Intent homeIntent = new Intent(getApplicationContext(),HomeActivity.class);
		homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(homeIntent);
	}
	
	/**
	 * Method gets triggered when Register button is clicked
	 * 
	 * @param view
	 */
	public void navigatetoRegisterActivity(View view){
		Intent loginIntent = new Intent(getApplicationContext(),RegisterActivity.class);
		loginIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(loginIntent);
	}
	
}
