import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView, Button,
    ImageBackground,
    AsyncStorage,
    ActivityIndicator, I18nManager
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import DeviceInfo from "react-native-device-info";
import moment from "moment";
import Spinner from 'react-native-loading-spinner-overlay';

var lang = ';'


import { GlobalVariables } from "../GlobalVariables";
import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';

const deviceLocale = DeviceInfo.getDeviceLocale();
let OrderItems = [];
let color, status, textColor = '';

export default class Orders extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.ordersStrings.orders,
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
                    }).done()
                } style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
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

        this.state = {
            orders: OrderItems,
            enterActivity: false
        }
    }

    componentDidMount() {
        setTimeout(() => {
            AsyncStorage.getItem('userLanguage').then((value) => {
                lang = value;
                console.log("->" + lang)
                console.log('------' + GlobalVariables.userLanguage.value)
                if (lang == GlobalVariables.userLanguage.value && lang == "he-IL") {
                    require("moment/locale/he");
                } else {
                    require("moment/locale/en-gb");
                }
                this.getAllOrders(GlobalVariables.userId.value)
            }).done();
        }, 1000);

    }

    getAllOrders(userId) {
        this.setState({
            enterActivity: true
        });
        let uri = GlobalVariables._URL + "/history/" + userId + "/orders/" + GlobalVariables.userLanguage.value;


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
                        for (let i = 0; i < response.length; i++) {
                            if (response[i].orderStatus == 1) {
                                status = localeStrings.ordersStrings.newOrder;
                            }
                            if (response[i].orderStatus == 10) {
                                status = localeStrings.ordersStrings.newOrder;
                            }
                            if (response[i].orderStatus == 20) {
                                status = localeStrings.ordersStrings.newOrder;
                            }
                            if (response[i].orderStatus == 30) {
                                status = localeStrings.ordersStrings.inProgress;
                            }
                            if (response[i].orderStatus == 35) {
                                status = localeStrings.ordersStrings.payFailedOrder;
                            }
                            if (response[i].orderStatus == 40) {
                                status = localeStrings.ordersStrings.completeOrder;
                            }
                            if (response[i].orderStatus == 50) {
                                status = localeStrings.ordersStrings.shippingOrder;
                            }
                            if (response[i].orderStatus == 60) {
                                status = localeStrings.ordersStrings.shippingOrder;
                            }
                            if (response[i].orderStatus == 70) {
                                status = localeStrings.ordersStrings.completeOrder;
                            }
                            if (response[i].orderStatus == 80) {
                                status = localeStrings.ordersStrings.cancelledOrder;
                            }
                            if (response[i].orderStatus == 90) {
                                status = localeStrings.ordersStrings.refundedOrder;
                            }
                            if (response[i].orderStatus == 100) {
                                status = localeStrings.ordersStrings.completeOrder;
                            }
                            let orderItem = {
                                id: response[i].id,
                                date: moment(response[i].createdOn).format('MMMM Do, h:mm'),
                                content: response[i].orderContent,
                                status: status,
                                color: response[i].orderStatusColorString,
                                textColor: '#ffffff',
                                locationDiscount: response[i].locationDiscount
                            };
                            OrderItems.push(orderItem);
                        }
                        this.setState({ orders: OrderItems, enterActivity: false })
                    }

                })
                .catch(error => {

                    alert(localeStrings.ordersStrings.noOrders);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }


    renderHistoryOrders() {

        return (

            this.state.orders.map((items, index) => (

                <TouchableOpacity style={{
                    flexDirection: "column",
                    marginTop: 10,
                    marginLeft: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "black"
                }}
                    onPress={() => {
                        GlobalVariables.orderServer = [];
                        GlobalVariables.orderServer.push({
                            id: items.id,
                            locationDiscount: items.locationDiscount
                        });
                        this.props.navigation.navigate(
                            "OrderDetails", {
                            screen: "OrderDetails",
                            orderId: items.id
                        })
                    }
                    }>

                    <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                        <Text style={{ marginRight: 8, color: "gray" }}>{items.date}</Text>
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
                            //    backgroundColor: "red",
                            width: 5,
                            height: 5,
                            borderRadius: 5,
                            marginRight: 10,
                            marginBottom: 15,
                            justifyContent: "center",
                            alignItems: "center"
                        }} />
                        <View style={styles.container}>
                            <View style={styles.halfByHalf}>
                                <Text style={{
                                    fontSize: 16,
                                    color: "black",
                                    fontWeight: "400",
                                }}>{localeStrings.ordersStrings.orderNumber} {items.id}</Text>
                            </View>
                            <View style={styles.statusBtn}>
                                <TouchableOpacity
                                    style={[styles.SubmitButtonStyle, { backgroundColor: items.color }]}
                                    activeOpacity={.5}
                                >
                                    <Text style={styles.TextStyle}> {items.status} </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

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

                    }}>{items.content}</Text> :
                        <Text style={{
                            width: "100%",
                            height: "100%",
                            fontSize: 13,
                            color: "black",
                            textAlign: "left"
                        }}>{items.content}</Text>}

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
                            <Text style={{
                                fontSize: 13,
                                color: "#a3a3a3",
                                marginLeft: 8,
                                fontWeight: "bold"
                            }}>{localeStrings.ordersStrings.allOrders}</Text>
                        </View>
                        {this.renderHistoryOrders()}

                    </View>

                </ScrollView>
            </View>
        )
    }
}
