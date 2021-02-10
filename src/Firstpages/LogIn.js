import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    AsyncStorage,
    ScrollView, ActivityIndicator, StatusBar, I18nManager, Platform, Alert

} from "react-native";
import session from "../session";
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import Foect from 'foect';
import Modal from "react-native-modal";

let timer = () => {
};
var output = [];
const RESEND_OTP_TIME_LIMIT = 60;
const RESEND_OTP_TEXT_TIME = 60000;
import CountryPicker from 'react-native-country-picker-modal'


import { GlobalVariables } from "../GlobalVariables";
import localeStrings from '../../res/strings/LocaleStrings';
import Loader from "../loader";
//var { FBLogin, FBLoginManager } = require('react-native-facebook-login');
import PropTypes from 'prop-types';
import RNFetchBlob from 'react-native-fetch-blob';
import GPSState from 'react-native-gps-state';
import StyleSheetFactory from "../../res/styles/LocaleStyles";
import { GoogleSignin, statusCodes } from "react-native-google-signin";
import { LoginManager, GraphRequest, GraphRequestManager, LoginButton, AccessToken } from 'react-native-fbsdk';
import firebase from '../../src/firebase.js';
import Spinner from 'react-native-loading-spinner-overlay';

let accessToken = null, fbUserId = null;
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
let num, mobNo, otp = "";
let formOb;
var loginResponse;

export default class LogIn extends React.Component {

    componentDidMount() {
        GoogleSignin.configure({
            webClientId: '847661413994-fqa448i9p2emfm3a9b3enk3cnhcmkvev.apps.googleusercontent.com'
        });
    }

