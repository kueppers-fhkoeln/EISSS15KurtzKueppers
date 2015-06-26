// Generated code from Butter Knife. Do not modify!
package com.teamdrive.example;

import android.view.View;
import butterknife.ButterKnife.Finder;
import butterknife.ButterKnife.Injector;

public class HomeActivity$$ViewInjector<T extends com.teamdrive.example.HomeActivity> implements Injector<T> {
  @Override public void inject(final Finder finder, final T target, Object source) {
    View view;
    view = finder.findRequiredView(source, 2131296359, "field 'txtNachricht'");
    target.txtNachricht = finder.castView(view, 2131296359, "field 'txtNachricht'");
    view = finder.findRequiredView(source, 2131296360, "field 'btnFahrtMenu'");
    target.btnFahrtMenu = finder.castView(view, 2131296360, "field 'btnFahrtMenu'");
    view = finder.findRequiredView(source, 2131296361, "field 'btnFahrerMenu'");
    target.btnFahrerMenu = finder.castView(view, 2131296361, "field 'btnFahrerMenu'");
    view = finder.findRequiredView(source, 2131296362, "field 'btnMitfahrerMenu'");
    target.btnMitfahrerMenu = finder.castView(view, 2131296362, "field 'btnMitfahrerMenu'");
    view = finder.findRequiredView(source, 2131296363, "field 'btnAbmelden'");
    target.btnAbmelden = finder.castView(view, 2131296363, "field 'btnAbmelden'");
  }

  @Override public void reset(T target) {
    target.txtNachricht = null;
    target.btnFahrtMenu = null;
    target.btnFahrerMenu = null;
    target.btnMitfahrerMenu = null;
    target.btnAbmelden = null;
  }
}
