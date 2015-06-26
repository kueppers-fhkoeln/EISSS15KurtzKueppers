// Generated code from Butter Knife. Do not modify!
package com.teamdrive.example;

import android.view.View;
import butterknife.ButterKnife.Finder;
import butterknife.ButterKnife.Injector;

public class FahrtActivity$$ViewInjector<T extends com.teamdrive.example.FahrtActivity> implements Injector<T> {
  @Override public void inject(final Finder finder, final T target, Object source) {
    View view;
    view = finder.findRequiredView(source, 2131296340, "field 'txtName'");
    target.txtName = finder.castView(view, 2131296340, "field 'txtName'");
    view = finder.findRequiredView(source, 2131296343, "field 'txtGegner'");
    target.txtGegner = finder.castView(view, 2131296343, "field 'txtGegner'");
    view = finder.findRequiredView(source, 2131296346, "field 'txtDatum'");
    target.txtDatum = finder.castView(view, 2131296346, "field 'txtDatum'");
    view = finder.findRequiredView(source, 2131296342, "field 'txtStadt'");
    target.txtStadt = finder.castView(view, 2131296342, "field 'txtStadt'");
    view = finder.findRequiredView(source, 2131296349, "field 'txtStrasse'");
    target.txtStrasse = finder.castView(view, 2131296349, "field 'txtStrasse'");
    view = finder.findRequiredView(source, 2131296350, "field 'txtTreffpunkt'");
    target.txtTreffpunkt = finder.castView(view, 2131296350, "field 'txtTreffpunkt'");
    view = finder.findRequiredView(source, 2131296352, "field 'btnMitfahrer'");
    target.btnMitfahrer = finder.castView(view, 2131296352, "field 'btnMitfahrer'");
    view = finder.findRequiredView(source, 2131296351, "field 'btnGahrer'");
    target.btnGahrer = finder.castView(view, 2131296351, "field 'btnGahrer'");
  }

  @Override public void reset(T target) {
    target.txtName = null;
    target.txtGegner = null;
    target.txtDatum = null;
    target.txtStadt = null;
    target.txtStrasse = null;
    target.txtTreffpunkt = null;
    target.btnMitfahrer = null;
    target.btnGahrer = null;
  }
}
