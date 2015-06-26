package com.teamdrive.example;

import android.app.Application;

public class GlobalClass extends Application {

    private String serverip = "http://192.168.178.207:3000";

    public String getServerip() {

        return serverip;
    }
}
