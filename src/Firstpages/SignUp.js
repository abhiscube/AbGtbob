import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    AsyncStorage,
    ScrollView,
    Alert, ActivityIndicator, StatusBar, I18nManager, TouchableHighlight, Platform
} from "react-native";
import session from "../session";
import PhotoUpload from 'react-native-photo-upload'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Foect from 'foect';
import { GlobalVariables } from "../GlobalVariables";
// var { FBLogin, FBLoginManager,AccessToken } = require('react-native-facebook-login');
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import DatePicker from 'react-native-datepicker'
import PropTypes from 'prop-types';
import GPSState from 'react-native-gps-state';
import StyleSheetFactory from "../../res/styles/LocaleStyles";
import localeStrings from '../../res/strings/LocaleStrings';
import Spinner from 'react-native-loading-spinner-overlay';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
let photoImg = require("../../res/images/addPhoto.png");
import ImagePicker from 'react-native-image-picker';
import { LoginManager, AccessToken, GraphRequest, GraphRequestManager, LoginButton } from 'react-native-fbsdk';
import firebase from "../firebase";
import moment from "moment";
import CountryPicker from "react-native-country-picker-modal";
import Modal from "react-native-modal";
var maxBirthdayDateString;
let accessToken = null, fbUserId = null;
let timer = () => {
};
var output = [];
const RESEND_OTP_TIME_LIMIT = 60;
const RESEND_OTP_TEXT_TIME = 60000;
let num, mobNo, otp = "";
let formOb;
export default class SignUp extends React.Component {

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
        this.setState({ enterActivity: true });
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
        let data = new FormData();
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
                    this.setState({ enterActivity: false });
                    if (response.succeeded != false && response != "") {
                        AsyncStorage.setItem("UserLogged", "true");
                        AsyncStorage.setItem("userId", response);
                        AsyncStorage.setItem("loggedAccountType", "2");
                        this.setState({ loggedAccountType: "2" });
                        session.value = "true";
                        AsyncStorage.getItem('userId').then((userId) => {

                            if (userId !== null && userId !== "") {
                                firebase.messaging().getToken().then((token) => {
                                    this.callApi(userId, token);
                                    console.log('tok- ' + token);
                                });
                            }

                        }).done();
                        this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                    }
                    else {
                        alert(JSON.stringify(response.errors[0].description));
                        GoogleSignin.signOut();
                    }
                })
                .catch(error => {

                    alert("Server Error Occurred. Please try Again.");

                });
        } catch (e) {
            // alert("upload catch error", e);
            GoogleSignin.logout(() => { console.log('Logout Google ok!') })
        }

    }

    revokeAccess = async () => {
        try {
            await GoogleSignin.revokeAccess();
            console.log('deleted');
        } catch (error) {
            console.error(error);
        }
    };

    _signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo);
            this.setState({ userInfo: userInfo, loggedIn: true });
            this.SaveGoogleId(userInfo);
        } catch (error) {
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
            await GoogleSignin.revokeAccess();
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
            headerTitle: localeStrings.signUpStrings.signUp,
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
        maxBirthdayDateString = moment(new Date()).format('dd.MM.yyyy');
        this.params = this.props.navigation.state.params;
        this.state = {
            enterActivity: false,
            photo: photoImg,
            fullName: "",
            fullNameValid: false,
            emailValid: false,
            retypeEmailValid: false,
            passwordValid: false,
            confirmPasswordValid: false,
            emailDontMatchString: localeStrings.signUpStrings.enterValidEmail,
            passwordDontMatchString: localeStrings.signUpStrings.enterStrongPassword,
            date: "",
            email: "",
            RetypeEmail: "",
            password: "",
            confirmPassword: "",
            photoSource: "",
            pushData: [],
            loggedIn: false,
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
                        if (this.state.loginType === 0) {
                            //formOb.submit();

                            GlobalVariables.userId.value = this.state.userId;
                            AsyncStorage.setItem("UserLogged", "true");
                            AsyncStorage.setItem("role", "customer")
                            AsyncStorage.setItem("email", this.state.email)
                            AsyncStorage.setItem("userId", this.state.userId);

                            AsyncStorage.setItem("loggedAccountType", "0");
                            this.setState({ loggedAccountType: "0" });
                            session.value = "true";

                            if (this.params.id === undefined) {
                                console.log('going home');
                                AsyncStorage.getItem('userId').then((userId) => {

                                    if (userId !== null && userId !== "") {
                                        firebase.messaging().getToken().then((token) => {
                                            this.callApi(userId, token);
                                            console.log('tok- ' + token);
                                        });
                                    }

                                }).done();

                                this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                            } else {
                                this.enableGPS(() => {
                                    this.enableGPS(() => {
                                        console.log('going barlocation');
                                        this.props.navigation.navigate("BarLocation", {
                                            screen: "BarLocation",
                                            barId: this.params.id
                                        });
                                    });
                                });
                            }
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

    showModal() {
        this.setState({ numberModalVisible: true });
    }

    hideModal() {
        this.setState({ numberModalVisible: false });
    }
    getPhoto() {
        const options = {
            title: 'Select Picture',
            maxWidth: 300,
            maxHeight: 300,
            storageOptions: { skipBackup: true, path: 'images', cameraRoll: true, waitUntilSaved: true }
        };

        ImagePicker.showImagePicker(options, (response) => {


            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {

                //let source = {uri: response.uri.replace('file://', '')};
                let source = { uri: response.uri };
                this.setState({
                    photo: source,
                    photoSource: response
                });


            }
        });
    }

    enableGPS(fnCallback: Function) {

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

    Register() {
        let newDate = this.state.date.split(".");

        this.setState({ enterActivity: true });
        let data = new FormData();

        data.append("fullName", this.state.fullName);
        data.append("birthday", newDate[1] + "/" + newDate[0] + "/" + newDate[2]);
        data.append("email", this.state.email);
        data.append("password", this.state.password);

        if (mobNo.length === 10) {
            var digits = mobNo.toString().split('');
            var realDigits = digits.map(Number)
            if (realDigits[0] === 0) {
                mobNo = mobNo.substring(1);
            }
        }

        if (isNaN(mobNo)) {
            //if input is not a number then here
            mobNo = "";
        } else {
            //if input is number then here
            mobNo = mobNo;
        }

        data.append("phoneNumber", mobNo);
        if (this.state.photoSource !== '') {
            data.append("file", {
                name: this.state.photoSource.fileName,
                type: this.state.photoSource.type,
                uri: this.state.photoSource.uri,
            });
        }

        try {
            fetch(GlobalVariables._URL + "/core/register", {
                method: "POST",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }),
                body: data

            })

                .then(response => response.json())
                .then(response => {


                    if (response !== "") {

                        if (response.succeeded === false) {
                            this.setState({ enterActivity: false });
                            alert(JSON.stringify(response.errors[0].description))
                        } else {
                            this.setState({ TextInputDisable: false, disableSendButton: true })
                            this.onResendOtpButtonPress();
                            this.showModal();
                            this.setState({ enterActivity: false, userId: response });
                            // GlobalVariables.userId.value = response;
                            // AsyncStorage.setItem("UserLogged", "true");
                            // AsyncStorage.setItem("role", "customer")
                            // AsyncStorage.setItem("email", this.state.email)
                            // AsyncStorage.setItem("userId", response);

                            // AsyncStorage.setItem("loggedAccountType", "0");
                            // this.setState({ loggedAccountType: "0" });
                            // session.value = "true";

                            // if (this.params.id === undefined) {
                            //     console.log('going home');
                            //     AsyncStorage.getItem('userId').then((userId) => {

                            //         if (userId !== null && userId !== "") {
                            //             firebase.messaging().getToken().then((token) => {
                            //                 this.callApi(userId, token);
                            //                 console.log('tok- ' + token);
                            //             });
                            //         }

                            //     }).done();

                            //     this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                            // } else {
                            //     this.enableGPS(() => {
                            //         this.enableGPS(() => {
                            //             console.log('going barlocation');
                            //             this.props.navigation.navigate("BarLocation", {
                            //                 screen: "BarLocation",
                            //                 barId: this.params.id
                            //             });
                            //         });
                            //     });
                            // }
                        }
                    } else {
                        this.setState({ enterActivity: false });
                        alert(localeStrings.signUpStrings.registerFailed)
                    }



                })
                .catch(error => {
                    this.setState({ enterActivity: false });
                    console.log(error);
                    console.log(data);
                    console.log("upload error", error);

                });
        } catch (e) {
            this.setState({ enterActivity: false });
            console.error("upload catch error", e);

        }
    }


    render() {
        return (
            <View style={{ flex: 1, width: "100%" }}>

                <Modal
                    animationType="fade"
                    visible={this.state.numberModalVisible}
                    transparent={true}
                    style={styles.modal}
                >
                    <View style={styles.modalFirstView}>
                        <View style={styles.numberModal}>
                            {this.state.TextInputDisable == false ? <View /> : <TouchableOpacity
                                onPress={() => {
                                    this.hideModal();
                                }}
                                style={styles.modalCloseButton}>
                                <Text style={{ fontSize: 20, color: "gray", fontWeight: "bold" }}>X</Text>
                            </TouchableOpacity>}

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

                            <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
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
                                            this.setState({ TextInputDisable: false, disableSendButton: true });
                                            this.onResendOtpButtonPress();
                                        }}
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
                <StatusBar hidden={false} />
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }}
                        onPress={() => {
                            { this.getPhoto() }
                        }}
                    >


                        <Image
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                marginBottom: 8,
                                marginTop: 8
                            }}
                            resizeMode='cover'
                            source={this.state.photo}
                        />




                    </TouchableOpacity>


                    <Foect.Form
                        onValidSubmit={model => {
                            if (model["email"] !== model["retypeEmail"]) {
                                alert(localeStrings.signUpStrings.emailNotMatch);
                                this.setState({ retypeEmailValid: true, emailDontMatchString: localeStrings.signUpStrings.emailMatchStrings });
                            } else
                                if (model["password"] !== model["retypePassword"]) {
                                    alert(localeStrings.signUpStrings.passwordNotMatch);
                                    this.setState({ confirmPasswordValid: true, passwordDontMatchString: localeStrings.signUpStrings.passwordMatchStrings });
                                } else {
                                    this.Register();
                                }



                        }}

                        onInvalidSubmit={(errors, values) => {
                            console.log(errors, values);
                            console.log(errors["fullName"].required);

                            if (errors["fullName"].required) {
                                this.setState({ fullNameValid: true })
                            } else {
                                this.setState({ fullNameValid: false })
                            }

                            if (errors["email"].required) {
                                this.setState({ emailValid: true })
                            } else {
                                this.setState({ emailValid: false })
                            }

                            if (errors["retypeEmail"].required) {
                                this.setState({ retypeEmailValid: true })
                            } else {
                                this.setState({ retypeEmailValid: false })
                            }

                            if (errors["password"].required) {
                                this.setState({ passwordValid: true })
                            } else {
                                this.setState({ passwordValid: false })
                            }

                            if (errors["retypePassword"].required) {
                                this.setState({ confirmPasswordValid: true })
                            } else {
                                this.setState({ confirmPasswordValid: false })
                            }

                        }}
                    >

                        {form => (
                            <View>
                                <Foect.Control name="fullName" required minLength={3}>

                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            marginTop: "1%",
                                            borderRadius: 6,
                                            height: 50
                                        }}>
                                            <View style={{
                                                marginRight: 10,
                                                alignSelf: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Image style={styles.emailImgPass}
                                                    source={require('../../res/images/userPlaceholder.png')} />
                                            </View>

                                            <TouchableOpacity
                                                activeOpacity={1}
                                                style={{
                                                    width: "80%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                }}
                                                onPress={() => this.fullName.focus()}>
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput ref={ref => this.fullName = ref}
                                                        style={styles.logInFields}
                                                        placeholder={localeStrings.signUpStrings.fullNamePlaceHolder}
                                                        placeholderTextColor="#9b9b9b"
                                                        onBlur={control.markAsTouched}


                                                        onChangeText={(text) => {
                                                            control.onChange(text);
                                                            if (control.isValid) {
                                                                this.setState({ fullNameValid: false });
                                                            }
                                                            this.setState({ fullName: text })
                                                        }}

                                                        value={this.state.fullName}
                                                    />

                                                    {control.isInvalid && control.isTouched || this.state.fullNameValid ?
                                                        <View>
                                                            <Text
                                                                style={styles.invalidField}>{localeStrings.signUpStrings.enterFullName}</Text>

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
                                    backgroundColor: "#f5f5f5",
                                    marginTop: "1%",
                                    borderRadius: 6,
                                    height: 50
                                }}>
                                    <View style={{ marginRight: 10, alignSelf: "center", justifyContent: "center" }}>
                                        <Image style={styles.emailImgPass}
                                            source={require('../../res/images/userPlaceholder.png')} />
                                    </View>
                                    <View style={{ width: "80%", justifyContent: "center", height: "100%" }}>
                                        <DatePicker
                                            style={{ width: 280, justifyContent: "center" }}
                                            date={this.state.date}
                                            mode="date"
                                            androidMode="spinner"
                                            format="DD.MM.YYYY"
                                            placeholder={localeStrings.signUpStrings.birthdayPlaceHolder}
                                            minDate="01.01.1950"
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            showIcon={false}
                                            maxDate={maxBirthdayDateString}

                                            customStyles={{
                                                dateInput: {
                                                    borderWidth: 0,
                                                    justifyContent: "center",
                                                    alignItems: "flex-start",
                                                    textAlign: "flex-start",

                                                },
                                                btnTextConfirm: {
                                                    color: "#26466c",
                                                    fontWeight: "500"
                                                },
                                                btnTextCancel: {
                                                    color: "red",
                                                    fontWeight: "500"
                                                },
                                                placeholderText: {
                                                    alignItems: "flex-start",
                                                    justifyContent: "center",
                                                    color: '#9b9b9b'
                                                }
                                            }}
                                            onDateChange={(date) => {
                                                this.setState({ date: date })
                                            }}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', paddingTop: 4 }}>

                                    <CountryPicker
                                        countryCodes={["IL", "GB", "US", "IT", "FR", "ES", "PT", "RU", "TR", "IN"]}
                                        containerButtonStyle={{ marginTop: 10, marginLeft: 50, shadowColor: 'grey' }}
                                        withCallingCode={true}
                                        withEmoji={true}
                                        countryCode={this.state.selectedCountryCode}
                                        visible={this.state.pickerVisible}
                                        onSelect={country =>
                                            this.setState({ countryCode: country.callingCode, selectedCountryCode: country.cca2 })
                                        }
                                        onClose={() => this.setState({ pickerVisible: false })}
                                    />


                                    <View style={{
                                        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                                        width: "65%",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignSelf: "center",
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: 6,
                                        height: 50,
                                    }}>
                                        <View style={{
                                            marginRight: 10,
                                            alignSelf: "center",
                                            justifyContent: "center"
                                        }}>

                                            <Text
                                                style={{ fontSize: 18, marginRight: 5 }}>+{this.state.countryCode}</Text>
                                        </View>
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
                                                />

                                            </View>
                                        </TouchableOpacity>




                                    </View>


                                </View>

                                <Foect.Control name="email" required
                                    pattern={/(?=^.{6,}$)^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            marginTop: "1%",
                                            borderRadius: 6,
                                            height: 50
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
                                                onPress={() => this.email.focus()}>
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput ref={ref => this.email = ref}
                                                        style={styles.logInFields}
                                                        keyboardType="email-address"
                                                        autoCapitalize='none'
                                                        placeholder={localeStrings.signUpStrings.emailPlaceHolder}
                                                        placeholderTextColor="#9b9b9b"

                                                        onBlur={() => {
                                                            control.markAsTouched();
                                                            if (control.isValid) {
                                                                console.log("on onblur");
                                                                this.setState({ emailValid: false });
                                                            }
                                                        }}

                                                        onChangeText={(text) => {
                                                            control.onChange(text);
                                                            if (control.isValid) {
                                                                this.setState({ emailValid: false });
                                                            }
                                                            this.setState({ email: text })
                                                        }}

                                                        value={this.state.email}
                                                    />

                                                    {control.isInvalid && control.isTouched || this.state.emailValid ?
                                                        <View>
                                                            {control.errors.pattern || this.state.emailValid ?
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterValidEmail}</Text> :
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterEmail}</Text>}
                                                        </View> : null}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Foect.Control>

                                <Foect.Control name="retypeEmail" required
                                    pattern={/(?=^.{6,}$)^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            marginTop: "1%",
                                            borderRadius: 10,
                                            height: 50
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
                                                onPress={() => this.retypeEmail.focus()}
                                            >
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput ref={ref => this.retypeEmail = ref}

                                                        style={styles.logInFields}
                                                        autoCapitalize='none'
                                                        keyboardType="email-address"
                                                        textContentType="emailAddress"
                                                        placeholder={localeStrings.signUpStrings.retypeEmailPlaceHolder}
                                                        placeholderTextColor="#9b9b9b"

                                                        onBlur={() => {
                                                            control.markAsTouched();
                                                            if (control.isValid) {
                                                                console.log("on onblur");
                                                                this.setState({ retypeEmailValid: false });
                                                            }
                                                        }}
                                                        onChangeText={(text) => {
                                                            control.onChange(text);

                                                            if (text.length > this.state.email.length - 2 && this.state.email !== text) {
                                                                this.setState({
                                                                    retypeEmailValid: true,
                                                                    emailDontMatchString: localeStrings.signUpStrings.emailMatchStrings
                                                                });
                                                            } else if (control.isValid) {
                                                                this.setState({
                                                                    retypeEmailValid: false,
                                                                    emailDontMatchString: localeStrings.signUpStrings.enterValidEmail
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    retypeEmailValid: true,
                                                                    emailDontMatchString: localeStrings.signUpStrings.enterValidEmail
                                                                });
                                                            }
                                                            this.setState({ RetypeEmail: text });

                                                        }}

                                                        value={this.state.RetypeEmail}
                                                    />

                                                    {control.isTouched && control.isInvalid || this.state.retypeEmailValid ?
                                                        <View>
                                                            {control.errors.pattern || this.state.retypeEmailValid ?
                                                                <Text
                                                                    style={styles.invalidField}>{this.state.emailDontMatchString}</Text> :
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterEmail}</Text>}
                                                        </View> : null}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Foect.Control>


                                <Foect.Control name="password" required
                                    pattern={/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            marginTop: "1%",
                                            borderRadius: 6,
                                            height: 50
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
                                                onPress={() => this.password.focus()}>
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput ref={ref => this.password = ref}
                                                        style={styles.logInFields}
                                                        autoCapitalize='none'
                                                        placeholder={localeStrings.signUpStrings.passwordPlaceHolder}
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
                                                        <View>
                                                            {control.errors.pattern || this.state.passwordValid ?
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterStrongPassword}</Text> :
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterPassword}</Text>}
                                                        </View> : null}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Foect.Control>

                                <Foect.Control name="retypePassword" required
                                    pattern={/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: "80%",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: "#f5f5f5",
                                            marginTop: "1%",
                                            borderRadius: 6,
                                            height: 50
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
                                                onPress={() => this.retypePassword.focus()}>
                                                <View style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    alignSelf: "center",
                                                    height: "100%",
                                                    alignItems: "flex-start"
                                                }}>
                                                    <TextInput ref={ref => this.retypePassword = ref}
                                                        style={styles.logInFields}

                                                        autoCapitalize='none'
                                                        placeholder={localeStrings.signUpStrings.retypePasswordPlaceHolder}
                                                        secureTextEntry={true}
                                                        placeholderTextColor="#9b9b9b"
                                                        onBlur={control.markAsTouched}

                                                        onChangeText={(text) => {
                                                            control.onChange(text);

                                                            if (text.length > this.state.password.length - 2 && this.state.password !== text) {
                                                                this.setState({
                                                                    confirmPasswordValid: true,
                                                                    passwordDontMatchString: localeStrings.signUpStrings.passwordMatchStrings
                                                                });
                                                            } else if (control.isValid) {
                                                                this.setState({
                                                                    confirmPasswordValid: false,
                                                                    passwordDontMatchString: localeStrings.signUpStrings.enterStrongPassword
                                                                });
                                                            } else {
                                                                this.setState({
                                                                    confirmPasswordValid: true,
                                                                    passwordDontMatchString: localeStrings.signUpStrings.enterStrongPassword
                                                                });
                                                            }
                                                            this.setState({ confirmPassword: text });

                                                        }}

                                                        value={this.state.confirmPassword}
                                                    />

                                                    {control.isTouched && control.isInvalid || this.state.confirmPasswordValid ?
                                                        <View>
                                                            {control.errors.pattern || this.state.confirmPasswordValid ?
                                                                <Text
                                                                    style={styles.invalidField}>{this.state.passwordDontMatchString}</Text> :
                                                                <Text
                                                                    style={styles.invalidField}>{localeStrings.signUpStrings.enterPassword}</Text>}
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
                                    backgroundColor: form.isInvalid ? "gray" : "#266c3a",
                                    marginTop: "3%",
                                    borderRadius: 6,
                                    height: 50
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            height: 55,
                                            width: "100%",
                                            backgroundColor: "#266c3a",
                                            borderRadius: 4
                                        }}
                                        onPress={() => {
                                            formOb = form;
                                            if (this.fullName._lastNativeText === '' || this.email._lastNativeText === '' || this.retypeEmail._lastNativeText === '' || this.password._lastNativeText === '' || this.retypePassword._lastNativeText === '') {
                                                alert(localeStrings.firstPageStrings.missingDetails)
                                            } else {
                                                if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                                                    form.submit();
                                                } else {


                                                    mobNo = this.state.mobileNo;
                                                    if ((isNaN(mobNo) || (mobNo.length != 9)) && (isNaN(mobNo) || (mobNo.length != 10))) {
                                                        alert(localeStrings.otpScreen.inputNumber);
                                                        return;
                                                    }

                                                    form.submit();
                                                }
                                            }


                                        }}>
                                        <Text style={{
                                            color: "white",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>
                                            {localeStrings.signUpStrings.register}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Foect.Form>

                    <View style={{ marginTop: "1%" }} />
                    <View style={{
                        flexDirection: 'row',
                        width: "80%",
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        height: 45,
                        borderRadius: 10
                    }}>

                        <Text style={{
                            color: "#9b9b9b",
                            alignSelf: "center",
                            justifyContent: "center",
                            fontFamily: "Helvetica",
                            fontSize: 14
                        }}>
                            {localeStrings.signUpStrings.orJoin}
                        </Text>

                    </View>


                    <View style={{
                        flexDirection: 'row',
                        width: "100%",
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        height: 55,
                        backgroundColor: "#eb1b0e",
                        marginBottom: 0
                    }}>
                        <TouchableOpacity
                            style={{ alignSelf: "center", justifyContent: "center", height: 55, width: "100%" }}
                            onPress={() => {
                                if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                                    this._signIn(); //Bypass OTP verification for development and internal testing
                                } else {
                                    this.setState({ loginType: 1 }) //Google Login
                                    this.showModal();
                                }
                            }}>
                            <Image style={{ width: 35, height: 35, alignSelf: "center", resizeMode: "contain" }}
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

                </ScrollView>
            </View>

        )
    }
}


