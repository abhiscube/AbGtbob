import React, {Component} from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    TextInput, ScrollView, I18nManager, AsyncStorage, Alert,


} from "react-native";


import {getStatusBarHeight} from 'react-native-iphone-x-helper'


const {width} = Dimensions.get('window');

import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import Foect from "foect";
import {GlobalVariables} from "../GlobalVariables";


export default class ChangePassword extends React.Component {
    static navigationOptions = ({navigation}) => {


        return {
            headerTitle: localeStrings.profileStrings.editProfile,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (

                <View>
                    <TouchableOpacity onPress={() => navigation.state.params.handleSave()} style={{
                        width: 45,
                        height: 45,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginRight: 5,
                    }}>
                        <Text
                            style={{
                                fontFamily: "Helvetica",
                                fontSize: 16,
                                color: 'white',
                            }}>{localeStrings.profileStrings.save}</Text>
                    </TouchableOpacity>
                </View>
            ),

            headerLeft: (
                <TouchableOpacity onPress={() => {
                    navigation.goBack(null)
                }}
                                  style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                    }}
                           source={require('../../res/images/back.png')}/>
                </TouchableOpacity>
            ),
            headerTintColor: '#fff',
            headerTitleStyle:
                {
                    textAlign: "center",
                    flex:
                        1,
                    alignSelf:
                        "center",
                    color:
                        'white',
                    fontSize:
                        19,
                    fontFamily:
                        "Helvetica"

                }
            ,

        }
    };

    constructor(props) {
        super(props);

        this.state = {
            oldPass: "",
            newPass: "",
            retypeNewPass: ""
        }
    }


    componentDidMount() {
        this.props.navigation.setParams({handleSave: this.saveProfile.bind(this)});

    }


    saveProfile() {
        this.form.submit();
        console.log("enter save")
        // this.props.navigation.goBack(null);
    }

    gotToNew = () => {
        this.newPassword.focus();
    };
    gotToNewRetype = () => {
        this.retypeNewPassword.focus();
    };


    changePassword() {

        let data = new FormData();

        data.append("OldPassword", this.state.oldPass);
        data.append("NewPassword", this.state.newPass);
        data.append("ConfirmPassword", this.state.retypeNewPass);

        console.log(data);
        try {
            fetch(GlobalVariables._URL +  "/core/changepassword2/" + GlobalVariables.userId.value, {
                method: "POST",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }),
                body: data
            })

                .then(response => response.json())
                .then(response => {

                 //  alert(JSON.stringify(response));
                    if (response.success === true) {
                        Alert.alert(
                            "Success!",
                            "Password changed successfully!",
                            [

                                {
                                    text:  localeStrings.forgotPasswordStrings.ok,
                                    onPress: () => this.props.navigation.goBack(null)
                                }
                            ],

                            {cancelable: false}
                        );
                    } else {
                        Alert.alert(
                        "Fail!",
                        "Old password is wrong",
                        [

                            {
                                text:  localeStrings.forgotPasswordStrings.ok,
                                onPress: () => console.log("Cancel Pressed"),
                            }
                        ],

                        {cancelable: false})
                   }
                    


                })
                .catch(error => {

                    console.log("upload error", error);

                });
        } catch (e) {

            console.error("upload catch error", e);

        }
    }

    render() {

        return (
            <View style={{
                flex: 1, flexDirection: "column", height: "100%"
            }}>
                <View style={{
                    flexDirection: "column", alignItems: "center", marginTop: 10, width: "93%",
                    marginLeft: "7.5%",
                }}>
                    <Foect.Form

                        ref={ref => this.form = ref}
                        onValidSubmit={model => {
                            console.log("enter valid");
                            if (model["newPassword"] !== model["retypeNewPassword"]) {
                                alert(localeStrings.signUpStrings.passwordNotMatch);
                                this.setState({
                                    confirmPasswordValid: true,
                                    passwordDontMatchString: localeStrings.signUpStrings.passwordMatchStrings
                                });
                            } else {
                                this.changePassword();
                            }

                        }}

                        onInvalidSubmit={(errors, values) => {

                            if (errors["oldPassword"].required) {
                                this.setState({oldPasswordValid: true})
                            } else {
                                this.setState({oldPasswordValid: false})
                            }

                            if (errors["newPassword"].required) {
                                this.setState({passwordValid: true})
                            } else {
                                this.setState({passwordValid: false})
                            }

                            if (errors["retypeNewPassword"].required) {
                                this.setState({confirmPasswordValid: true})
                            } else {
                                this.setState({confirmPasswordValid: false})
                            }

                        }}
                    >

                        {form => (
                            <View>
                                <Foect.Control name="oldPassword" required    pattern={/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            borderRadius: 10,
                                            height: 60
                                        }}>

                                            <TouchableOpacity
                                                activeOpacity={1}
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    borderBottomColor: "black",
                                                    borderBottomWidth: 0.5
                                                }}
                                                onPress={() => this.oldPassword.focus()}>
                                                <View style={{
                                                    flexWrap: "wrap",
                                                    justifyContent: "center",
                                                    alignSelf: "flex-start",
                                                }}>
                                                    <TextInput ref={ref => this.oldPassword = ref}
                                                               style={styles.logInFields}
                                                               autoCapitalize='none'
                                                               placeholder={localeStrings.profileStrings.oldPassword}
                                                               secureTextEntry={true}
                                                               placeholderTextColor="#9b9b9b"
                                                               onBlur={control.markAsTouched}

                                                               onChangeText={(text) => {
                                                                   control.onChange(text);
                                                                   if (control.isValid) {
                                                                       this.setState({oldPasswordValid: false});
                                                                   }
                                                                   this.setState({oldPass: text})
                                                               }}


                                                               value={this.state.oldPass}
                                                               onSubmitEditing={this.gotToNew}
                                                    />
                                                               {control.isTouched && control.isInvalid || this.state.oldPasswordValid ?
                                                                   <View>
                                                                       {control.errors.pattern || this.state.oldPasswordValid ?
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

                                <Foect.Control name="newPassword" required
                                               pattern={/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            borderRadius: 10,
                                            height: 60
                                        }}>

                                            <TouchableOpacity
                                                activeOpacity={1}
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    borderBottomColor: "black",
                                                    borderBottomWidth: 0.5
                                                }}
                                                onPress={() => this.newPassword.focus()}>
                                                <View style={{
                                                    flexWrap: "wrap",
                                                    justifyContent: "center",
                                                    alignSelf: "flex-start",
                                                }}>
                                                    <TextInput ref={ref => this.newPassword = ref}
                                                               style={styles.logInFields}
                                                               autoCapitalize='none'
                                                               placeholder={localeStrings.profileStrings.newPassword}
                                                               secureTextEntry={true}
                                                               placeholderTextColor="#9b9b9b"
                                                               onBlur={control.markAsTouched}

                                                               onChangeText={(text) => {
                                                                   control.onChange(text);
                                                                   if (control.isValid) {
                                                                       this.setState({passwordValid: false});
                                                                   }
                                                                   this.setState({newPass: text})
                                                               }}

                                                               value={this.state.newPass}
                                                               onSubmitEditing={this.gotToNewRetype}
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

                                <Foect.Control name="retypeNewPassword" required
                                               pattern={/(?=^.{5,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/}>
                                    {control => (
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignSelf: "center",
                                            borderRadius: 10,
                                            height: 60
                                        }}>

                                            <TouchableOpacity
                                                activeOpacity={1}
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    borderBottomColor: "black",
                                                    borderBottomWidth: 0.5
                                                }}
                                                onPress={() => this.retypeNewPassword.focus()}>
                                                <View style={{
                                                    flexWrap: "wrap",
                                                    justifyContent: "center",
                                                    alignSelf: "flex-start",
                                                }}>
                                                    <TextInput ref={ref => this.retypeNewPassword = ref}
                                                               style={styles.logInFields}

                                                               autoCapitalize='none'
                                                               placeholder={localeStrings.signUpStrings.retypePasswordPlaceHolder}
                                                               secureTextEntry={true}
                                                               placeholderTextColor="#9b9b9b"
                                                               onBlur={control.markAsTouched}

                                                               onChangeText={(text) => {
                                                                   control.onChange(text);

                                                                   if (text.length > this.state.newPass.length - 2 && this.state.newPass !== text) {
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
                                                                   this.setState({retypeNewPass: text});

                                                               }}

                                                               value={this.state.retypeNewPass}
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


                            </View>
                        )}
                    </Foect.Form>

                </View>
                <View style={{
                    marginTop: 10,
                    flexDirection: 'row',
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "flex-start",

                }}>
                    <TouchableOpacity
                        style={{justifyContent: "center", height: 65, width: "100%"}}
                        onPress={() =>

                            this.props.navigation.navigate("ForgotPassword", {screen: "ForgotPassword"})
                        }>
                        <Text style={{
                            color: "#9b9b9b",
                            alignSelf: "center",
                            justifyContent: "center",
                            fontFamily: "Helvetica",
                            fontSize: 14
                        }}>
                            {localeStrings.profileStrings.forgotPassword}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>)
    }
}


