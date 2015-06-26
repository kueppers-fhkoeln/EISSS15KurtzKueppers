package nowebsite.gpstracking;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends Activity {

    private Button showLocation;

    GPSTracker gps;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        showLocation = (Button) findViewById(R.id.show_location);

        showLocation.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                gps = new GPSTracker(MainActivity.this);

                if(gps.canGetLocation()){

                    double latitude = gps.getLatitude();
                    double longitude = gps.getLongitude();

                    Toast.makeText(getApplicationContext(), "Your Location is - \nLat: " + latitude + "\nLong: " + longitude, Toast.LENGTH_LONG).show();
                }else{
                    gps.showSettingsAlert();
                }

            }
        });
    }

}