    callApi(value, token) {
        let OBJ = {
            UserId: value,
            DeviceToken: token,
            DeviceType: Platform.OS
        }
        //alert(JSON.stringify(OBJ))
        let uri = GlobalVariables._URL + "/core/updatedevicetoken"
        try {

            fetch(uri, {
                method: "POST",
                headers: {
                    //'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(OBJ)

            })

                .then(response => response.json())
                .then(response => {
                    console.log("true");
                    console.log('TOKEN WAS:' + token);
                })
                .catch(error => {
                    console.error(error)
                });
        } catch (e) {

            console.error("upload catch error", e);


        }
    }

    SaveGoogleId(responseData) {
        let data = new FormData();
        if (responseData.user.email == undefined || responseData.user.email == null || responseData.user.email == "null" || responseData.user.email == "undefined" || responseData.user.email == '') {
            Alert.alert(
                localeStrings.logInStrings.alertHeading,
                localeStrings.logInStrings.alertText,
                [
                    {
                        text: localeStrings.forgotPasswordStrings.ok,
                    },
                ],
                { cancelable: false }
            );
            responseData = '';
            return 0;
        }
        data.append("email", responseData.user.email);
        data.append("fullName", responseData.user.name);
        data.append("Password", 'pass' + responseData.user.id);
        data.append("image", responseData.user.photo);
        if (isNaN(mobNo)) {
            //if input is not a number then here
            mobNo = "";
        } else {
            //if input is number then here
            mobNo = mobNo;
        }

        data.append("phoneNumber", mobNo);
        try {
            this.setState({ enterActivity: true });
            fetch(GlobalVariables._URL + "/core/loginwithgoogle", {
                method: "POST",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }),
                body: data
            })
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    this.setState({ enterActivity: false });
                    if (response.succeeded != false && response != "") {
                        AsyncStorage.setItem("UserLogged", "true");
                        AsyncStorage.setItem("userId", response);
                        AsyncStorage.getItem('UserLogged').then((value) => {

                            if (value !== "") {
                                if (value === "true") {
                                    AsyncStorage.getItem('userId').then((userId) => {

                                        if (userId !== null && userId !== "") {
                                            firebase.messaging().getToken().then((token) => {
                                                this.callApi(userId, token);
                                                console.log('tok- ' + token);
                                            });
                                        }

                                    }).done();


                                }
                            }
                        }).done();

                        AsyncStorage.setItem("loggedAccountType", "2");
                        this.setState({ loggedAccountType: "2" });


                        session.value = "true";
                        this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                    } else {
                        alert(JSON.stringify(response.errors[0].description));
                        GoogleSignin.signOut();
                    }
                })
                .catch(error => {
                    console.log(error);
                    alert("Server Error Occurred. Please try Again.");

                });
        } catch (e) {
            // alert("upload catch error", e);
            GoogleSignin.logout(() => {
                console.log('Logout Google ok!')
            })
        }

    }

    _signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo);
            this.setState({ userInfo: userInfo, loggedIn: true });
            this.SaveGoogleId(userInfo);
        } catch (error) {
            console.log(error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (f.e. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        }
    };

    signOut = async () => {
        try {
            //await GoogleSignin.revokeAccess();
            try {
                await GoogleSignin.revokeAccess();
                console.log('deleted');
            } catch (error) {
                console.error(error);
            }
            await GoogleSignin.signOut();
            this.setState({ user: null, loggedIn: false }); // Remember to remove the user from your app's state as well
        } catch (error) {
            console.error(error);
        }
    };

    getCurrentUserInfo = async () => {
        try {
            const userInfo = await GoogleSignin.signInSilently();
            this.setState({ userInfo });
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                // user has not signed in yet
                this.setState({ loggedIn: false });
            } else {
                // some other error
                this.setState({ loggedIn: false });
            }
        }
    };
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.logInStrings.signIn,
            headerStyle: {
                backgroundColor: '#26466c',
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
                    }}
                        source={require('../../res/images/back.png')} />
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
        this.params = this.props.navigation.state.params;
        this.state = {
            enterActivity: false,
            username: "",
            userNameValid: false,
            password: "",
            passwordValid: false,
            loading: false,
            countryCode: "972",
            remainingTime: RESEND_OTP_TIME_LIMIT,
            isButtonDisabled: true,
            numberModalVisible: false,
            IsModalVisibleConfirmed: false,
            TextInputDisable: true,
            disableSendButton: false,
            loginType: 0,
            mobileNo: '',
            otp: '',
            showResend: false,
            selectedCountryCode: "IL"
        }
        this.hideModal();
        //this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    startResendOtpTimer = () => {
        this.setState({
            isButtonDisabled: false,
        });

        setTimeout(() => {
            this.setState({
                isButtonDisabled: true,
            });
        }, RESEND_OTP_TEXT_TIME)
        this.setState({ remainingTime: RESEND_OTP_TIME_LIMIT });
        clearInterval(timer);
        timer = setInterval(() => {
            if (!this.state.remainingTime) {
                clearInterval(timer);
                this.setState({
                    TextInputDisable: true,
                    disableSendButton: false,
                });
                return false;
            }
            this.setState(prevState => {
                return { remainingTime: prevState.remainingTime - 1 }
            });
        }, 1000);
    };

    verifyOtp() {
        if (isNaN(otp) || (otp.length != 4)) {
            alert(localeStrings.logInStrings.noDetailsMatch);
            return;
        }
        try {
            let data = new FormData();
            if (isNaN(mobNo)) {
                //if input is not a number then here
                mobNo = "";
            } else {
                //if input is number then here
                mobNo = mobNo;
            }
            data.append("phoneNumber", mobNo);
            data.append("otpType", 1);
            data.append("otp", otp);
            let url = `${GlobalVariables._URL}/core/verifyOTP`;
            fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                body: data
            })
                .then(response => response.json())
                .then(response => {

                    if (response === true) {
                        this.hideModal();
                        if (this.state.loginType === 0) {
                            //formOb.submit();
                            this.proceedOTPVerification();
                        } else if (this.state.loginType === 1) { // Google Login
                            this._signIn();
                        } else if (this.state.loginType === 2) { // Facebook Login
                            this.getPublicProfile();
                        }
                    } else {
                        alert(localeStrings.logInStrings.noDetailsMatch);
                        this.setState({
                            isButtonDisabled: true,
                        });
                        this.refs.OTP.clear();
                        clearInterval(timer);
                    }
                })
                .catch(error => {
                    console.log('Error : ', error);
                });
        } catch (e) {
            console.log('Error : ', error);
        }
    }

    proceedOTPVerification() {
        const response = loginResponse;
        if (response.succeeded !== false) {
            this.setState({ enterActivity: false });
            GlobalVariables.userId.value = response.userId;
            AsyncStorage.setItem("email", this.state.username)
            AsyncStorage.setItem("UserLogged", "true");
            AsyncStorage.setItem("userId", response.userId);
            AsyncStorage.setItem("loggedAccountType", "0");
            AsyncStorage.getItem('UserLogged').then((value) => {

                if (value !== "") {
                    if (value === "true") {
                        AsyncStorage.getItem('userId').then((userId) => {

                            if (userId !== null && userId !== "") {
                                firebase.messaging().getToken().then((token) => {
                                    this.callApi(userId, token);
                                    console.log('tok- ' + token);
                                });
                            }

                        }).done();


                    }
                }
            }).done();
            this.setState({ loggedAccountType: "0" });
            session.value = "true";
            if (response.role === "customer") {
                AsyncStorage.setItem("role", "customer");

                if (this.params.id === undefined) {
                    this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                } else {
                    this.enableGPS(() => {
                        this.props.navigation.navigate("BarLocation", {
                            screen: "BarLocation",
                            barId: this.params.id
                        })
                    });
                }
            } else if (response.role === "waiter") {
                AsyncStorage.setItem("role", "waiter");
                this.props.navigation.navigate("HomeScreenWaiters", { screen: "HomeScreenWaiters" })

            } else {
                this.setState({ enterActivity: false });
                alert(localeStrings.logInStrings.noDetailsMatch)
            }

        } else {
            this.setState({ enterActivity: false });
            alert(localeStrings.logInStrings.invalidNameOrPassword)
        }
    }

    onResendOtpButtonPress() {
        if (isNaN(mobNo)) {
            alert(localeStrings.otpScreen.inputNumber);
            return;
        }

        try {
            //If First digit of mobile number is 0, trim the number and remove leading 0
            if (mobNo.length === 10) {
                var digits = mobNo.toString().split('');
                var realDigits = digits.map(Number)
                if (realDigits[0] === 0) {
                    mobNo = mobNo.substring(1);
                }
            }
            let data = new FormData();
            let mobWIthCountryCode = this.state.countryCode + mobNo;
            mobNo = mobWIthCountryCode;
            console.log(mobNo);
            data.append("phoneNumber", mobNo);
            data.append("otpType", 1);
            let url = `${GlobalVariables._URL}/core/sendOTP`;
            fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                body: data
            })
                .then(response => response.json())
                .then(response => {
                    if (response !== true) {
                        alert(localeStrings.otpScreen.unableToSend);
                        this.setState({ TextInputDisable: true, disableSendButton: false, showResend: false, isButtonDisabled: true, });
                    } else {
                        this.setState({ showResend: true });
                        this.startResendOtpTimer();
                    }
                    console.log('OTP STATUS:' + response)
                })
                .catch(error => {
                    console.log('Error : ', error);
                });
        } catch (e) {
            console.log('Error : ', error);
        }
    }

    enableGPS(fnCallback) {

        //Get the current GPS state
        GPSState.getStatus()
            .then((status) => {
                switch (status) {
                    case GPSState.NOT_DETERMINED:
                        //alert('Please, allow the location, for us to do amazing things for you!')
                        GPSState.requestAuthorization(3);
                        break;

                    case GPSState.RESTRICTED:
                        GPSState.openLocationSettings();
                        break;

                    case GPSState.DENIED:
                        //alert('It`s a shame that you do not allowed us to use location :(')
                        break;

                    case GPSState.AUTHORIZED_ALWAYS:
                    case GPSState.AUTHORIZED_WHENINUSE:

                        if (fnCallback) {
                            fnCallback();
                        }
                        break;
                }
            })
    }

    showModal() {
        this.setState({ numberModalVisible: true });
    }

    hideModal() {
        this.setState({ numberModalVisible: false });
    }

    SignIn() {
        this.setState({ enterActivity: true });
        let data = new FormData();
        data.append("Email", this.state.username);
        data.append("Password", this.state.password);
        data.append("RememberMe", false);
        if (isNaN(mobNo)) {
            //if input is not a number then here
            mobNo = "";
        } else {
            //if input is number then here
            mobNo = mobNo;
        }
        data.append("phoneNumber", mobNo);


        try {

            fetch(GlobalVariables._URL + "/core/login", {
                method: "POST",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }),
                body: data
            })

                .then(response => response.json())
                .then(response => {
                    this.setState({ enterActivity: false });
                    loginResponse = response;
                    if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                        this.proceedOTPVerification(); //Bypass OTP verification for development and internal testing.
                    } else {
                        if (response && response.succeeded !== false && response.userId) {
                            this.showModal();
                        } else {
                            alert(localeStrings.logInStrings.noDetailsMatch);
                        }
                    }
                })
                .catch(error => {
                    this.setState({ enterActivity: false });
                    console.log("upload error", error);

                });
        } catch (e) {
            this.setState({ enterActivity: false });
            console.error("upload catch error", e);

        }

    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{ flex: 1, width: "100%", height: "100%" }}>

                <Modal
                    animationType="fade"
                    visible={this.state.numberModalVisible}
                    transparent={true}
                    style={styles.modal}
                >
                    <View style={styles.modalFirstView}>
                        <View style={styles.numberModal}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.hideModal();
                                }}
                                style={styles.modalCloseButton}>
                                <Text style={{ fontSize: 20, color: "gray", fontWeight: "bold" }}>X</Text>
                            </TouchableOpacity>
                            {/*// todo: Text If any*/}
                            <View style={styles.modalCenterText}>
                                <Text style={{
                                    fontSize: 16,
                                    color: "gray",
                                    fontWeight: "bold"
                                }}>{this.state.TextInputDisable ? localeStrings.otpScreen.inputNumber : localeStrings.otpScreen.inputOTP}</Text>
                                {/*<Text style={{ fontSize: 13, color: "black", marginTop: "15%", textAlign: "center" }}>*/}
                                {/*    to verify via OTP*/}
                                {/*</Text>*/}



                            </View>

                            <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', }}>
                                {this.state.TextInputDisable ? <CountryPicker
                                    countryCodes={["IL", "GB", "US", "IT", "FR", "ES", "PT", "RU", "TR", "IN"]}
                                    containerButtonStyle={{ marginTop: 10, marginLeft: 30 }}
                                    withCallingCode={true}
                                    withEmoji={true}
                                    countryCode={this.state.selectedCountryCode}
                                    visible={this.state.pickerVisible}
                                    onSelect={country =>
                                        this.setState({ countryCode: country.callingCode, selectedCountryCode: country.cca2 })
                                    }
                                    onClose={() => this.setState({ pickerVisible: false })}
                                /> : <View><Text style={{ marginLeft: "15%" }}> </Text></View>}

                                <View style={{
                                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                                    width: "70%",
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignSelf: "center",
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: 6,
                                    height: 50
                                }}>
                                    {this.state.TextInputDisable ?
                                        <View style={{
                                            marginRight: 10,
                                            alignSelf: "center",
                                            justifyContent: "center"
                                        }}>

                                            <Text
                                                style={{ fontSize: 18, marginRight: 5 }}>+{this.state.countryCode}</Text>
                                        </View> : <View />}

                                    {this.state.TextInputDisable ?
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={{
                                                width: "70%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                            }}
                                        >

                                            <View style={{
                                                width: "100%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                                alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
                                                marginLeft: I18nManager.isRTL ? -10 : 0
                                            }}>
                                                <TextInput
                                                    style={styles.TextInputStyle}
                                                    ref='mobileNo'
                                                    value={this.state.mobileNo}
                                                    onChangeText={(mobileNo) => this.setState({ mobileNo: mobileNo })}
                                                    keyboardType="phone-pad"
                                                    placeholder='XXXXXXXXXX'
                                                    maxLength={10}
                                                    autoFocus={true} />

                                            </View>
                                        </TouchableOpacity> :
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={{
                                                width: "80%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                            }}
                                        >

                                            <View style={{
                                                width: "100%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                                alignItems: "flex-start"
                                            }}>
                                                <TextInput
                                                    style={styles.otpInputStyle}
                                                    ref='OTP'
                                                    value={this.state.otp}
                                                    onChangeText={(otp) => this.setState({ otp: otp })}
                                                    keyboardType="phone-pad"
                                                    placeholder='----'
                                                    maxLength={4}
                                                    autoFocus={true}
                                                />

                                            </View>
                                        </TouchableOpacity>
                                    }


                                </View>


                            </View>
                            {/*//todo: Needed for OTP verification*/}
                            <View style={{
                                flexDirection: 'row',
                                width: "100%",
                                justifyContent: "center",
                                alignContent: "center",
                                alignSelf: "center",
                                marginTop: 20
                            }}>
                                {(this.state.isButtonDisabled === true) ? (
                                    <TouchableOpacity onPress={() => {
                                        mobNo = this.state.mobileNo;
                                        if ((isNaN(mobNo) || (mobNo.length != 9)) && (isNaN(mobNo) || (mobNo.length != 10))) {
                                            alert(localeStrings.otpScreen.inputNumber);
                                            return;
                                        }
                                        this.setState({ TextInputDisable: false, disableSendButton: true })
                                        this.onResendOtpButtonPress();
                                    }}>
                                        <Text style={{ color: "#ba8902" }}>
                                            {this.state.showResend ? localeStrings.otpScreen.resendOtp : ''}
                                        </Text>
                                    </TouchableOpacity>

                                ) : (
                                        <Text>
                                            {localeStrings.otpScreen.resendOtpIn} {this.state.remainingTime} {localeStrings.otpScreen.seconds}
                                        </Text>

                                    )}
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                width: "40%",
                                justifyContent: "center",
                                alignContent: "center",
                                alignSelf: "center",
                                backgroundColor: "#26466c",
                                marginTop: 25,
                                borderRadius: 10,
                                height: 40
                            }}>

                                {this.state.TextInputDisable ?
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 65,
                                            width: "100%"
                                        }}
                                        onPress={() => {
                                            mobNo = this.state.mobileNo;
                                            if ((isNaN(mobNo) || (mobNo.length != 9)) && (isNaN(mobNo) || (mobNo.length != 10))) {
                                                alert(localeStrings.otpScreen.inputNumber);
                                                return;
                                            }
                                            this.setState({ TextInputDisable: false, disableSendButton: true })
                                            this.onResendOtpButtonPress();
                                        }}
                                    //disabled={this.state.disableSendButton}
                                    >

                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>{localeStrings.otpScreen.getOTP}</Text>
                                    </TouchableOpacity> :
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 65,
                                            width: "100%"
                                        }}
                                        onPress={() => {
                                            otp = this.state.otp;
                                            if (isNaN(otp) || (otp.length != 4)) {
                                                alert(localeStrings.logInStrings.noDetailsMatch);
                                                return;
                                            }

                                            this.verifyOtp();
                                        }}
                                    >

                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>{localeStrings.otpScreen.btnText}</Text>
                                    </TouchableOpacity>
                                }


                            </View>

                        </View>
                    </View>
                </Modal>


                < StatusBar
                    hidden={false}
                />
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Image source={require("../../res/images/popuplogo.png")}
                        style={{
                            width: 55,
                            height: 55,
                            resizeMode: "contain",
                            alignSelf: "center",
                            marginTop: "10%"
                        }}>
                    </Image>

                    <Foect.Form
                        onValidSubmit={model => {
                            this.SignIn()
                        }}

                        onInvalidSubmit={(errors, values) => {
                            console.log(errors, values);

                            if (errors["userName"].required) {
                                this.setState({ userNameValid: true })
                            } else {
                                this.setState({ userNameValid: false })
                            }

                            if (errors["pass"].required) {
                                this.setState({ passwordValid: true })
                            } else {
                                this.setState({ passwordValid: false })
                            }


                        }}
                    >

                        {form => (
                            <View>
                                <Foect.Control name="userName" required
                                    pattern={/(?=^.{6,}$)^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/}>
                                    {control => (
                                        <View style={{ marginTop: "10%" }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                width: "80%",
                                                justifyContent: "center",
                                                alignContent: "center",
                                                alignSelf: "center",
                                                backgroundColor: "#f5f5f5",
                                                borderRadius: 6,
                                                height: 60
                                            }}>
                                                <View style={{
                                                    marginRight: 10,
                                                    alignSelf: "center",
                                                    justifyContent: "center"
                                                }}>
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
                                                    onPress={() => this.emailAddress.focus()}>
                                                    <View style={{
                                                        width: "100%",
                                                        justifyContent: "center",
                                                        alignSelf: "center",
                                                        height: "100%",
                                                        alignItems: "flex-start"
                                                    }}>
                                                        <TextInput
                                                            ref={ref => this.emailAddress = ref}
                                                            style={styles.logInFields}
                                                            keyboardType="email-address"
                                                            autoCapitalize='none'
                                                            placeholder={localeStrings.logInStrings.emailPlaceHolder}
                                                            placeholderTextColor="#9b9b9b"

                                                            onBlur={() => {
                                                                control.markAsTouched();
                                                                if (control.isValid) {
                                                                    console.log("on onblur");
                                                                    this.setState({ userNameValid: false });
                                                                }
                                                            }}

                                                            onChangeText={(text) => {
                                                                control.onChange(text);
                                                                if (control.isValid) {
                                                                    this.setState({ userNameValid: false });
                                                                }
                                                                this.setState({ username: text })
                                                            }}

                                                            value={this.state.username}
                                                        />

                                                        {control.isInvalid && control.isTouched || this.state.userNameValid ?
                                                            <View>
                                                                {control.errors.pattern || this.state.userNameValid ?
                                                                    <Text
                                                                        style={styles.invalidField}>{localeStrings.logInStrings.enterValidEmail}</Text> :
                                                                    <Text
                                                                        style={styles.invalidField}>{localeStrings.logInStrings.enterEmail}</Text>}
                                                            </View> : null}
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </Foect.Control>
                                <View style={{ marginTop: "5%" }} />
                                <Foect.Control name="pass" required
                                    pattern={/(?=^.{6,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: 6,
                                            height: 60
                                        }}>
                                            <View style={{
                                                marginRight: 10,
                                                alignSelf: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Image style={styles.emailImgPass}
                                                    source={require('../../res/images/passPlaceholder.png')} />
                                            </View>
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                style={{
                                                    width: "80%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                }}
                                                onPress={() => this.passwordField.focus()}>
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput
                                                        ref={ref => this.passwordField = ref}
                                                        style={styles.logInFields}
                                                        autoCapitalize='none'
                                                        placeholder={localeStrings.logInStrings.passwordPlaceHolder}
                                                        secureTextEntry={true}
                                                        placeholderTextColor="#9b9b9b"
                                                        onBlur={control.markAsTouched}

                                                        onChangeText={(text) => {
                                                            control.onChange(text);
                                                            if (control.isValid) {
                                                                this.setState({ passwordValid: false });
                                                            }
                                                            this.setState({ password: text })
                                                        }}


                                                        value={this.state.password}
                                                    />

                                                    {control.isTouched && control.isInvalid || this.state.passwordValid ?
                                                        <View style={{ justifyContent: "flex-end" }}>
                                                            <Text
                                                                style={styles.invalidField}>{localeStrings.logInStrings.enterPassword}</Text>
                                                        </View> : null}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Foect.Control>

                                <View style={{
                                    flexDirection: 'row',
                                    width: "80%",
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignSelf: "center",
                                    backgroundColor: form.isInvalid ? "#266c3a" : "#266c3a",
                                    marginTop: "5%",
                                    borderRadius: 4,
                                    height: 50
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 50,
                                            width: "100%",
                                            backgroundColor: "#266c3a",
                                            borderRadius: 4
                                        }}
                                        onPress={() => {
                                            this.setState({ loginType: 0 });
                                            form.submit();
                                        }}>
                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>
                                            {localeStrings.logInStrings.logIn}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Foect.Form>

                    <View style={{
                        flexDirection: 'row',
                        width: "80%",
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        marginTop: "3%",
                        borderRadius: 10,
                        height: 55
                    }}>
                        <TouchableOpacity
                            style={{ alignSelf: "center", justifyContent: "center", height: 65, width: "100%" }}
                            onPress={() =>
                                this.props.navigation.navigate("ForgotPassword", { screen: "ForgotPassword" })
                            }>
                            <Text style={{
                                color: "#9b9b9b",
                                alignSelf: "center",
                                justifyContent: "center",
                                fontFamily: "Helvetica",
                                fontSize: 14
                            }}>
                                {localeStrings.logInStrings.forgotPassword}
                            </Text>
                        </TouchableOpacity>
                    </View>


                    <View style={{ justifyContent: "flex-end", flex: 1 }}>
                        <View style={{
                            flexDirection: 'row',
                            width: "80%",
                            justifyContent: "center",
                            alignContent: "center",
                            alignSelf: "center",
                            marginTop: "5%",
                            borderRadius: 10,
                            height: 55
                        }}>

                            <Text style={{
                                color: "#9b9b9b",
                                alignSelf: "center",
                                justifyContent: "center",
                                fontFamily: "Helvetica",
                                fontSize: 14
                            }}>
                                {localeStrings.logInStrings.orJoin}
                            </Text>

                        </View>


                        <View style={{
                            flexDirection: 'row',
                            width: "100%",
                            justifyContent: "center",
                            alignContent: "center",
                            height: 55,
                            backgroundColor: "#eb1b0e",
                            marginBottom: 0
                        }}>
                            <TouchableOpacity
                                style={{ alignSelf: "center", justifyContent: "center", height: 55, width: "100%" }}
                                onPress={() => {
                                    if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                                        this._signIn(); //Bypass OTP verification for development and internal testing.
                                    } else {
                                        this.setState({ loginType: 1 }) //Google Login
                                        this.showModal();
                                    }
                                }}
                            >
                                <Image style={{ width: 40, height: 40, alignSelf: "center", resizeMode: "contain" }}
                                    source={require('../../res/images/g-white.png')} />
                            </TouchableOpacity>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            width: "100%",
                            justifyContent: "center",
                            alignContent: "center",
                            alignSelf: "center",
                            height: 55,
                            backgroundColor: 'rgba(57,83,164,1.2)',


                        }}>
                            <Login navigation={this.props.navigation} />
                        </View>
                    </View>

                </ScrollView>
            </View>
        )
    }
}

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = {
            enterActivity: false,
            username: "",
            userNameValid: false,
            password: "",
            passwordValid: false,
            loading: false,
            countryCode: "972",
            remainingTime: RESEND_OTP_TIME_LIMIT,
            isButtonDisabled: true,
            numberModalVisible: false,
            IsModalVisibleConfirmed: false,
            TextInputDisable: true,
            disableSendButton: false,
            loginType: 0,
            mobileNo: '',
            otp: '',
            showResend: false,
            selectedCountryCode: "IL"
        }
        this.hideModal();
        //this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    callApi(value, token) {
        let OBJ = {
            UserId: value,
            DeviceToken: token,
            DeviceType: Platform.OS
        }
        //alert(JSON.stringify(OBJ))
        let uri = GlobalVariables._URL + "/core/updatedevicetoken"
        try {

            fetch(uri, {
                method: "POST",
                headers: {
                    //'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(OBJ)

            })

                .then(response => response.json())
                .then(response => {
                    console.log("true");
                    console.log('TOKEN WAS:' + token);
                })
                .catch(error => {
                    console.error(error)
                });
        } catch (e) {

            console.error("upload catch error", e);


        }
    }

    startResendOtpTimer = () => {
        this.setState({
            isButtonDisabled: false,
        });

        setTimeout(() => {
            this.setState({
                isButtonDisabled: true,
            });
        }, RESEND_OTP_TEXT_TIME)
        this.setState({ remainingTime: RESEND_OTP_TIME_LIMIT });
        clearInterval(timer);
        timer = setInterval(() => {
            if (!this.state.remainingTime) {
                clearInterval(timer);
                this.setState({
                    TextInputDisable: true,
                    disableSendButton: false,
                });
                return false;
            }
            this.setState(prevState => {
                return { remainingTime: prevState.remainingTime - 1 }
            });
        }, 1000);
    };






    onResendOtpButtonPress() {
        if (isNaN(mobNo)) {
            alert(localeStrings.otpScreen.inputNumber);
            return;
        }
        try {
            //If First digit of mobile number is 0, trim the number and remove leading 0
            if (mobNo.length === 10) {
                var digits = mobNo.toString().split('');
                var realDigits = digits.map(Number)
                if (realDigits[0] === 0) {
                    mobNo = mobNo.substring(1);
                }
            }
            let data = new FormData();
            let mobWIthCountryCode = this.state.countryCode + mobNo;
            mobNo = mobWIthCountryCode;
            console.log(mobNo);
            data.append("phoneNumber", mobNo);
            data.append("otpType", 1);
            let url = `${GlobalVariables._URL}/core/sendOTP`;
            fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                body: data
            })
                .then(response => response.json())
                .then(response => {
                    if (response !== true) {
                        alert(localeStrings.otpScreen.unableToSend);
                        this.setState({ TextInputDisable: true, disableSendButton: false, showResend: false, isButtonDisabled: true, });
                    } else {
                        this.setState({ showResend: true });
                        this.startResendOtpTimer();
                    }
                    console.log('OTP STATUS:' + response)
                })
                .catch(error => {
                    console.log('Error : ', error);
                });
        } catch (e) {
            console.log('Error : ', error);
        }
    }






    verifyOtp() {
        if (isNaN(otp) || (otp.length != 4)) {
            alert(localeStrings.logInStrings.noDetailsMatch);
            return;
        }
        try {
            let data = new FormData();
            data.append("phoneNumber", mobNo);
            data.append("otpType", 1);
            data.append("otp", otp);
            let url = `${GlobalVariables._URL}/core/verifyOTP`;
            fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                body: data
            })
                .then(response => response.json())
                .then(response => {

                    if (response === true) {
                        this.hideModal();
                        /*if (this.state.loginType === 0) {
                            formOb.submit();
                        } else*/ if (this.state.loginType === 1) { // Google Login
                            this._signIn();
                        } else if (this.state.loginType === 2) { // Facebook Login
                            this.getPublicProfile();
                        }

                    } else {
                        alert(localeStrings.logInStrings.noDetailsMatch);
                        this.setState({
                            isButtonDisabled: true,
                        });
                        this.refs.OTP.clear();
                        clearInterval(timer);
                    }
                })
                .catch(error => {
                    console.log('Error : ', error);
                });
        } catch (e) {
            console.log('Error : ', error);
        }
    }







    showModal() {
        this.setState({ numberModalVisible: true });
    }

    hideModal() {
        this.setState({ numberModalVisible: false });
    }

    getPublicProfile() {
        LoginManager.logInWithPermissions(["public_profile", "email"]).then(
            result => {
                if (result.isCancelled) {
                    console.log("Login cancelled");
                } else {
                    console.log(
                        "Login success with permissions: " +
                        result.grantedPermissions.toString()
                    );
                    AccessToken.getCurrentAccessToken().then(
                        (data) => {
                            accessToken = data.accessToken;
                            fbUserId = data.userID;
                            const infoRequest = new GraphRequest(
                                '/me?fields=id,name,email,picture.type(large)&access_token=' + data.accessToken.toString(),
                                null,
                                (error, result) => {
                                    if (error) {
                                        console.log('Error fetching data: ' + error.toString());
                                        console.log(error);
                                    } else {
                                        console.log(result);
                                        this.SaveFbId(result);
                                    }
                                }
                            );
                            new GraphRequestManager().addRequest(infoRequest).start();
                        }//this.handleFacebookLogin
                    )
                }
            }
        ).then(error => {
            console.log(error);
        });
    }

    SaveFbId(responseData) {

        let data = new FormData();
        if (responseData.email == undefined || responseData.email == null || responseData.email == "null" || responseData.email == "undefined" || responseData.email == '') {
            Alert.alert(
                localeStrings.logInStrings.alertHeading,
                localeStrings.logInStrings.alertText,
                [
                    {
                        text: localeStrings.forgotPasswordStrings.ok,
                    },
                ],
                { cancelable: false }
            )
            responseData = '';
            return 0;
        }
        data.append("email", responseData.email);
        data.append("fullName", responseData.name);
        data.append("password", 'pass' + responseData.id);
        data.append("image", responseData.picture.data.url)
        if (isNaN(mobNo)) {
            //if input is not a number then here
            mobNo = "";
        } else {
            //if input is number then here
            mobNo = mobNo;
        }
        data.append("phoneNumber", mobNo);
        try {
            this.setState({ enterActivity: true });
            fetch(GlobalVariables._URL + "/core/loginwithfacebook", {
                method: "POST",
                headers: new Headers({
                    //'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }),
                body: data
            })

                .then(response => response.json())
                .then(response => {
                    this.setState({ enterActivity: false });
                    if (response.succeeded != false && response != "") {
                        AsyncStorage.setItem("UserLogged", "true");
                        AsyncStorage.setItem("userId", JSON.stringify(response));
                        AsyncStorage.setItem("loggedAccountType", "1");
                        AsyncStorage.setItem("fbUserId", fbUserId);
                        AsyncStorage.setItem("fbAccessToken", accessToken);
                        AsyncStorage.getItem('UserLogged').then((value) => {

                            if (value !== "") {
                                if (value === "true") {
                                    AsyncStorage.getItem('userId').then((userId) => {

                                        if (userId !== null && userId !== "") {
                                            firebase.messaging().getToken().then((token) => {
                                                this.callApi(userId, token);
                                                console.log('tok- ' + token);
                                            });
                                        }

                                    }).done();


                                }
                            }
                        }).done();
                        this.setState({ loggedAccountType: "1" });
                        session.value = "true";
                        //FBLoginManager.logout(() => {console.log('Logout facebook ok!')})
                        this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                    } else {
                        alert(JSON.stringify(response.errors[0].description));
                        //this.customFacebookLogout();
                        //LoginManager.logout(() => {console.log('Logout facebook ok!')})
                    }
                })
                .catch(error => {

                    console.log("upload error", error);

                });
        } catch (e) {

            console.log("upload catch error", e);

        }

    }

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                width: "100%",
                justifyContent: "center",
                alignContent: "center",
                alignSelf: "center",
                height: 55,
                backgroundColor: "#4267B2",
                marginBottom: 0
            }}>
                <Modal
                    animationType="fade"
                    visible={this.state.numberModalVisible}
                    transparent={true}
                    style={styles.modal}
                >
                    <View style={styles.modalFirstView}>
                        <View style={styles.numberModal}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.hideModal();
                                }}
                                style={styles.modalCloseButton}>
                                <Text style={{ fontSize: 20, color: "gray", fontWeight: "bold" }}>X</Text>
                            </TouchableOpacity>
                            {/*// todo: Text If any*/}
                            <View style={styles.modalCenterText}>
                                <Text style={{
                                    fontSize: 16,
                                    color: "gray",
                                    fontWeight: "bold"
                                }}>{this.state.TextInputDisable ? localeStrings.otpScreen.inputNumber : localeStrings.otpScreen.inputOTP}</Text>
                                {/*<Text style={{ fontSize: 13, color: "black", marginTop: "15%", textAlign: "center" }}>*/}
                                {/*    to verify via OTP*/}
                                {/*</Text>*/}



                            </View>

                            <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', }}>
                                {this.state.TextInputDisable ? <CountryPicker
                                    countryCodes={["IL", "GB", "US", "IT", "FR", "ES", "PT", "RU", "TR", "IN"]}
                                    containerButtonStyle={{ marginTop: 10, marginLeft: 30 }}
                                    withCallingCode={true}
                                    withEmoji={true}
                                    countryCode={this.state.selectedCountryCode}
                                    visible={this.state.pickerVisible}
                                    onSelect={country =>
                                        this.setState({ countryCode: country.callingCode, selectedCountryCode: country.cca2 })
                                    }
                                    onClose={() => this.setState({ pickerVisible: false })}
                                /> : <View><Text style={{ marginLeft: "15%" }}> </Text></View>}

                                <View style={{
                                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                                    width: "70%",
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignSelf: "center",
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: 6,
                                    height: 50
                                }}>
                                    {this.state.TextInputDisable ?
                                        <View style={{
                                            marginRight: 10,
                                            alignSelf: "center",
                                            justifyContent: "center"
                                        }}>

                                            <Text
                                                style={{ fontSize: 18, marginRight: 5 }}>+{this.state.countryCode}</Text>
                                        </View> : <View />}

                                    {this.state.TextInputDisable ?
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={{
                                                width: "70%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                            }}
                                        >

                                            <View style={{
                                                width: "100%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                                alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
                                                marginLeft: I18nManager.isRTL ? -10 : 0
                                            }}>
                                                <TextInput
                                                    style={styles.TextInputStyle}
                                                    ref='mobileNo'
                                                    value={this.state.mobileNo}
                                                    onChangeText={(mobileNo) => this.setState({ mobileNo: mobileNo })}
                                                    keyboardType="phone-pad"
                                                    placeholder='XXXXXXXXXX'
                                                    maxLength={10}
                                                    autoFocus={true} />

                                            </View>
                                        </TouchableOpacity> :
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={{
                                                width: "80%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                            }}
                                        >

                                            <View style={{
                                                width: "100%",
                                                justifyContent: "center",
                                                alignSelf: "center",
                                                height: "100%",
                                                alignItems: "flex-start"
                                            }}>
                                                <TextInput
                                                    style={styles.otpInputStyle}
                                                    ref='OTP'
                                                    value={this.state.otp}
                                                    onChangeText={(otp) => this.setState({ otp: otp })}
                                                    keyboardType="phone-pad"
                                                    placeholder='----'
                                                    maxLength={4}
                                                    autoFocus={true}
                                                />

                                            </View>
                                        </TouchableOpacity>
                                    }


                                </View>


                            </View>
                            {/*//todo: Needed for OTP verification*/}
                            <View style={{
                                flexDirection: 'row',
                                width: "100%",
                                justifyContent: "center",
                                alignContent: "center",
                                alignSelf: "center",
                                marginTop: 20
                            }}>
                                {(this.state.isButtonDisabled === true) ? (
                                    <TouchableOpacity onPress={() => {
                                        mobNo = this.state.mobileNo;
                                        if ((isNaN(mobNo) || (mobNo.length != 9)) && (isNaN(mobNo) || (mobNo.length != 10))) {
                                            alert(localeStrings.otpScreen.inputNumber);
                                            return;
                                        }
                                        this.setState({ TextInputDisable: false, disableSendButton: true })
                                        this.onResendOtpButtonPress();
                                    }}>
                                        <Text style={{ color: "#ba8902" }}>
                                            {this.state.showResend ? localeStrings.otpScreen.resendOtp : ''}
                                        </Text>
                                    </TouchableOpacity>

                                ) : (
                                        <Text>
                                            {localeStrings.otpScreen.resendOtpIn} {this.state.remainingTime} {localeStrings.otpScreen.seconds}
                                        </Text>

                                    )}
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                width: "40%",
                                justifyContent: "center",
                                alignContent: "center",
                                alignSelf: "center",
                                backgroundColor: "#26466c",
                                marginTop: 25,
                                borderRadius: 10,
                                height: 40
                            }}>

                                {this.state.TextInputDisable ?
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 65,
                                            width: "100%"
                                        }}
                                        onPress={() => {
                                            mobNo = this.state.mobileNo;
                                            if ((isNaN(mobNo) || (mobNo.length != 9)) && (isNaN(mobNo) || (mobNo.length != 10))) {
                                                alert(localeStrings.otpScreen.inputNumber);
                                                return;
                                            }
                                            this.setState({ TextInputDisable: false, disableSendButton: true })
                                            this.onResendOtpButtonPress();
                                        }}
                                    //disabled={this.state.disableSendButton}
                                    >

                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>{localeStrings.otpScreen.getOTP}</Text>
                                    </TouchableOpacity> :
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 65,
                                            width: "100%"
                                        }}
                                        onPress={() => {
                                            otp = this.state.otp;
                                            console.log(mobNo)
                                            if (isNaN(otp) || (otp.length != 4)) {
                                                alert(localeStrings.logInStrings.noDetailsMatch);
                                                return;
                                            }

                                            this.verifyOtp();
                                        }}
                                    >

                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>{localeStrings.otpScreen.btnText}</Text>
                                    </TouchableOpacity>
                                }


                            </View>

                        </View>
                    </View>
                </Modal>
                <TouchableOpacity
                    style={{ alignSelf: "center", justifyContent: "center", height: 55, width: "100%" }}
                    onPress={
                        () => {
                            if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                                this.getPublicProfile(); //Bypass OTP verification for development and internal testing.
                            } else {
                                this.setState({ loginType: 2 }) //FB Login
                                this.showModal();
                            }
                        }
                    }>
                    <Image style={{ width: 35, height: 35, alignSelf: "center", resizeMode: "contain" }}
                        source={require('../../res/images/facebookF.png')} />
                </TouchableOpacity>
            </View>

        );
    }
}
