import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { WebView } from "react-native-webview";
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import localeStrings from '../res/strings/LocaleStrings';
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
        return (
            <WebView
                source={{ uri: 'https://gtbob.com/index.php/privacy-policy-2/' }}

            />
        );
    }
}