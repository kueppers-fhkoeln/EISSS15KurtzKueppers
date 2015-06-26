package com.teamdrive.example;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.List;

public class EintragListAdapter extends ArrayAdapter<Nachricht> {

    /*
    Adapter für die Listview zum Anzeigen der Nachrichten im Mitfahrermenü und im Fahrermenü+
     */
    Activity context;
    List<Nachricht> eintraege;
    public EintragListAdapter(Activity context, int resId, List<Nachricht> eintraege) {
        super(context, resId, eintraege);
        this.context = context;
        this.eintraege = eintraege;
    }


    /*
    einzelnes Element der Liste bestehst aus einer TexView
     */
    private class ViewHolder {
        TextView nachricht;

    }
    /*
    gibt das Element für die jeweilgie Position zurück
     */
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        if (convertView == null) {
            LayoutInflater inflater = (LayoutInflater) context
                    .getSystemService(Activity.LAYOUT_INFLATER_SERVICE);
            convertView = inflater.inflate(R.layout.nachricht_item, null);
            holder = new ViewHolder();
            holder.nachricht= (TextView) convertView.findViewById(R.id.txitemNachricht);

            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        Nachricht eintrag = getItem(position);
        holder.nachricht.setText(eintrag.getNachricht());

        return convertView;
    }

    /*
    fügt der listview ein element hinzu und updatet diese
     */
    @Override
    public void add(Nachricht eintrag) {
        eintraege.add(eintrag);
        notifyDataSetChanged();
    }

    @Override
    public void remove(Nachricht object) {
        // super.remove(object);
        eintraege.remove(object);
        notifyDataSetChanged();
    }

    public List<Nachricht> getEintraege() {
        return eintraege;
    }}