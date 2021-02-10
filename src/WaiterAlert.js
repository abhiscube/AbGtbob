import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    AsyncStorage,
    ActivityIndicator, I18nManager
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import DeviceInfo from "react-native-device-info";

import { GlobalVariables } from "../src/GlobalVariables";
import StyleSheetFactory from "../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../res/strings/LocaleStrings';
import Spinner from 'react-native-loading-spinner-overlay';
const deviceLocale = DeviceInfo.getDeviceLocale();
let OrderItems = [];

export default class WaiterAlert extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: "Waiter Alerts",
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View />),
            headerLeft: (
                <TouchableOpacity onPress={() =>
                    AsyncStorage.getItem('role').then((value) => {

                        if (value === "waiter") {

                            navigation.navigate("HomeScreenWaiters", { screen: "HomeScreenWaiters" })
                        } else {
                            navigation.navigate("HomeScreen", { screen: "HomeScreen" })

                        }
                    }).done()} style={styles.headerBackButton}>
                    <Image style={{ resizeMode: "contain", width: 15, height: 15, transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }], }}
                        source={require('../res/images/back.png')} />
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
            orders: OrderItems,
            enterActivity: false
        }
    }

    componentWillMount() {
        this.getAllNotifications(GlobalVariables.userId.value)
    }

    getAllNotifications(userId) {
        this.setState({
            enterActivity: true
        });
        let uri = GlobalVariables._URL + "/notification/" + userId;


        try {
            fetch(uri, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {

                    OrderItems = [];
                    if (response !== "") {


                        console.log(response)
                        this.setState({ orders: response, enterActivity: false })
                    }

                })
                .catch(error => {

                    alert("No notification");

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }


    renderNotification() {

        return (
            this.state.orders.map((items, index) => (

                <TouchableOpacity disabled={true} style={{ flexDirection: "column", marginTop: 10, marginLeft: 10, borderBottomWidth: 0.5, borderBottomColor: "black" }}
                    onPress={() => this.props.navigation.navigate("AlertDetails", { screen: "AlertDetails", orderId: this.state.orders }
                    )}>

                    <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                        <Text style={{ marginRight: 8, color: "gray" }}>{((items.date).split("T")[1]).split(".")[0]}</Text>
                    </View>

                    <View style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginTop: 8,
                        marginBottom: 8
                    }}>
                        <View style={{
                            backgroundColor: "red",
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center"
                        }} />
                        <Text style={{ fontSize: 16, color: "black", fontWeight: "400", }}>{items.messageType}</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginLeft: 15,
                        marginRight: 20,
                        marginBottom: 10,

                    }}>{deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ? <Text style={{
                        width: "100%",
                        height: "100%",
                        fontSize: 13,
                        color: "black",

                    }}>{items.message}</Text> :
                        <Text style={{
                            width: "100%",
                            height: "100%",
                            fontSize: 13,
                            color: "black",
                            textAlign: "left"
                        }}>{items.message}</Text>}

                    </View>

                </TouchableOpacity>

            )))
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <ScrollView>
                    <View style={{ flex: 1, flexDirection: "column", marginBottom: 5 }}>
                        <View style={{
                            height: 40,
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#d8d8d8"
                        }}>
                            <Text style={{ fontSize: 13, color: "#a3a3a3", marginLeft: 8, fontWeight: "bold" }}>{localeStrings.ordersStrings.today}</Text>
                        </View>
                        {this.renderNotification()}

                    </View>

                </ScrollView>
            </View>
        )
    }
}