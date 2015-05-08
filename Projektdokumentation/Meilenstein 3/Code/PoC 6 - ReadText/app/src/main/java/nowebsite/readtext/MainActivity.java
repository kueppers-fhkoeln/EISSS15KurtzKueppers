package nowebsite.readtext;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

public class MainActivity extends Activity{
    private Button speakNowButton;
    private EditText editText;
    TTSManager ttsManager = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AlertDialog alertDialog = new AlertDialog.Builder(this).create();
        alertDialog.setTitle("Gefahrenhinweis!");
        alertDialog.setMessage("Das Handy am Steuer zu benutzen, ist nicht gestattet. Autofahrer, die telefonieren oder simsen, können sich nicht ausreichend auf das Verkehrsgeschehen konzentrieren. Deswegen fallen Bußgelder an. Über eine Freisprecheinrichtung dürfen Autofahrer jedoch während der Fahrt telefonieren.");
        alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {

            }
        });
        alertDialog.show();

        setContentView(R.layout.activity_main);

        ttsManager = new TTSManager();
        ttsManager.init(this);

        editText = (EditText) findViewById(R.id.input_text);
        speakNowButton = (Button) findViewById(R.id.speak_now);
        speakNowButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View arg0) {
                String text = editText.getText().toString();
                ttsManager.initQueue(text);
            }
        });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        ttsManager.shutDown();
    }
}

