package com.bob.v1;

import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

     /* For SplashScreen */

     protected void onCreate(Bundle savedInstanceState) {
         SplashScreen.show(this);
         super.onCreate(savedInstanceState);
     }

    protected String getMainComponentName() {
        return "BOB";
    }
}
