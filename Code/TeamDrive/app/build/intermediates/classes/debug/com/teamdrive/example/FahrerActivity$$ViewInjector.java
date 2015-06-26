// Generated code from Butter Knife. Do not modify!
package com.teamdrive.example;

import android.view.View;
import butterknife.ButterKnife.Finder;
import butterknife.ButterKnife.Injector;

public class FahrerActivity$$ViewInjector<T extends com.teamdrive.example.FahrerActivity> implements Injector<T> {
  @Override public void inject(final Finder finder, final T target, Object source) {
    View view;
    view = finder.findRequiredView(source, 2131296338, "field 'lwnachrichten'");
    target.lwnachrichten = finder.castView(view, 2131296338, "field 'lwnachrichten'");
  }

  @Override public void reset(T target) {
    target.lwnachrichten = null;
  }
}
