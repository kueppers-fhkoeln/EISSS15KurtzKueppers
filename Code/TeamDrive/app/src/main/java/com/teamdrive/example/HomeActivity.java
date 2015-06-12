package com.teamdrive.example;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class HomeActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//Zeige Homescreen
		setContentView(R.layout.home);
	}

	/**
	 * Methode navigiert von Home Activity zu Menue Activity
	 */
	public void navigatetoMenueActivity(){
		Intent menueIntent = new Intent(getApplicationContext(),MenueActivity.class);
		menueIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(menueIntent);
	}

	/**
	 * Methode navigiert von Home Activity zu Fahrer Activity
	 *
	 * @param view
	 */
	public void navigatetoFahrerActivity(View view){
		Intent fahrerIntent = new Intent(getApplicationContext(),FahrerActivity.class);
		fahrerIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(fahrerIntent);
	}
	/**
	 * Methode navigiert von Home Activity zu Mitfahrer Activity
	 *
	 * @param view
	 */
	public void navigatetoMitfahrerActivity(View view){
		Intent mitfahrerIntent = new Intent(getApplicationContext(),MitfahrerActivity.class);
		mitfahrerIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		startActivity(mitfahrerIntent);
	}

}
