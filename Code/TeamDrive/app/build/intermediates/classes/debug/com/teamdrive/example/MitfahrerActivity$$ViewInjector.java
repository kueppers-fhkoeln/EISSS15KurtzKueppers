// Generated code from Butter Knife. Do not modify!
package com.teamdrive.example;

import android.view.View;
import butterknife.ButterKnife.Finder;
import butterknife.ButterKnife.Injector;

public class MitfahrerActivity$$ViewInjector<T extends com.teamdrive.example.MitfahrerActivity> implements Injector<T> {
  @Override public void inject(final Finder finder, final T target, Object source) {
    View view;
    view = finder.findRequiredView(source, 2131296358, "field 'sendenButton'");
    target.sendenButton = finder.castView(view, 2131296358, "field 'sendenButton'");
    view = finder.findRequiredView(source, 2131296354, "field 'txtName'");
    target.txtName = finder.castView(view, 2131296354, "field 'txtName'");
    view = finder.findRequiredView(source, 2131296357, "field 'edtnachricht'");
    target.edtnachricht = finder.castView(view, 2131296357, "field 'edtnachricht'");
    view = finder.findRequiredView(source, 2131296355, "field 'lwnachrichten'");
    target.lwnachrichten = finder.castView(view, 2131296355, "field 'lwnachrichten'");
  }

  @Override public void reset(T target) {
    target.sendenButton = null;
    target.txtName = null;
    target.edtnachricht = null;
    target.lwnachrichten = null;
  }
}
