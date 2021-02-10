import React, { Component } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    TextInput,
    AsyncStorage, I18nManager, ActivityIndicator

} from "react-native";
import { GlobalVariables } from "../GlobalVariables";

import ImagePicker from 'react-native-image-picker';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import session from "../session";
import StyleSheetFactory from "../../res/styles/LocaleStyles";
let normlUsr = 0;
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import DatePicker from "react-native-datepicker";

const { width } = Dimensions.get('window');
let photoImg = require("../../res/images/addPhoto.png");
let widthView = width;
let logInType, pageTitle = '';
//let pageTitle = localeStrings.profileStrings.viewProfile;

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: "",
            userAge: null,
            normalUser: "",
            image: "",
            phoneNumber: "",
            placeHolderName: localeStrings.profileStrings.placeHolderName,
            placeHolderAge: localeStrings.profileStrings.placeHolderAge,
            changeName: false,
            changeAge: false,
            changeNumber: false,
            photo: photoImg,
            photoSource: "",
            isEdit: false,
            birthday: null,
            user_birthday: null,
            webViewLoading: true
        }

    }
    componentWillMount() {
        this.props.navigation.setParams({ handleEdit: this.editProfile.bind(this) });
        this.props.navigation.setParams({ handleSave: this.saveProfile.bind(this) });
        const { setParams } = this.props.navigation;
        setParams({ editSave: false });

        this.props.navigation.addListener("didFocus", (payload) => {
            AsyncStorage.getItem('loggedAccountType').then((value) => {

                //alert(value == 0 ? '1' : '2')
                if (value == 0) {
                    normlUsr = 1;
                    GlobalVariables.loggedAccountType.value = true;
                    pageTitle = localeStrings.profileStrings.editProfile;
                } else {
                    normlUsr = 0;
                    GlobalVariables.loggedAccountType.value = false;
                    pageTitle = localeStrings.profileStrings.viewProfile;
                }
            }).done();
            this.setState({
                webViewLoading: false
            });

        })

    }



    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        setTimeout(function () {
            pageTitle = pageTitle;
            navigation.setParams({ headerTitle: pageTitle })
        }, 300);
        return {
            headerTitle: pageTitle,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
                //paddingTop: getStatusBarHeight(),


            },

            headerRight: (

                <View>{(normlUsr == 1) ? (
                    params.editSave === false ?
                        <TouchableOpacity onPress={() => navigation.state.params.handleEdit()} style={{
                            width: 50,
                            height: 45,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center", marginRight: 5
                        }}>
                            <Text
                                style={{
                                    fontFamily: "Helvetica",
                                    fontSize: 15,
                                    color: 'white',

                                }}>{localeStrings.profileStrings.edit}</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => navigation.state.params.handleSave()} style={{
                            width: 50,
                            height: 45,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center", marginRight: 5
                        }}>
                            <Text
                                style={{
                                    fontFamily: "Helvetica",
                                    fontSize: 15,
                                    color: 'white',

                                }}>{localeStrings.profileStrings.save}</Text>
                        </TouchableOpacity>
                ) : <Text />}
                </View>
            ),

            headerLeft: (
                <TouchableOpacity onPress={() => {
                    navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                }}
                    style={styles.headerBackButton}>
                    <Image style={{
                        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                        resizeMode: "contain",
                        width: 15,
                        height: 15
                    }}
                        source={require('../../res/images/back.png')} />
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




    componentDidMount() {
        if (GlobalVariables.userId.value !== "") {
            this.setDetails()
        }
    }
    getParsedDate(strDate) {
        var strSplitDate = String(strDate).split(' ');
        var date = new Date(strSplitDate[0]);
        // alert(date);
        var dd = date.getDate();
        var mm = date.getMonth() + 1; //January is 0!

        var yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        date = dd + "-" + mm + "-" + yyyy;
        return date.toString();
    }

    setDetails() {
        let Id = GlobalVariables.userId.value;
        if (isNaN(Id)) {
            Id = Id.replace(/['"]+/g, '');
        }
        try {
            fetch(GlobalVariables._URL + "/core/getprofile/" + Id, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
            })

                .then(response => response.json())
                .then(response => {

                    if (response) {
                        if (response.age !== null && response.age !== 0 && response.age !== "null" && response.age !== "") {
                            this.setState({
                                userName: response.fullName,
                                // image:{uri:GlobalVariables._URL +  "/"+response.thumbnailImage},
                                image: { uri: response.thumbnailImage },
                                //userAge:(response.age).toString()
                                birthday: (response.birthday).toString(),
                                phoneNumber: response.phoneNumber
                                //userAge:Id
                            })
                        } else {
                            this.setState({
                                userName: response.fullName,
                                image: { uri: response.thumbnailImage },
                                //userAge:(response.age).toString()
                                //birthday:(response.birthday).toString()
                                birthday: '',
                                phoneNumber: response.phoneNumber
                                //userAge:Id
                            });
                        }
                        let b_date = this.getParsedDate(this.state.birthday)
                        this.setState({
                            date: b_date,
                            webViewLoading: false
                        });

                    }





                })
                .catch(error => {

                    console.log("upload errorCatch", error);

                });
        } catch (e) {

            console.log("upload catch error", e);

        }


    }

    editProfile() {
        this.setState({ changeName: true, changeAge: true, changeNumber: true, isEdit: true });
        setTimeout(() => {
            this.inputName.focus();
        }, 500)

        const { setParams } = this.props.navigation;
        setParams({ editSave: true })

    }

    saveProfile() {
        this.setState({ changeName: false, changeAge: false, changeNumber: false, isEdit: true, webViewLoading: true });
        const { setParams } = this.props.navigation;

        setParams({ editSave: false })

        let data = new FormData();
        if (GlobalVariables.userId.value !== "") {
            let Id = GlobalVariables.userId.value;
            if (this.state.photoSource) {
                data.append("file", {
                    name: this.state.photoSource.fileName,
                    type: this.state.photoSource.type,
                    uri: this.state.photoSource.uri,
                });
            }

            let newDate = this.state.date.split(".");

            data.append("userId", Id);
            data.append("fullName", this.state.userName);
            data.append("phoneNumber", this.state.phoneNumber);
            //data.append("age", Number(this.state.userAge));
            data.append("birthday", newDate[1] + "/" + newDate[0] + "/" + newDate[2]);

            try {
                fetch(GlobalVariables._URL + "/core/updateprofile", {
                    method: "POST",
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }),
                    body: data
                })

                    .then(response => response.json())
                    .then(response => {

                        if (response) {
                            this.setDetails()
                        }

                    })
                    .catch(error => {

                        console.log("upload errorCatch", error);

                    });
            } catch (e) {

                console.log("upload catch error", e);

            }
        }
    }

    goToAge = () => {
        this.inputAge.focus();
    };
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
                    image: source,
                    photoSource: response
                });


            }
        });
    }

    render(style = {
        width: "100%",
        justifyContent: "center",
        alignSelf: "center",
    }) {

        return (
            <View style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                marginTop: 10,
                justifyContent: "flex-start",
                width: "93%",
                marginLeft: "7.5%",
            }}>

                {
                    this.state.webViewLoading ?
                        <View style={{
                            width: "100%", height: "100%",
                            justifyContent: 'center',
                            blurRadius: 100,
                            backgroundColor: "transparent"
                        }}>

                            <ActivityIndicator size="large" color="#004C6C" animating={this.state.webViewLoading}
                                style={{
                                    blurRadius: 10
                                }} />

                        </View>
                        : null
                }
                {this.state.isEdit ?
                    <TouchableOpacity disabled={false}
                        onPress={() => {
                            if (this.state.changeAge) {
                                this.getPhoto()
                            }
                        }}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            flexDirection: "row",
                            height: 60,

                        }}>
                        <View style={{
                            width: 46,
                            height: 46,
                            borderRadius: 23,
                            marginTop: 8,
                            marginBottom: 8,
                            justifyContent: "center",
                            alignItems: "center"

                        }}>

                            <Image
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 23,
                                    marginBottom: 8,
                                    marginTop: 8
                                }}
                                resizeMode='cover'
                                source={this.state.image}
                            />


                        </View>
                        <Text style={{
                            color: "#3e7fbd",
                            marginLeft: 15,
                            marginTop: 25
                        }}>{localeStrings.profileStrings.changePicture}</Text>
                    </TouchableOpacity>

                    : <TouchableOpacity disabled={true}
                        onPress={() => {
                            if (this.state.changeAge) {
                                this.getPhoto()
                            }
                        }}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            flexDirection: "row",
                            height: 60,

                        }}>
                        <View style={{
                            width: 46,
                            height: 46,
                            borderRadius: 23,
                            marginTop: 8,
                            marginBottom: 8,
                            justifyContent: "center",
                            alignItems: "center"

                        }}>

                            <Image
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 23,
                                    marginBottom: 8,
                                    marginTop: 8
                                }}
                                resizeMode='cover'
                                source={this.state.image}
                            />


                        </View>
                        <Text style={{
                            color: "#3e7fbd",
                            marginLeft: 15,
                            marginTop: 25
                        }}>{localeStrings.profileStrings.changePicture}</Text>
                    </TouchableOpacity>

                }


                <TouchableOpacity
                    activeOpacity={1}
                    disabled={!this.state.changeName}
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        borderTopColor: "black",
                        borderTopWidth: 0.5

                    }}
                    onPress={() => this.inputName.focus()}>
                    <View style={{
                        width: "100%",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                    }}>
                        <TextInput ref={ref => this.inputName = ref}
                            editable={this.state.changeName} style={styles.textInputs}
                            placeholder={this.state.placeHolderName}
                            value={this.state.userName}
                            onChangeText={(text) => {
                                this.setState({ userName: text })
                            }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    disabled={!this.state.changeNumber}
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        borderTopColor: "black",
                        borderTopWidth: 0.5

                    }}
                    onPress={() => this.inputNumber.focus()}>
                    <View style={{
                        width: "100%",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                    }}>


                        <TextInput ref={ref => this.inputNumber = ref}
                            style={styles.textInputs}
                            editable={this.state.changeNumber}
                            //ref='mobileNo'
                            value={this.state.phoneNumber}
                            //onChangeText={(phoneNumber) => this.setState({ phoneNumber: mobileNo })}
                            keyboardType="phone-pad"
                            placeholder={this.state.phoneNumber}
                            maxLength={10}
                            onChangeText={(text) => {
                                this.setState({ phoneNumber: text })
                            }} />
                    </View>
                </TouchableOpacity>


                <View style={{
                    width: "80%", justifyContent: "center", alignSelf: "flex-start", borderTopColor: "black",
                    borderTopWidth: 0.5
                }}>
                    {((this.state.isEdit && this.state.date == "NaN-NaN-NaN") || (this.state.date != "NaN-NaN-NaN")) ?
                        <DatePicker
                            disabled={!this.state.changeAge}
                            style={{ width: 280, justifyContent: "center" }}
                            date={(this.state.date != "NaN-NaN-NaN") ? this.state.date : "01.01.1950"}
                            mode="date"
                            androidMode="spinner"
                            format="DD.MM.YYYY"
                            placeholder={localeStrings.signUpStrings.birthdayPlaceHolder}
                            minDate="01.01.1950"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}

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
                        /> : <View style={{ hide: "true" }}></View>
                    }
                </View>
                {(normlUsr == 1) ?
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate("ChangePassword", { screen: "ChangePassword" })}
                        style={styles.textInputs}>
                        <View style={{
                            width: "100%",
                            justifyContent: "space-between",
                            flexDirection: "row",
                            alignItems: "center",
                            borderTopColor: "black",
                            borderTopWidth: 0.5,
                            height: "100%"
                        }}>
                            <Text style={{ color: "black" }}>{localeStrings.profileStrings.changePassword}</Text>
                            <Image style={{
                                resizeMode: "contain",
                                width: 10,
                                height: 15,
                                marginRight: 15,
                                transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
                            }}
                                source={require("../../res/images/arrowRight.png")} />
                        </View>
                    </TouchableOpacity>
                    : console.log('Not a Normal User')}

                <TouchableOpacity
                    onPress={() => {
                        AsyncStorage.setItem("UserLogged", "false");
                        GlobalVariables.userId.value = "";
                        session.value = "false";
                        AsyncStorage.setItem("checkIn", "false");
                        AsyncStorage.setItem("savedBarId", "");
                        AsyncStorage.setItem("savedBarName", "");
                        this.props.navigation.navigate("FirstPage", { screen: "FirstPage", dontGoBack: false })
                    }}
                    style={styles.textInputs}>
                    <View style={{
                        height: "100%",
                        width: "100%",
                        borderTopColor: "black",
                        borderTopWidth: 0.5,
                        justifyContent: "flex-start",
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <Text style={{ color: "red" }}>{localeStrings.profileStrings.signOut}</Text>
                    </View>
                </TouchableOpacity>


            </View>
        )
    }
}