class Login extends React.Component {


    constructor(props) {
        super(props);
        maxBirthdayDateString = moment(new Date()).format('dd.MM.yyyy');
        this.params = this.props.navigation.state.params;
        this.state = {
            enterActivity: false,
            photo: photoImg,
            fullName: "",
            fullNameValid: false,
            emailValid: false,
            retypeEmailValid: false,
            passwordValid: false,
            confirmPasswordValid: false,
            emailDontMatchString: localeStrings.signUpStrings.enterValidEmail,
            passwordDontMatchString: localeStrings.signUpStrings.enterStrongPassword,
            date: "",
            email: "",
            RetypeEmail: "",
            password: "",
            confirmPassword: "",
            photoSource: "",
            pushData: [],
            loggedIn: false,
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

    }

    handleFacebookLogin = async () => {
        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends']).then(
            function (result) {
                if (result.isCancelled) {
                    console.log('Login cancelled');
                } else {
                    console.log(result);
                }
            },
            function (error) {
                console.log('Login fail with error: ' + error)
            }
        )
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
                        if (this.state.loginType === 0) {
                            formOb.submit();
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

    userAcccess = async () => {
        AccessToken.getCurrentAccessToken().then(
            (data) => {
                console.log(data.accessToken.toString());
                this.getPublicProfile(data.accessToken.toString());
            }//this.handleFacebookLogin
        )
    }

    customFacebookLogout() {
        var current_access_token = '';
        AccessToken.getCurrentAccessToken().then((data) => {
            current_access_token = data.accessToken.toString();
        }).then(() => {
            let logout =
                new GraphRequest(
                    "me/permissions/",
                    {
                        accessToken: current_access_token,
                        httpMethod: 'DELETE'
                    },
                    (error, result) => {
                        if (error) {
                            console.log('Error fetching data: ' + error.toString());
                        } else {
                            LoginManager.logOut();
                        }
                    });
            new GraphRequestManager().addRequest(logout).start();
        })
            .catch(error => {
                console.log(error)
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
        this.setState({ enterActivity: true });
        try {
            fetch(GlobalVariables._URL + "/core/loginwithfacebook", {
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
                    if (response.succeeded != false && response != "") {
                        AsyncStorage.setItem("UserLogged", "true");
                        AsyncStorage.setItem("userId", JSON.stringify(response));
                        AsyncStorage.setItem("loggedAccountType", "1");
                        this.setState({ loggedAccountType: "1" });
                        AsyncStorage.setItem("fbUserId", fbUserId);
                        AsyncStorage.setItem("fbAccessToken", accessToken);
                        session.value = "true";
                        //FBLoginManager.logout(() => { console.log('Logout facebook ok!') })
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
                        this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                    }
                    else {
                        alert(JSON.stringify(response.errors[0].description));
                        //this.customFacebookLogout();
                        //LoginManager.logout(() => { console.log('Logout facebook ok!') })
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

        let _this = this;
        return (
            // <View>
            //     <LoginButton
            //         publishPermissions={['public_profile', 'email', 'user_friends']}
            //         onLogin = {(data) => {
            //             console.log(data);
            //         }}
            //         onLoginFinished={ (res) => {
            //             console.log('redilt');
            //             console.log(res);
            //         }
            //
            //             // (error, result) => {
            //             //     console.log(result);
            //             //     console.log('redilt');
            //             //     AccessToken.getCurrentAccessToken().then(
            //             //         (data) => {
            //             //             console.log(data.accessToken.toString())
            //             //             console.log(result)
            //             //         }
            //             //     )
            //             //     if (error) {
            //             //         console.log("login has error: " + result.error);
            //             //     } else if (result.isCancelled) {
            //             //         console.log("login is cancelled.");
            //             //     } else {
            //             //         AccessToken.getCurrentAccessToken().then(
            //             //             (data) => {
            //             //                 console.log(data.accessToken.toString())
            //             //             }
            //             //         )
            //             //     }
            //             // }
            //         }
            //         onLogoutFinished={() => console.log("logout.")}/>
            // </View>
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

                            <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
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
                                        this.setState({ TextInputDisable: false, disableSendButton: true });
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
                <TouchableOpacity
                    style={{ alignSelf: "center", justifyContent: "center", height: 55, width: "100%" }}
                    onPress={
                        () => {
                            if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                                this.getPublicProfile(); //Bypass OTP verification for development and internal testing
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
            // <View style={{
            //     flexDirection: 'row',
            //     width: "100%",
            //     justifyContent: "center",
            //     alignContent: "center",
            //     alignSelf: "center",
            //     height: 55,
            //     backgroundColor: "#1b3453",
            //     marginBottom: 0,
            //     top:0,
            //     left:0
            // }}>
            //         <FBLogin activeOpacity={.2}
            //             style={stylesn.SignupBtn}
            //             ref={(fbLogin) => {
            //                 this.fbLogin = fbLogin
            //             }}
            //             permissions={["email"]}
            //             loginBehavior={FBLoginManager.LoginBehaviors.Native}
            //             onLogin={function (data) {
            //                 console.log("Logged in!");
            //                 console.log(data)
            //                 var user = data.credentials;
            //
            //                 _this.setState({
            //                     SpecialToken:"pass" + data.credentials.userId
            //                 })
            //                 var api = `https://graph.facebook.com/v2.3/${user.userId}?fields=name,email,picture.type(large)&access_token=${user.token}`;
            //                 fetch(api)
            //                     .then((response) => response.json())
            //                     .then((responseData) => {
            //
            //                         _this.SaveFbId(responseData)
            //                     })
            //                     .done();
            //             }}
            //
            //             onLogout={function () {
            //                 console.log("Logged out.");
            //                 _this.setState({user: null});
            //             }}
            //             onLoginFound={function (data) {
            //                 console.log("Existing login found.");
            //                 console.log(data);
            //                 _this.setState({user: data.credentials});
            //             }}
            //             onLoginNotFound={function () {
            //                 console.log("No user logged in.");
            //                 _this.setState({user: null});
            //             }}
            //             onError={function (data) {
            //                 console.log("ERROR");
            //                 console.log(data);
            //             }}
            //             onCancel={function () {
            //                 console.log("User cancelled.");
            //             }}
            //             onPermissionsMissing={function (data) {
            //                 console.log("Check permissions!");
            //                 console.log(data);
            //             }}
            //         />
            //
            //         <Image style={{width: 35, height: 35, alignSelf: "center", resizeMode: "contain", top:10}}
            //                source={require('../../res/images/facebookF.png')}/>
            // </View>
            // <View style={{
            //     flexDirection: 'row',
            //     width: "100%",
            //     justifyContent: "center",
            //     alignContent: "center",
            //     alignSelf: "center",
            //     height: 55,
            //     backgroundColor: "#1b3453",
            //     marginBottom: 0
            // }}>
            //     <TouchableOpacity
            //         ref={(fbLogin) => {
            //             this.fbLogin = fbLogin
            //         }}
            //         permissions={["email"]}
            //         loginBehavior={FBLoginManager.LoginBehaviors.Native}
            //         onPress={function (data) {
            //             console.log("Logged in!");
            //             console.log(data)
            //             var user = data.credentials;
            //
            //             _this.setState({
            //                 SpecialToken:"pass" + data.credentials.userId
            //             })
            //             var api = `https://graph.facebook.com/v2.3/${user.userId}?fields=name,email,picture.type(large)&access_token=${user.token}`;
            //             fetch(api)
            //                 .then((response) => response.json())
            //                 .then((responseData) => {
            //
            //                     _this.SaveFbId(responseData)
            //                 })
            //                 .done();
            //         }}
            //
            //         onLogout={function () {
            //             console.log("Logged out.");
            //             _this.setState({user: null});
            //         }}
            //         onLoginFound={function (data) {
            //             console.log("Existing login found.");
            //             console.log(data);
            //             _this.setState({user: data.credentials});
            //         }}
            //         onLoginNotFound={function () {
            //             console.log("No user logged in.");
            //             _this.setState({user: null});
            //         }}
            //         onError={function (data) {
            //             console.log("ERROR");
            //             console.log(data);
            //         }}
            //         onCancel={function () {
            //             console.log("User cancelled.");
            //         }}
            //         onPermissionsMissing={function (data) {
            //             console.log("Check permissions!");
            //             console.log(data);
            //         }}>
            //         <Image style={{width: 35, height: 35, alignSelf: "center", resizeMode: "contain", top:10}}
            //                source={require('../../res/images/facebookF.png')}/>
            //     </TouchableOpacity>
            // </View>

            // <FBLogin
            //
            //          ref={(fbLogin) => {
            //              this.fbLogin = fbLogin
            //          }}
            //          permissions={["email"]}
            //          loginBehavior={FBLoginManager.LoginBehaviors.Native}
            //          onLogin={function (data) {
            //              console.log("Logged in!");
            //              console.log(data)
            //              var user = data.credentials;
            //
            //             _this.setState({
            //                 SpecialToken:"pass" + data.credentials.userId
            //             })
            //              var api = `https://graph.facebook.com/v2.3/${user.userId}?fields=name,email,picture.type(large)&access_token=${user.token}`;
            //              fetch(api)
            //              .then((response) => response.json())
            //              .then((responseData) => {
            //
            //              _this.SaveFbId(responseData)
            //              })
            //              .done();
            //
            //
            //
            //
            //          }}
            //
            //          onLogout={function () {
            //              console.log("Logged out.");
            //              _this.setState({user: null});
            //          }}
            //          onLoginFound={function (data) {
            //              console.log("Existing login found.");
            //              console.log(data);
            //              _this.setState({user: data.credentials});
            //          }}
            //          onLoginNotFound={function () {
            //              console.log("No user logged in.");
            //              _this.setState({user: null});
            //          }}
            //          onError={function (data) {
            //              console.log("ERROR");
            //              console.log(data);
            //          }}
            //          onCancel={function () {
            //              console.log("User cancelled.");
            //          }}
            //          onPermissionsMissing={function (data) {
            //              console.log("Check permissions!");
            //              console.log(data);
            //          }}
            // />
        );
    }
}

// const stylesn = StyleSheet.create({
//     SignupBtn : {
//         display: none
//     }
// });



