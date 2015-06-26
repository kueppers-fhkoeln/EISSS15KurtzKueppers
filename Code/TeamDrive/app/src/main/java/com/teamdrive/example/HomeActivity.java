package com.teamdrive.example;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import butterknife.ButterKnife;
import butterknife.InjectView;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;
import org.w3c.dom.Text;

public class HomeActivity extends Activity {


	GPSTracker gps;

	@InjectView(R.id.txtHomeNachricht)
	TextView txtNachricht;

	@InjectView(R.id.btnHomeFartMenu)
	Button btnFahrtMenu;
	@InjectView(R.id.btnHomeFahrerMenu)
	Button btnFahrerMenu;
	@InjectView(R.id.btnHomeMitfahrerMenu)
	Button btnMitfahrerMenu;

	@InjectView(R.id.btnHomeLogout)
	Button btnAbmelden;

	String user_id = "";
	String vorname = "";
	String name = "", email = "", aktuelleventid = "", emannschaft = "", ename = "", egegner = "", estrasse  = "", estadt = "", edatum = "";
	String euhrzeit = "", etreffpunkt = "", aktuellgemeldeteventid = "", gemeldetals = "";
	String serverUrl;

	/*
	buttons werden initialisert, wenn als fahrer angemldet wird das Mitfahrermenü deakiviert, wenn als Mitfahrer angemeldet wird das Fahrermenü aktibiert.
	status gespeicehrt in sharedPreferences, wird bei jedem aufruf der activity gemacht
	 */
	private void initializeButtons(){
		if (this.aktuelleventid.equals(aktuellgemeldeteventid)){ // schon angemeldet, fahrtmen nciht aktiv,

			if (this.gemeldetals.equals("fahrer")){
				btnMitfahrerMenu.setEnabled(false);
				btnMitfahrerMenu.setBackgroundColor(Color.parseColor("#e6e7e9"));
				btnFahrerMenu.setEnabled(true);
				btnFahrerMenu.setBackgroundColor(Color.parseColor("#00e7e9"));

			}else{
				btnMitfahrerMenu.setEnabled(true);
				btnMitfahrerMenu.setBackgroundColor(Color.parseColor("#00e7e9"));
				btnFahrerMenu.setEnabled(false);
				btnFahrerMenu.setBackgroundColor(Color.parseColor("#e6e7e9"));
			}
		}else{
			btnFahrtMenu.setEnabled(true);
			btnFahrtMenu.setBackgroundColor(Color.parseColor("#00e7e9"));
			btnMitfahrerMenu.setEnabled(false);
			btnMitfahrerMenu.setBackgroundColor(Color.parseColor("#e6e7e9"));
			btnFahrerMenu.setEnabled(false);
			btnFahrerMenu.setBackgroundColor(Color.parseColor("#e6e7e9"));
		}
	}
	/*
	holt die Daten von shared Preferences für diese activity
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
	/*
	hilfsfunktion
	 */
	public String getFromPref(String key){
			return sharedPref.getString(key, "");
	}

	String USERID = "id",VORNAME = "vorname", NAME = "name", EMAIL = "email", EVENTID = "eventid";
	String AKTUELLEEVENTID = "aktuelleventid", EMANNSCHAFT = "emannschaft", ENAME = "eventname", EGEGNER = "egegner", ESTRASSE ="estrasse";
	String ESTADT = "estadt", EDATUM = "edatum", EUHRZEIT = "eurhzeit", ETREFFPUNKT = "etreffpunkt";
	String AKTUELLGMELDETEVENTID = "aktuellgemeldetevent", GEMELDETALS = "gemeldetals";


	SharedPreferences sharedPref;

	Context context;

	@Override
	protected void onResume() {
		super.onResume();
		this.initializeDataFromSharedPref();

		this.txtNachricht.setText("Willkommen " + this.vorname);


		initializeButtons();
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//Zeige Homescreen
		setContentView(R.layout.home);
		ButterKnife.inject(this);

		GlobalClass global = new GlobalClass();
		serverUrl = global.getServerip();

		context = this.getApplicationContext();
		sharedPref = context.getSharedPreferences(
				"prefs", Context.MODE_PRIVATE);


//				navigatetoFahrerActivity();
		gps = new GPSTracker(HomeActivity.this);

		if (!gps.canGetLocation){
			gps.showSettingsAlert();
		}
		/*
		thread zum logging der Güs daten,
		wenn zum akzuellen event angemelet, wird gelogggt. dieser thread beendet sich nicht, läuft also in allen activitys solange die app läuft
		 */
		Thread thread = new Thread(){
			public void run(){
				while(true){
					if (aktuelleventid.equals(aktuellgemeldeteventid)){
						Log.d("abfrage",Boolean.toString(aktuelleventid.equals(aktuellgemeldeteventid)) );
					if (gps.canGetLocation && !gemeldetals.equals("")){
						Log.d("aktuelles event", aktuelleventid);
						Log.d("angemeldet bei", aktuellgemeldeteventid);
						Log.d("gps", "update");
						double latitude = gps.getLatitude();
						double longitude = gps.getLongitude();
						Log.d("lat", +latitude + "");
						Log.d("long", longitude + "");
						Ion.with(getApplicationContext())
								.load(serverUrl + "/sendGPS")
								.setBodyParameter("p_id", user_id)
								.setBodyParameter("e_id", aktuelleventid)
								.setBodyParameter("longitude", longitude + "")
								.setBodyParameter("latitude", latitude + "")
								.asJsonObject();

					}

					}
					try {
						Thread.sleep(60000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}

			}
		};
		thread.start();

		/*s
		funktionen für die Buttons
		 */
		btnAbmelden.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				quit();
			}
		});

		btnFahrerMenu.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				navigatetoFahrerActivity();
			}
		});
		btnFahrtMenu.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				navigatetoMenueActivity();
			}
		});
		btnMitfahrerMenu.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				navigatetoMitfahrerActivity();
			}
		});
	}
	public void quit() {
		int pid = android.os.Process.myPid();
		android.os.Process.killProcess(pid);
		System.exit(0);
	}

	/**
	 * Methode navigiert von Home Activity zu Menue Activity
	 */
	public void navigatetoMenueActivity(){
		Intent menueIntent = new Intent(getApplicationContext(),FahrtActivity.class);
//		menueIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(menueIntent);
	}

	/**
	 * Methode navigiert von Home Activity zu Fahrer Activity
	 *
	 */
	public void navigatetoFahrerActivity(){
		Intent fahrerIntent = new Intent(getApplicationContext(),FahrerActivity.class);
//		fahrerIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(fahrerIntent);
	}
	/**
	 * Methode navigiert von Home Activity zu Mitfahrer Activity
	 *
	*/
	public void navigatetoMitfahrerActivity(){
		Intent mitfahrerIntent = new Intent(getApplicationContext(),MitfahrerActivity.class);
		mitfahrerIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(mitfahrerIntent);
	}

}
