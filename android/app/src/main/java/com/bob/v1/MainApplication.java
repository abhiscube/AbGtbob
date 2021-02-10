package com.bob.v1;

import android.app.Application;

import com.facebook.react.ReactApplication;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import br.com.dopaminamob.gpsstate.GPSStatePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativecommunity.geolocation.GeolocationPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
//import com.facebook.CallbackManager;
//import com.magus.fblogin.FacebookLoginPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.spyworldxp.barcodescanner.BarcodeScannerPackage;
//import com.safaeean.barcodescanner.BarcodeScannerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.rnfs.RNFSPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.imagepicker.ImagePickerPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.wix.autogrowtextinput.AutoGrowTextInputPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
// import com.wix.reactnativekeyboardinput.KeyboardInputPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    //CallbackManager mCallbackManager = new CallbackManager.Factory().create();


    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSharePackage(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            new GPSStatePackage(),
            new RNCWebViewPackage(),
            new GeolocationPackage(),
            new RNFetchBlobPackage(),
            new ReactNativePushNotificationPackage(),
            new RNPermissionsPackage(),
            new SplashScreenReactPackage(),
            new RNI18nPackage(),
            new RNDeviceInfo(),
            new ReactNativeRestartPackage(),
            new RNGoogleSigninPackage(),
            new FBSDKPackage(),
//            new FBSDKPackage(mCallbackManager),
//            new FacebookLoginPackage(),
            new VectorIconsPackage(),
            new BarcodeScannerPackage(),
            new RNCameraPackage(),
            new RNVersionNumberPackage(),
            new RNFSPackage(),
            new ImageResizerPackage(),
            new ImagePickerPackage(),
            new ReactNativeLocalizationPackage(),
            new BlurViewPackage(),
            new AutoGrowTextInputPackage(),
            new RNGestureHandlerPackage()
            // new KeyboardInputPackage(this.getApplication())
      );
    }


    protected String getJSMainModuleName() {
      return "index";
    }
  };


  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }


  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
