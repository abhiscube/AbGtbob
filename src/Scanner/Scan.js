import React, { Component } from 'react';

import { View, Dimensions, Text, TouchableOpacity, Image, Alert, AsyncStorage } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import haversine from "haversine";
import * as Animatable from "react-native-animatable";
import { GlobalVariables } from "../GlobalVariables";

import localeStrings from '../../res/strings/LocaleStrings';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from "react-native-device-info";
import GPSState from "react-native-gps-state";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const deviceLocale = DeviceInfo.getDeviceLocale();
console.disableYellowBox = true;

class QrCodeCamera extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = {
            distanceTravelled: 0,
            prevLatLng: {},
            showAlert: true,
            unique: ''

        }
    }


    onSuccess(e) {
        const scanned = e.data;
        const code = (scanned.includes('referrer=')) ? e.data.split('referrer=')[1] : e.data;
        
        // console.log('in success');
        // console.log(e);
        // console.log('---------------');
        // console.log(e.data);
        // console.log('---------------');
        if (this.params.comeFrom !== undefined) {

            if (this.params.comeFrom === "homeScreen") {
                // console.log('in if');
                // this.getTable(e.data, '', '');
                this.getCurrentLocation(code);

                // Geolocation.getCurrentPosition((position) => {
                //     this.setState({
                //         newLat:position.coords.latitude,
                //         newLong: position.coords.longitude
                //     })
                //     this.getTable(e.data, position.coords.latitude, position.coords.longitude)
                // }, (error) => console.log("error"));
            }
        } else {

            // console.log('in else');
            // this.getTable(e.data);
            this.getCurrentLocation(code);

        }


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


    calcDistance = newLatLng => {
        let prevLatLng = this.state.prevLatLng;
        return haversine(prevLatLng, newLatLng) || 0;
    };

    componentWillMount() {
        this.setState({ enterActivity: true });
    }

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    componentDidMount() {
        this.setState({ unique: this.props.unique })
    }

    getBarLocationCurrency(lat, long) {
        try {
            fetch(GlobalVariables._URL + "/vendors/searchNearby/*/" + lat + "/" + long + "/" + GlobalVariables.userLanguage.value, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            })
                .then(response => response.json())
                .then(response => {
                    if (response !== "") {
                        AsyncStorage.setItem("restCurrCode", response[0].c.c);
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

    getCurrentLocation(uniqueId) {
        Geolocation.getCurrentPosition((position) => {
            this.getBarLocationCurrency(position.coords.latitude, position.coords.longitude);
            this.getTable(uniqueId, position.coords.latitude, position.coords.longitude);
        }, (error) => this.getCurrentLocation(uniqueId));

    }

    getTable(id, lat, long) {
        let url = "";
        console.log('in get table ' + id);
        var userId = GlobalVariables.userId.value;
        if (isNaN(GlobalVariables.userId.value)) {
            userId = GlobalVariables.userId.value.replace(/['"]+/g, '');
        }
        url = GlobalVariables._URL + "/checkin/" + lat + "/" + long;
        let body = JSON.stringify({
            "UserId": userId,
            "UniqueID": id
        });
        try {
            let url = `${GlobalVariables._URL}/checkin/${lat}/${long}`;
            if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                url = `${GlobalVariables._URL}/checkin/`;
            }
            fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },

                body: body


            })
                .then(response => response.json())
                .then(response => {
                    if (response !== null) {

                        console.log(response)
                        //   alert(JSON.stringify(response))
                        let restaurantId;
                        restaurantId = response.vendorId;

                        if (restaurantId !== 0) {

                            AsyncStorage.setItem("checkIn", "true");
                            AsyncStorage.setItem("savedBarId", restaurantId.toString());
                            AsyncStorage.setItem("tableNumber", response.tableNumber);
                            AsyncStorage.setItem("checkedInLocationLat", response.vendorLat.toString());
                            AsyncStorage.setItem("checkedInLocationLong", response.vendorLng.toString());
                            AsyncStorage.setItem("LocationDiscountPercent", response.discountPercentage.toString());
                            AsyncStorage.setItem('locationDiscount', response.discountPercentage.toString());
                            GlobalVariables.restId.value = restaurantId;
                            GlobalVariables.tableNumber.value = response.tableNumber;
                            GlobalVariables.checkedInLocation.value = restaurantId;
                            GlobalVariables.orders = [];

                            if (GlobalVariables.userLanguage.value === "he-IL") {
                                AsyncStorage.setItem("savedBarName", response.vendorNameHe);
                            } else {
                                AsyncStorage.setItem("savedBarName", response.vendorName);
                            }
                            if (GlobalVariables.userLanguage.value === "he-IL") {
                                GlobalVariables.restName.value = response.vendorNameHe;
                            } else {
                                GlobalVariables.restName.value = response.vendorName;
                            }
                            if (GlobalVariables.userLanguage.value === "he-IL") {
                                this.setState({ nameBar: response.vendorNameHe });
                            } else {
                                this.setState({ nameBar: response.vendorName });
                            }
                            //todo: removed temporarily as per client request
                            // this.watchID = Geolocation.watchPosition(
                            //     position => {
                            //         let distanceTravelled = this.state.distanceTravelled;
                            //         let latitude = position.coords.latitude;
                            //
                            //         let longitude = position.coords.longitude;
                            //
                            //         const newCoordinate = {
                            //             latitude,
                            //             longitude
                            //         };
                            //
                            //         this.setState({
                            //             latitude: latitude,
                            //             longitude: longitude,
                            //             distanceTravelled: distanceTravelled + this.calcDistance(newCoordinate),
                            //             prevLatLng: newCoordinate
                            //         });
                            //         if (this.state.showAlert) {
                            //             if (parseFloat(this.state.distanceTravelled).toFixed(2) > 0.15) {
                            //                 this.checkOut();
                            //             }
                            //
                            //         }
                            //
                            //
                            //     },
                            //     error => console.log(error),
                            //     {
                            //         enableHighAccuracy: true,
                            //         timeout: 1000,
                            //         maximumAge: 1000,
                            //         distanceFilter: 1
                            //     }
                            // );

                            this.props.navigation.navigate("MenuSlider", {
                                screen: "MenuSlider",
                                barId: restaurantId,
                                nameBar: this.state.nameBar,
                                tableNumber: response.tableNumber,
                                showWelcome: true,
                                itemslat: this.state.newLat,
                                itemslong: this.state.newLong,
                                isFromScan: "true"
                            })
                        } else {
                            Alert.alert(
                                localeStrings.barLocationStrings.youAreTooFar,
                                "",
                                [
                                    {
                                        text: localeStrings.scanCodeStrings.ok,

                                        onPress: () =>
                                            this.props.navigation.goBack(null)
                                    },
                                ],
                                { cancelable: false },
                            );
                        }


                    } else {

                        Alert.alert(
                            localeStrings.scanCodeStrings.cantScan,
                            localeStrings.scanCodeStrings.qrCodeNotCorrect,
                            [
                                {
                                    text: localeStrings.scanCodeStrings.cancel,
                                    onPress: () => this.props.navigation.goBack(null)
                                },
                                { text: localeStrings.scanCodeStrings.ok, onPress: () => this.scanner.reactivate() },
                            ],
                            { cancelable: false },
                        );
                    }


                })
                .catch(error => {
                    console.log('error here.');
                    console.log("upload error", error);


                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }

    checkOut() {
        this.setState({ showAlert: false });
        Geolocation.clearWatch(this.watchID);
        alert(localeStrings.scanCodeStrings.youMovedToFar);
        try {
            fetch(GlobalVariables._URL + "/checkin/checkout/" + GlobalVariables.userId.value, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            })

                .then(response => response.json())
                .then(response => {
                    AsyncStorage.setItem("savedBarId", "");
                    AsyncStorage.setItem("savedBarName", "");

                })
                .catch(error => {


                });
        } catch (e) {




        }
    }

    render() {

        return (
            <View>
            <QRCodeScanner
                ref={(node) => {
                    this.scanner = node
                }}
                showMarker
                onRead={this.onSuccess.bind(this)}
                cameraStyle={{ height: SCREEN_HEIGHT }}
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
                                <TouchableOpacity onPress={() => this.props.navigation.goBack(null)} style={{
                                    width: 45,
                                    height: 45,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    alignSelf: "center"
                                }}>
                                    <Image style={{ resizeMode: "contain", width: 20, height: 20 }}
                                        source={require('../../res/images/close.png')} />
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
            </View>
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

export default QrCodeCamera;
