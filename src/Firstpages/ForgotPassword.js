import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    AsyncStorage,
    TouchableHighlight,
    Alert, StatusBar, I18nManager, ActivityIndicator
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'

import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from "../../res/styles/LocaleStyles";
import { GlobalVariables } from "../GlobalVariables";
import Spinner from 'react-native-loading-spinner-overlay';
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class ForgotPassword extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.forgotPasswordStrings.passwordRecovery,
            headerStyle: {
                backgroundColor: '#13496c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
            },

            headerRight: (<View />),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack(null)} style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
                    }} source={require('../../res/images/back.png')} />
                </TouchableOpacity>
            ),
            headerTintColor: '#fff',
            headerTitleStyle: {
                textAlign: "center",
                flex: 1,
                alignSelf: "center",
                color: 'white',
                fontSize: 19,
                fontFamily: "Helvetica"
            },
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            enterActivity: false,
        }
    }

    componentWillMount() {
        AsyncStorage.getItem('email').then((value) => {
            console.log(value);
            if (value !== null) {
                this.setState({ email: value })
            }
        }).done();
    }

    ForgotPassword() {
        if (this.state.email === "") {
            Alert.alert(
                localeStrings.forgotPasswordStrings.ops,
                localeStrings.forgotPasswordStrings.completeAllFields,
                [
                    {
                        text: localeStrings.forgotPasswordStrings.ok,
                        onPress: () => console.log("Cancel Pressed"),

                    },

                ],

                { cancelable: false }
            );
        } else {


            try {
                this.setState({ enterActivity: true });
                let data = new FormData();

                data.append("Email", this.state.email);

                console.log(data);
                fetch(GlobalVariables._URL + "/core/forgotpassword", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    },

                    body: data

                })

                    .then(response => response.json())
                    .then(response => {
                        console.log(response);

                        if (response) {
                            this.setState({ enterActivity: false });
                            Alert.alert(
                                localeStrings.forgotPasswordStrings.hi,
                                localeStrings.forgotPasswordStrings.pleaseFollow + this.state.email + localeStrings.forgotPasswordStrings.toChange,
                                [
                                    {
                                        text: localeStrings.forgotPasswordStrings.cancel,
                                        onPress: () => console.log("Cancel Pressed"),
                                        style: "destructive"
                                    },
                                    {
                                        text: localeStrings.forgotPasswordStrings.ok,
                                        onPress: () => this.props.navigation.navigate("FirstPage", { screen: "FirstPage" })
                                    }
                                ],

                                { cancelable: false }
                            );
                        } else {
                            this.setState({ enterActivity: false });
                            Alert.alert(
                                localeStrings.forgotPasswordStrings.ops,
                                localeStrings.forgotPasswordStrings.somethingWentWrong,
                                [
                                    {
                                        text: localeStrings.forgotPasswordStrings.cancel,
                                        onPress: () => console.log("Cancel Pressed"),
                                        style: "destructive"
                                    },
                                    {
                                        text: localeStrings.forgotPasswordStrings.ok,
                                        onPress: () => this.props.navigation.navigate("FirstPage", { screen: "FirstPage" })
                                    }
                                ],

                                { cancelable: false }
                            );
                        }
                    })
                    .catch(error => {
                        this.setState({ enterActivity: false });
                        console.log(error)


                    });
            } catch (e) {
                this.setState({ enterActivity: false });
                console.log(e)

            }
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{ flex: 1, width: "100%", height: "100%" }}>
                <StatusBar hidden={false} />
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <View style={{
                    flexDirection: 'column',
                    width: "90%",
                    justifyContent: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    height: 55,
                    marginTop: 25,
                    borderRadius: 10
                }}>

                    <Text style={{
                        color: "#9b9b9b",
                        alignSelf: "center",
                        justifyContent: "center",
                        fontFamily: "Helvetica",
                        fontSize: 14
                    }}>
                        {localeStrings.forgotPasswordStrings.enterYourEmail}
                    </Text>

                    <Text style={{
                        color: "#9b9b9b",
                        alignSelf: "center",
                        justifyContent: "center",
                        fontFamily: "Helvetica",
                        fontSize: 14
                    }}>
                        {localeStrings.forgotPasswordStrings.linkResetPassword}
                    </Text>

                </View>


                <View style={{
                    flexDirection: 'row',
                    width: "80%",
                    justifyContent: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    backgroundColor: "#f5f5f5",
                    height: 55,
                    marginTop: 45,
                    borderRadius: 10
                }}>
                    <View style={{ marginRight: 10, alignSelf: "center", justifyContent: "center" }}>
                        <Image style={styles.emailImgPass}
                            source={require('../../res/images/emailPlaceholder.png')} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            width: "80%",
                            justifyContent: "center",
                            alignSelf: "center",
                            height: "100%",
                        }}
                        onPress={() => this.typeEmailAddress.focus()}>
                        <View style={{
                            width: "100%",
                            justifyContent: "center",
                            alignSelf: "center",
                            height: "100%",
                        }}>

                            <TextInput ref={ref => this.typeEmailAddress = ref}
                                style={styles.logInFields}
                                keyboardType="email-address"
                                autoCapitalize='none'
                                placeholder={localeStrings.forgotPasswordStrings.emailPlaceHolder}
                                placeholderTextColor="#9b9b9b"
                                onChangeText={(ForgotPass) => {

                                    this.setState({ email: ForgotPass })

                                }
                                }
                                value={this.state.email} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{
                    flexDirection: 'row',
                    width: "80%",
                    justifyContent: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    backgroundColor: "#266c3a",
                    height: 55,
                    marginTop: 25,
                    borderRadius: 10
                }}>
                    <TouchableOpacity style={{ alignSelf: "center", justifyContent: "center", height: 65, width: "100%" }}
                        onPress={() =>
                            this.ForgotPassword()}>
                        <Text style={{
                            color: "white",
                            alignSelf: "center",
                            justifyContent: "center",
                            fontFamily: "Helvetica",
                            fontSize: 16
                        }}>
                            {localeStrings.forgotPasswordStrings.submit}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

