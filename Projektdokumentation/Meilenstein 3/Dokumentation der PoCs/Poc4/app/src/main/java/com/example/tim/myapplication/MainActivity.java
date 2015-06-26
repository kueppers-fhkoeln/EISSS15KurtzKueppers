package com.example.tim.myapplication;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.util.Log;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import com.example.tim.myapplication.User;


public class MainActivity extends ActionBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
    public void buttonOnClick(View v) {

        //Peronen mit Bezeichung und einem Prioritätsstatus werden erstellt( 1 > 2)
        User Person1 = new User("Trainer", 1);
        User Person2 = new User("Spieler1", 1);
        User Person3 = new User("Spieler2", 1);
        User Person4 = new User("Spieler3", 1);
        User Person5 = new User("Spieler4", 1);
        User Person6 = new User("Fan1", 2);
        User Person7 = new User("Fan2", 2);

        //Die Persoen werden in eine ArrayList geladen.
        List<User> user = new ArrayList<User>();
        user.add(Person1);
        user.add(Person2);
        user.add(Person3);
        user.add(Person4);
        user.add(Person5);
        user.add(Person6);
        user.add(Person7);

        //Die Anzahl der Sitze wird eingelesen.
        EditText Eingabe = (EditText) findViewById(R.id.editText);
        Integer AnzahlSitze = Integer.parseInt(Eingabe.getText().toString());

        String Ausgabe = "";
        Integer AnzahlStatus2 = 0;
        Integer AnzahlPersonen = user.size();

        //Erstellung der Ausgabe in Abhängigkeit der Anzahl der Sitze, Anzahl der Personen und deren Status
        if (AnzahlSitze >= AnzahlPersonen) {
            Ausgabe = "Es koennen alle mitfahren.";
        } else if (AnzahlSitze < AnzahlPersonen) {
            for (User ausgabe : user) {
                if (ausgabe.getStatus() >= 2) {
                    AnzahlStatus2 += 1;
                }
            }
            if ((AnzahlPersonen - AnzahlStatus2) > AnzahlSitze) {
                Ausgabe = "Es werden zusaetzliche Sitzplaetze benoetigt.";
            }else if ((AnzahlPersonen - AnzahlStatus2) == AnzahlSitze) {
                Ausgabe = "Es koennen nur Spieler mitfahren, aber keine Fans.";
            } else if ((AnzahlPersonen - (AnzahlStatus2 - 1)) == AnzahlSitze) {
                Ausgabe = "Es koennen alle Spieler aber nicht alle Fans mitfahren.";
            }

        }
        //Ausgabe
        TextView myTextView = (TextView) findViewById(R.id.textView2);
        myTextView.setText(Ausgabe);
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
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
