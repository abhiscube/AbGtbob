/*import React from "react";
 
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  View,

  Image,
  NavigatorIOS,
  Dimensions
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import QRCodeScanner from 'react-native-qrcode-scanner';
 
export default class BarCodeScannerComponent extends React.Component {
  static navigationOptions = {
    header: null,
    };

  onSuccess(e) {
   alert(e.data)
   this.props.navigation.navigate("MenuSlider",{screen:"MenuSlider"})
  }
 
  render() {
    return (
      <View style={{height:"100%",width:"100%",flexDirection:"row"}}>
      <QRCodeScanner
      onRead={this.onSuccess.bind(this)}
      cameraStyle={{ height: Dimensions.get('window').height }}
    
    />
      <View  style={{width: 45,height:45, justifyContent: "center", alignItems: "center",marginTop:35,marginRight:15}}>
      <TouchableOpacity onPress={() => this.props.navigation.navigate("MenuSlider", { screen: "MenuSlider" })} style={{ width: 45,height:45, justifyContent: "center", alignItems: "center", alignSelf: "center"}}>
                <Image style={{ resizeMode: "contain", width: 20, height: 20 }} source={require('../../res/images/close.png')}></Image>
       </TouchableOpacity>
      </View>
      
      
      
    </View>
    )
  }
  }

 
const styles = StyleSheet.create({
  
})*/
import React, { Component } from "react";

import { View, Dimensions, Text,TouchableOpacity,Image } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import Icon from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

console.disableYellowBox = true;

class BarCodeScannerComponent extends Component {
  static navigationOptions = {
    header: null,
    };

    onSuccess(e) {

    }

  makeSlideOutTranslation(translationType, fromValue) {
    return {
      from: {
        [translationType]: SCREEN_WIDTH * -0.18
      },
      to: {
        [translationType]: fromValue
      }
    };
  }

    render() {
        return (
            <QRCodeScanner
                showMarker
                onRead={this.onSuccess.bind(this)}
                cameraStyle={{height: SCREEN_HEIGHT}}
                customMarker={
                    <View style={styles.rectangleContainer}>
                        <View style={styles.topOverlay}>
                            <View style={{
                                width: 45,
                                height: 45,
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: 35,
                                marginLeft: SCREEN_WIDTH - 45
                            }}>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("MenuSlider", {screen: "MenuSlider",showWelcome:false})}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        alignSelf: "center"
                                    }}>
                                    <Image style={{resizeMode: "contain", width: 20, height: 20}}
                                           source={require('../../res/images/close.png')}/>
                                </TouchableOpacity>
                            </View>
                        </View>

            <View style={{ flexDirection: "row" }}>
              <View style={styles.leftAndRightOverlay} />

              <View style={styles.rectangle}>
                
                <Animatable.View
                  style={styles.scanBar}
                  direction="alternate-reverse"
                  iterationCount="infinite"
                  duration={1700}
                  easing="linear"
                  animation={this.makeSlideOutTranslation(
                    "translateY",
                    SCREEN_WIDTH * -0.54
                  )}
                />
              </View>

              <View style={styles.leftAndRightOverlay} />
            </View>

            <View style={styles.bottomOverlay} />
          </View>
        }
      />
    );
  }
}

const overlayColor = "rgba(0,0,0,0.5)"; // this gives us a black color with a 50% transparency

const rectDimensions = SCREEN_WIDTH * 0.65; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = SCREEN_WIDTH * 0.005; // this is equivalent to 2 from a 393 device width
//const rectBorderColor = "red";

const scanBarWidth = SCREEN_WIDTH * 0.46; // this is equivalent to 180 from a 393 device width
const scanBarHeight = SCREEN_WIDTH * 0.0025; //this is equivalent to 1 from a 393 device width
//const scanBarColor = "#22ff00";

//const iconScanColor = "blue";

const styles = {
  rectangleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  rectangle: {
    height: rectDimensions,
    width: rectDimensions,
    borderWidth: rectBorderWidth,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  topOverlay: {
    flex: 1,
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor,
    justifyContent: "center",
    alignItems: "center"
  },

  bottomOverlay: {
    flex: 1,
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor,
    paddingBottom: SCREEN_WIDTH * 0.25
  },

  leftAndRightOverlay: {
    height: SCREEN_WIDTH * 0.65,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor
  },

  scanBar: {
    width: scanBarWidth,
    height: scanBarHeight,
   // backgroundColor: scanBarColor
  }
};

export default BarCodeScannerComponent;
