package com.example.tim.myapplication;


/**
 * Created by Tim on 08.05.2015.
 */
public class User {
    private String name;
    private int status;

    public User(String n, int s) {
        this.name = n;
        this.status = s;
    }

    public String getName() {
        return this.name;
    }

    public Integer getStatus() {
        return this.status;
    }
}
