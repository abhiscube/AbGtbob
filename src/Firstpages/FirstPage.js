import React, { Component } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
    Image
} from "react-native";
import {I18nManager} from 'react-native';

import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from '../../res/styles/LocaleStyles';
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class FirstPage extends React.Component {
  static navigationOptions = {
    header: null,
  
  };

  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
   
  }

    render() {


        return (
            <View style={{flex: 1}}>
                <StatusBar hidden={true}/>
                <ImageBackground source={require("../../res/images/cocktail.png")}
                                 style={{width: '100%', height: '100%'}}>
                    {this.params.dontGoBack === undefined ? <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.goBack(null);
                        }}
                        style={[styles.headerBackButton,{marginTop:15}]}
                    >
                        <Image style={{
                            resizeMode: "contain",
                            width: 15,
                            height: 15,
                            transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]
                        }}
                               source={require('../../res/images/back.png')}/>
                    </TouchableOpacity> : null}
                    <Image source={require("../../res/images/logo.png")}
                           style={{resizeMode: "contain",width:"60%", alignSelf: "center"}}>
                    </Image>
                    <View style={{
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        bottom: 100,
                        position: "absolute",
                        width: "100%"
                    }}>
                        <Text style={styles.Text}>{localeStrings.firstPageStrings.middleText1}</Text>
                        <Text style={styles.Text}>{localeStrings.firstPageStrings.middleText2}</Text>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        width: "100%",
                        //left:"%",
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        bottom: 25,
                        position: "absolute"
                    }}>

                        <TouchableOpacity style={styles.BtnSignUp} onPress={() =>
                            this.props.navigation.navigate("SignUp", {screen: "SignUp", id: this.params.id})
                        }>
                            <Text style={{
                                color: 'white',
                                fontSize: 17,
                                fontFamily: "Helvetica"
                            }}>{localeStrings.firstPageStrings.signUp}</Text>
                        </TouchableOpacity>


                        <TouchableOpacity style={styles.BtnLogIn} onPress={() =>
                            this.props.navigation.navigate("LogIn", {screen: "LogIn", id: this.params.id})
                        }>
                            <Text style={{
                                color: "#26466c",
                                fontSize: 17,
                                fontFamily: "Helvetica"
                            }}>{localeStrings.firstPageStrings.signIn}</Text>
                        </TouchableOpacity>
                    </View>

                </ImageBackground>
            </View>
        )
    }
}


