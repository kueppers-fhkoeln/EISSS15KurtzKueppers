package com.teamdrive.example;

import java.util.Date;

public class Nachricht {
    int id;
    String event_id;
    String vorname;
    String nachname;
    String gesendet;
    String nachricht;
    private String datum;

    public Nachricht(int id, String event_id, String vorname, String datum, String nachname, String gesendet, String nachricht) {
        this.id = id;
        this.event_id = event_id;
        this.vorname = vorname;
        this.datum = datum;
        this.nachname = nachname;
        this.gesendet = gesendet;
        this.nachricht = nachricht;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getEvent_id() {
        return event_id;
    }

    public void setEvent_id(String event_id) {
        this.event_id = event_id;
    }

    public String getVorname() {
        return vorname;
    }

    public void setVorname(String vorname) {
        this.vorname = vorname;
    }

    public String getNachname() {
        return nachname;
    }

    public void setNachname(String nachname) {
        this.nachname = nachname;
    }

    public String getGesendet() {
        return gesendet;
    }

    public void setGesendet(String gesendet) {
        this.gesendet = gesendet;
    }

    public String getNachricht() {
        return nachricht;
    }

    public void setNachricht(String nachricht) {
        this.nachricht = nachricht;
    }

    public String getDatum() {
        return datum;
    }

    public void setDatum(String datum) {
        this.datum = datum;
    }
}
