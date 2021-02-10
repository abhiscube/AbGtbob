import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text,  AsyncStorage } from 'react-native';
import { WebView } from "react-native-webview";
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import localeStrings from '../res/strings/LocaleStrings';
import { GlobalVariables } from './GlobalVariables';
export default class PrivacyWebView extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>{localeStrings.homeScreenStrings.privacyPolicy}</Text>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
            },
            headerRight: (<View />),
            headerLeft: (
                <View style={{ marginLeft: 10 }}>
                    <TouchableOpacity onPress={() => navigation.goBack(null)} style={{
                        width: 45,
                        height: 45,
                        marginLeft: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}>
                        <Image style={{ resizeMode: "contain", width: 15, height: 15, marginBottom: 5, tintColor: "white" }}
                            source={require('../res/images/back.png')} />
                    </TouchableOpacity>
                </View>
            ),
        }
    };
    render() {
        console.log(GlobalVariables.userLanguage.value);
        if (GlobalVariables.userLanguage.value === 'he-IL') {
            return (
                <WebView
                    source={{uri: 'https://gtbob.com/index.php/he/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f-%d7%a9%d7%99%d7%9e%d7%95%d7%a9-%d7%95%d7%9e%d7%93%d7%99%d7%a0%d7%99%d7%95%d7%aa-%d7%a4%d7%a8%d7%98%d7%99%d7%95%d7%aa-2/'}}
                />
            );
        }else{
            return (
                <WebView
                    source={{uri: 'https://gtbob.com/index.php/privacy-policy-2/'}}
                />
            );
        }
      
    }


  
}