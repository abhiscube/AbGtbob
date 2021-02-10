import React, {Component} from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    AsyncStorage,
    I18nManager,
    Alert,
    Platform
} from "react-native";
import {withNavigationFocus} from "react-navigation";
import Modal from "react-native-modal";
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {ScrollView} from "react-native-gesture-handler";
import session from "./session";
import VersionNumber from 'react-native-version-number';
import {GlobalVariables} from "./GlobalVariables";
import PushNotification from '../src/PushNotification'
import RNRestart from 'react-native-restart';
import GPSState from 'react-native-gps-state';
const { width } = Dimensions.get('window');

const { height } = Dimensions.get('window');

let imgWidth = width * 0.75;

let imgHeight = imgWidth + imgWidth * 0.1;


import localeStrings from '../res/strings/LocaleStrings';
import StyleSheetFactory from "../res/styles/LocaleStyles";
import DeviceInfo from "react-native-device-info";
import ImageLoad from 'react-native-image-placeholder';
import {GoogleSignin} from "react-native-google-signin";
const deviceLocale = DeviceInfo.getDeviceLocale();

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);


class HomeScreenWaiters extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: (<View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("HomeScreen", {screen: "HomeScreen"})
                }}>
                    <Image style={{
                        resizeMode: "contain", width: 65, height: 65, marginBottom: 5,
                    }} source={require("../res/images/logo.png")}/>
                </TouchableOpacity>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View>
                <TouchableOpacity style={{ height:45,justifyContent:"center"}}  onPress={() => {
                                      navigation.state.params.handleSave1()
                                  }}>
                <Text style={{color:"white",marginRight:8,fontSize:15,fontWeight:"bold"}}>Waiter Alerts</Text>
                </TouchableOpacity>
               
            </View>
            ),
            headerLeft: (
                <TouchableOpacity style={{
                    height: 45, width: 55, justifyContent: "center", alignItems: "center"
                }}
                                  onPress={() => {
                                      navigation.state.params.handleSave()
                                  }}>
                    <Image style={{resizeMode: "contain", width: 15, height: 15}}
                           source={require("../res/images/hamburger.png")}/>
                </TouchableOpacity>

            ),
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
            IsModalVisible: false,
            IsModalVisibleScan: false,
            userName: "",
            image: "",
            gotOrder: false,
            savedOrder: [],
            savedBarId: "",
            savedBarName: "",
            offerAll:[],
            email:"",
            isCheckIn:false

        };

    }
    componentDidUpdate(prevProps) {
        if (prevProps.isFocused !== this.props.isFocused) {
            if (this.props.isFocused) {
                this.Async();
                this.getOrders();
                this.showCheckIn()

            }
        }
    }

    componentWillMount() {
   
        this.Async();
        this.getLanguage();
        this.getOrders();
       this.showCheckIn()
      
    }
    getOffer(){
        try {
            fetch(GlobalVariables._URL +  "/cart-rules/all",{
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                     if (response !== "") {
                   this.setState({
                       offerAll:response
                   })
                    
                    }

                })
                .catch(error => {
                    console.log("upload error", error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }
    showCheckIn()
    {
        AsyncStorage.getItem('checkIn').then((value) => {
         
            if (value === "true") {
                this.setState({isCheckIn: true})

            } else {
                this.setState({isCheckIn: false})

            }
        }).done();
    }
    getOrders() {

        AsyncStorage.getItem('savedOrders').then((value) => {
         
            if (value !== null) {
                this.setState({gotOrder: true, savedOrder: JSON.parse(value)})

            } else {
                this.setState({gotOrder: false})

            }
        }).done();
        AsyncStorage.getItem('savedBarId').then((value) => {
           
            if (value !== null) {
                this.setState({savedBarId: value})
            }
        }).done();
        AsyncStorage.getItem('savedBarName').then((value) => {
          
            if (value !== null) {
                this.setState({savedBarName: value})
            }
        }).done();

    }

    changeNewLanguage() {
        Alert.alert(
            localeStrings.homeScreenStrings.changeLanguage,
            localeStrings.homeScreenStrings.selectLanguage,
            [
                {
                    text: localeStrings.homeScreenStrings.english,
                    onPress: () => this.changeLanguage(false, "en-US")
                },
                {
                    text: localeStrings.homeScreenStrings.hebrew,
                    onPress: () => this.changeLanguage(true, "he-IL")
                }
            ],

            {cancelable: false}
        );
    }

    changeLanguage(force, language) {
        console.log(force, language);
       
        I18nManager.forceRTL(force);
        I18nManager.allowRTL(force);
        AsyncStorage.setItem("userLanguage", language);
        setTimeout(() => {
           
          
          RNRestart.Restart();
        }, 1000)

       
    }
    Async(){
        AsyncStorage.getItem('UserLogged').then((value) => {
          
            if (value !== "") {
                if (value === "true") {
                    AsyncStorage.getItem('userId').then((value) => {

                        if (value !== null && value !== "") {

                            GlobalVariables.userId.value = value;
                            this.ShowDetails(value);
                        }
                      
                    }).done();
                    session.value = "true"

                } else {

                    session.value = "false";
                    GlobalVariables.userId.value = "";
                }
            } else {
                AsyncStorage.setItem("UserLogged", "false");
                AsyncStorage.setItem("userId", null);
                session.value = "false";
                GlobalVariables.userId.value = "";
            }
        }).done();
    }

    getLanguage() {
        AsyncStorage.getItem('userLanguage').then((value) => {
        
            if (value !== undefined) {
                GlobalVariables.userLanguage.value = value;

            } else {
                console.log("else getLanguage", deviceLocale);
                AsyncStorage.setItem("userLanguage", deviceLocale);
                GlobalVariables.userLanguage.value = deviceLocale;

            }
        }).done();


    }
    ShowDetails(value){

        try {
            fetch(GlobalVariables._URL +  "/core/getprofile/" + value, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
            })

                .then(response => response.json())
                .then(response => {

               
                    this.setState({
                        userName: response.fullName,
                        image: {uri: response.thumbnailImage}
                    })
                   
                })
                .catch(error => {
                  
                    console.log("upload errorCatch", error);

                });
        } catch (e) {
           
            console.log("upload catch error", e);

        }
    }

    componentDidMount() {
        GoogleSignin.configure({
            webClientId: '847661413994-fqa448i9p2emfm3a9b3enk3cnhcmkvev.apps.googleusercontent.com'
        });
        this.getOffer()
        this.props.navigation.setParams({handleSave: this.showModal.bind(this)});
        this.props.navigation.setParams({handleSave1: this.showAlerts.bind(this)});
       
    }
    showAlerts(){
        this.props.navigation.navigate("WaiterAlert",{screen:"WaiterAlert"})
    }
     
    

    showModal() {
        this.setState({IsModalVisible: true});
    }

    hideModal() {
        this.setState({IsModalVisible: false});
    }

    goToLogin() {
        const {navigate} = this.props.navigation;
        navigate("FirstPage", {screen: "FirstPage"})
    }

    enableGPS(fnCallback: Function) {

        //Get the current GPS state
        GPSState.getStatus()
            .then((status) => {
                switch (status) {
                    case GPSState.NOT_DETERMINED:
                        //alert('Please, allow the location, for us to do amazing things for you!')
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

    render() {
        const {navigate} = this.props.navigation;
        return (
            
            <View style={{height:"100%", flexDirection: "column", justifyContent: "space-between"}}>
                {Platform.OS === "ios" ? <PushNotification />  : <Text/> }

                {deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ? 
                <View style={{
                    flexDirection: 'column',
                    marginTop: 15,
                    marginLeft: 8,
                    justifyContent: "flex-start",
                    alignItems:"flex-start"
                }}>
                    <Text style={{
                        fontFamily: "Helvetica-Bold",
                        fontSize: 17,
                        //textAlign: "right",
                    }}>{localeStrings.homeScreenStrings.specialOffers}</Text>
                    <Text style={{
                        fontSize: 14,
                        marginTop: 3,
                        fontFamily: "Helvetica",
                       // textAlign: "right",
                    }}>{localeStrings.homeScreenStrings.reviewOurSpecial}</Text>

                </View> : <View style={{
                    flexDirection: 'column',
                    marginTop: 15,
                    marginLeft: 8,
                    justifyContent: "flex-start",
                    alignItems:"flex-start"
                }}>
                    <Text style={{
                        fontFamily: "Helvetica-Bold",
                        fontSize: 17,
                      
                    }}>{localeStrings.homeScreenStrings.specialOffers}</Text>
                    <Text style={{
                        fontSize: 14,
                        marginTop: 3,
                        fontFamily: "Helvetica",
                      
                    }}>{localeStrings.homeScreenStrings.reviewOurSpecial}</Text>

                </View>}

                <View style={{height:height * 0.5 , marginLeft: 8}}>
                    <ScrollView horizontal={true} contentContainerStyle={{marginTop: 5, marginBottom: 5,flexDirection: "row",justifyContent:"space-between"}}>
                    {this.state.offerAll.map((items, index) => (
                        <View style={{width:width/1.75,height:height*0.5,marginRight:8}} key={index}>
                       
                       <ImageLoad style={{
                                resizeMode: "center",
                                width:width/1.75,
                                height: height * 0.5}}
                                 loadingStyle={{ size: 'large', color: 'blue' }}
                                isShowActivity
                                source={{uri:items.thumbnailImageUrl}}/>
                        </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={{
                    marginTop: 15,
                    marginBottom: 8,
                    marginRight: 8,
                    marginLeft: 8,
                    width:width-10,
                   height:height/3.5,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                   
                }}>

                    <View style={{flex:1}}>
                    {this.state.isCheckIn ?
                    <TouchableOpacity onPress={() => {
                        GlobalVariables.CheckIn = this.state.isCheckIn;
                        GlobalVariables.orders = this.state.savedOrder;
                        GlobalVariables.totalOrders.value = this.state.savedOrder.length;
                        GlobalVariables.restId.value = this.state.savedBarId;
                        this.props.navigation.navigate("MenuSlider", {
                            screen: "MenuSlider",
                            barId: this.state.savedBarId ? this.state.savedBarId : GlobalVariables.restId.value,
                            nameBar: this.state.savedBarName,
                            showWelcome: false
                        })
                            }}
                                              style={{
                                                  backgroundColor: "#8DC055",
                                                  width: "92%",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  alignSelf: "center",
                                                  height: 25,
                                                  borderRadius: 4,
                                                    zIndex: 5,
                                                  position: "absolute",
                                                  marginTop: 2,
                                                 
                                              }}>
                                <Text
                                    style={{fontWeight: "bold", color: "white", textAlign: "center", fontSize: 13}}>Current Location</Text>
                            </TouchableOpacity> : null }
                        <TouchableOpacity onPress={() => {
                            this.enableGPS(() => {
                                this.props.navigation.navigate("BobLocationsAll", { screen: "BobLocationsAll" });
                            });
                        }}
                                          style={{flex: 1, justifyContent: "center"}}>
                            <ImageBackground style={styles.ImgBackground}
                                             source={require("../res/images/locations.png")}>
                                <Text style={styles.TextImg}>{localeStrings.homeScreenStrings.locations}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>

                    <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
                        <TouchableOpacity onPress={() => {
                            if (session.value === "false") {
                                Alert.alert(
                                    localeStrings.homeScreenStrings.inOrderTo,
                                    "",
                                    [
                                        {
                                            text: localeStrings.homeScreenStrings.cancel,
                                            onPress: () => console.log("Cancel Pressed"),
                                            style: "destructive"
                                        },
                                        {
                                            text: localeStrings.homeScreenStrings.ok, onPress: () => this.goToLogin()
                                        }
                                    ],

                                    {cancelable: false}
                                );

                            } else {

                                this.setState({
                                    IsModalVisibleScan: true
                                })
                            }
                        }}
                                          style={{flex: 1, justifyContent: "center"}}>
                            <ImageBackground style={styles.ImgBackground} source={require("../res/images/checkin.png")}>
                                <Text style={styles.TextImg}>{localeStrings.homeScreenStrings.checkIn}</Text>
                            </ImageBackground>

                        </TouchableOpacity>
                    </View>

                    <View style={{flex:1}}>
                        {this.state.gotOrder ?
                            <TouchableOpacity onPress={() => {
                                GlobalVariables.orders = this.state.savedOrder;
                                GlobalVariables.totalOrders.value = this.state.savedOrder.length;
                                GlobalVariables.restId.value = this.state.savedBarId;
                                this.props.navigation.navigate("MenuSlider", {
                                    screen: "MenuSlider",
                                    barId: this.state.savedBarId ? this.state.savedBarId : GlobalVariables.restId.value,
                                    nameBar: this.state.savedBarName,
                                    showWelcome: false
                                })
                            }}
                                              style={{
                                                  backgroundColor: "#8DC055",
                                                  width: "85%",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  alignSelf: "center",
                                                  height: 25,
                                                  borderRadius: 5,
                                                    zIndex: 5,
                                                  position: "absolute",
                                                  marginTop: 2,
                                                 
                                              }}>
                                <Text
                                    style={{fontWeight: "bold", color: "white", textAlign: "center", fontSize: 13}}>{localeStrings.homeScreenStrings.openOrder}</Text>
                            </TouchableOpacity> : null}

                        <TouchableOpacity onPress={() =>
                            this.props.navigation.navigate("Orders", {screen: "Orders"})
                        } style={{flex: 1, justifyContent: "center"}}>
                            <ImageBackground style={styles.ImgBackground}
                                             source={require("../res/images/beerMenu.png")}>
                                <Text style={styles.TextImg}>{localeStrings.homeScreenStrings.orders}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>

                </View>

                <Modal isVisible={this.state.IsModalVisible} onBackButtonPress={() => this.hideModal()} onBackdropPress={() => this.hideModal()}
                       style={{marginLeft: 0, marginBottom: 0, marginTop:0}}
                       animationIn={I18nManager.isRTL ? "slideInRight" : "slideInLeft"}
                       animationOut={I18nManager.isRTL ? "slideOutRight" : "slideOutLeft"}

                >
                    <View style={{
                        flex: 1,
                        width: 250,
                        backgroundColor: "white",
                        flexDirection: "column",
                        paddingTop: getStatusBarHeight(),
                    }}>

                        {session.value === "true" ?
                            <TouchableOpacity
                            onPress={() => {
                                this.setState({IsModalVisible: false});
                                this.props.navigation.navigate("Profile", {screen: "Profile"})
                            }} style={{
                                
                                alignItems: "center",
                                flexDirection: "row",

                                height: 60,
                                borderColor: "black",
                                borderBottomWidth: 0.5,
                                
                                
                            }}>
                                <View
                                    style={{
                                        alignItems: "center",
                                        marginLeft: 15,
                                        height: 60,
                                        flexDirection: "row",
                                        width: 120,
                                        marginTop: 10,
                                        marginBottom: 10,
                                    }}>

                                    <Image style={{width: 50, height: 50, borderRadius: 25, resizeMode: "cover"}}
                                           source={this.state.image}/>

                               
                              
                                    <Text style={{
                                        marginLeft:20,
                                        fontFamily: 'Helvetica',
                                        fontSize: 15,
                                        color: "black",
                                        textAlign: "center"
                                    }}>{this.state.userName}</Text>
                                   

                              
                              </View>

                            </TouchableOpacity> : null}

                        {session.value === "true" ?
                            <View style={styles.ViewOptions}>
                                <TouchableOpacity onPress={() => {
                                    AsyncStorage.setItem("UserLogged", "false");
                                    AsyncStorage.setItem("email", "")
                                    GlobalVariables.userId.value = "";
                                    session.value = "false";
                                    AsyncStorage.removeItem('role');
                                    // AsyncStorage.getItem('role').then((value) => {
                                    //     if (value !== null) {
                                    //         AsyncStorage.setItem('role', null);
                                    //     }
                                    // }).done();
                                    try {
                                        GoogleSignin.revokeAccess();
                                        console.log('deleted');
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    GoogleSignin.signOut();
                                    this.hideModal();
                                    this.props.navigation.navigate("FirstPage", {screen: "FirstPage"})
                                }}>
                                    <View style={styles.ViewTextImg}>
                                        <Text style={styles.TextModal}>{localeStrings.homeScreenStrings.logOut}</Text>
                                        <Image style={styles.ImgArrow}
                                               source={require("../res/images/arrowRight.png")}/>
                                    </View>
                                </TouchableOpacity>


                            </View>
                            :
                            <View style={styles.ViewOptions}>
                                <TouchableOpacity onPress={() => {

                                    this.hideModal();
                                    this.props.navigation.navigate("FirstPage", {screen: "FirstPage"})
                                }}>
                                    <View style={styles.ViewTextImg}>
                                        <Text style={styles.TextModal}>{localeStrings.homeScreenStrings.logIn}</Text>
                                        <Image style={styles.ImgArrow}
                                               source={require("../res/images/arrowRight.png")}/>
                                    </View>
                                </TouchableOpacity>


                    </View>
                   

                        }
                        {/*{session.value === "true" ?*/}
                        <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                                  this.setState({IsModalVisible: false});
                                  setTimeout(() => {
                                    this.changeNewLanguage();
                                }, 1000)
                              
                              
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text
                                        style={styles.TextModal}>{localeStrings.homeScreenStrings.changeLanguage}</Text>
                                    <Image style={styles.ImgArrow}
                                           source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View>
                        {/*:*/}
                        {/*null}*/}

                        <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                                this.setState({IsModalVisible: false});
                                this.props.navigation.navigate("Coupons", {screen: "Coupons"})
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text style={styles.TextModal}>{localeStrings.homeScreenStrings.coupons}</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View>
                        {/* <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                                this.setState({IsModalVisible: false});
                                alert("Chat")
                               // this.props.navigation.navigate("Coupons", {screen: "Coupons"})
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text style={styles.TextModal}>Chat</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View> */}

                  
                        <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                               this.hideModal();
                               this.props.navigation.navigate("Orders", {screen: "Orders"})
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text
                                        style={styles.TextModal}>Orders History</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View>

                        <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                                this.hideModal();
                                this.handleNavigation("PrivacyWebView", { screen: "PrivacyWebView" })
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text
                                        style={styles.TextModal}>{localeStrings.homeScreenStrings.privacyPolicy}</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View>

                        <View style={styles.ViewOptions}>
                        <TouchableOpacity onPress={() => {
                                this.hideModal();
                                this.props.navigation.navigate("TermsWebView", {screen: "TermsWebView"})
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text
                                        style={styles.TextModal}>{localeStrings.homeScreenStrings.termsAndConditions}</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>
                                </View>
                            </TouchableOpacity>


                        </View>


                        <View style={styles.ViewOptions}>

                            <View style={styles.ViewTextImg}>

                                <Text style={styles.TextModal}>{localeStrings.homeScreenStrings.versionNo}</Text>
                                <Text style={{marginRight: 15}}>{VersionNumber.appVersion}</Text>


                            </View>

                        </View>


                    </View>

                </Modal>
                <Modal transparent={true} isVisible={this.state.IsModalVisibleScan}>
                    <View style={{
                        flex: 1,
                        width: "100%",
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        marginBottom: 10,
                    }}>
                        <View style={{
                            height: 235,
                            width: "95%",
                            flexDirection: "column",
                            alignSelf: 'center',
                            overflow: "hidden",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>


                            <View style={{
                                flexDirection: "column",
                                borderRadius: 15,
                                overflow: "hidden",
                                backgroundColor: "white",
                                width: "95%"
                            }}>
                                <View style={{height: 55, marginTop: 10, marginBottom: 5}}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }} onPress={() => {
                                        this.setState({IsModalVisibleScan: false});
                                        this.props.navigation.navigate("ScanScreen", {screen: "ScanScreen"})
                                    }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>

                                            <Image style={{width: 17, height: 17}}
                                                   source={require("../res/images/scan.png")}/>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.homeScreenStrings.scanCode}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View>
                                <View style={styles.BorderView}/>


                                
                            </View>


                            <View style={{
                                height: 55,
                                backgroundColor: "white",
                                width: "95%",
                                marginTop: 10,
                                borderRadius: 10,
                                overflow: "hidden"
                            }}>
                                <TouchableOpacity onPress={() => {
                                    this.setState({IsModalVisibleScan: false})
                                }} style={{
                                    height: "100%",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Text style={{
                                        fontFamily: "Helvetica",
                                        fontSize: 16,
                                        color: "#444444"
                                    }}>{localeStrings.homeScreenStrings.cancel}</Text>
                                </TouchableOpacity>


                            </View>
                        </View>
                    </View>
                </Modal>

             

               
                <Modal transparent={true} isVisible={this.state.IsModalVisibleConfirmed}>

                    <View style={{
                        flex: 1,
                        width: "100%",
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                    }}>
                        <View style={{
                            height: 235,
                            width: "95%",
                            flexDirection: "column",
                            alignSelf: 'center',
                            overflow: "hidden",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>


                            <View style={{
                                flexDirection: "column",
                                borderRadius: 15,
                                overflow: "hidden",
                                backgroundColor: "white",
                                width: "95%",
                                height: 135,
                                justifyContent: "center"
                            }}>
                                <Text
                                    style={{
                                        fontFamily: "Helvetica",
                                        fontSize: 16,
                                        alignSelf: 'center',
                                        marginTop: 8
                                    }}>{localeStrings.homeScreenStrings.tableCodeConfirm}</Text>
                                <Image style={{
                                    resizeMode: "contain",
                                    width: 75,
                                    height: 75,
                                    alignSelf: 'center',
                                    marginTop: 10
                                }} source={require('../res/images/confirm.png')}/>


                            </View>
                            <View style={{
                                height: 55,
                                backgroundColor: "white",
                                width: "95%",
                                marginTop: 10,
                                borderRadius: 10,
                                overflow: "hidden"
                            }}>
                                <TouchableOpacity onPress={() => {
                                    this.setState({IsModalVisibleConfirmed: false});
                                    this.props.navigation.navigate("MenuSlider", {
                                        screen: "MenuSlider",
                                        showWelcome: false
                                    })
                                }} style={{
                                    height: "100%",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Text
                                        style={{
                                            fontFamily: "Helvetica",
                                            fontSize: 16,
                                            color: "#444444"
                                        }}>{localeStrings.homeScreenStrings.done}</Text>
                                </TouchableOpacity>


                            </View>
                        </View>

                    </View>
                </Modal>
            </View>

        )
    }
}

export default withNavigationFocus(HomeScreenWaiters)
