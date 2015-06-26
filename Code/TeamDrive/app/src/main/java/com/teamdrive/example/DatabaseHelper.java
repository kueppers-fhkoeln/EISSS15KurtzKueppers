package com.teamdrive.example;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteTransactionListener;

import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {

    /*
     Hilfsklasse für sqlite datenbank die für die gesendeten Nachrichten genutzt wird.
     */
    // Database Version
    private static final int DATABASE_VERSION = 1;
    // Database Name
    private static final String DATABASE_NAME = "teamdrive";
    private static final String TABLE_NACHRICHTEN = "nachrichten";
    private static final String KEY_ID = "id";
    private static final String KEY_EVENTID = "eventid";
    private static final String KEY_VORNAME = "vorname";
    private static final String KEY_NACHNAME = "nachname";
    private static final String KEY_GESENDET= "gesendet";
    private static final String KEY_NACHRICHT = "nachricht";
    private static final String KEY_DATUM = "date";

    /*
    createstatemet, wird ausgeführt wenn die Datenbank nicht existiert
     */
    private static final String CREATE_TABLE_NACHRICHTEN = "CREATE TABLE " + TABLE_NACHRICHTEN + " (" + KEY_ID + " INTEGER PRIMARY KEY, " +
            KEY_EVENTID + " TEXT, " +
            KEY_VORNAME+ " TEXT, " +
            KEY_NACHNAME + " TEXT, " +
            KEY_GESENDET + " TEXT, " +
            KEY_NACHRICHT+ " TEXT, " +
            KEY_DATUM+ " TEXT " + ")";


    public DatabaseHelper(Context context){
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_TABLE_NACHRICHTEN);

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NACHRICHTEN);
        onCreate(db);
    }
    public void clearall()
    {
        SQLiteDatabase localSQLiteDatabase = getWritableDatabase();
        localSQLiteDatabase.execSQL("DROP TABLE IF EXISTS " + TABLE_NACHRICHTEN);
        onCreate(localSQLiteDatabase);
    }

    /*
    * erstelle einen Eintrag
     */
    public long createnachricht(Nachricht eintrag){
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        //   values.put(KEY_ID, eintrag.getId());
        values.put(KEY_EVENTID, eintrag.getEvent_id());
        values.put(KEY_VORNAME, eintrag.getVorname());
        values.put(KEY_VORNAME, eintrag.getVorname());
        values.put(KEY_GESENDET, eintrag.getGesendet() + "");
        values.put(KEY_NACHRICHT, eintrag.getNachricht());
        values.put(KEY_DATUM, eintrag.getDatum().toString());

        long eintrag_id = db.insert(TABLE_NACHRICHTEN, null, values);

        return 0;
    }
    /**
     * loesche einen Eintrag
     */
//    public void deleteEintrag(Eintrag eintrag){
//        SQLiteDatabase db = this.getWritableDatabase();
//        db.delete(TABLE_EINTRAEGE, KEY_ID +  " = ?", new String[]{String.valueOf(eintrag.getId())});
//
//        db.close();
//    }


    public List<Nachricht> getEintraege(String event_id){
        List<Nachricht> eintraege = new ArrayList<Nachricht>();

        String selectQuery = "SELECT * FROM " +  TABLE_NACHRICHTEN + " WHERE " + KEY_EVENTID + " = " + '"' + event_id + '"';

        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c =  db.rawQuery(selectQuery, null);

        if (c.moveToFirst()){
            do {
                Nachricht nachricht = new Nachricht(c.getInt(c.getColumnIndex(KEY_ID)), c.getString(c.getColumnIndex(KEY_EVENTID)), c.getString(c.getColumnIndex(KEY_VORNAME)), c.getString(c.getColumnIndex(KEY_DATUM)), c.getString(c.getColumnIndex(KEY_NACHNAME)), c.getString(c.getColumnIndex(KEY_GESENDET)), c.getString(c.getColumnIndex(KEY_NACHRICHT)));
                eintraege.add(nachricht);
            }while (c.moveToNext());
        }
        c.close();
        return eintraege;
    }

}

