import React, { Component } from "react";
import {

    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,

    ActivityIndicator, I18nManager
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'


import StyleSheetFactory from "../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../res/strings/LocaleStrings';
import { GlobalVariables } from "./GlobalVariables";
import Spinner from 'react-native-loading-spinner-overlay';

export default class AlertDetails extends React.Component {
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

            headerRight: (<View></View>),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack(null)} style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
                    }}
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
        this.params = this.props.navigation.state.params;
        this.state = {
            orderItems: [],
            subtotal: 0,
            taxAmount: 0,
            shippingAmount: 0,
            discountAmount: 0,
            orderTotal: 0,
            enterActivity: false,
            modalVisible: false

        }
    }

    componentWillMount() {

    }


    // getOrderById(userId, orderId) {
    //     this.setState({
    //         enterActivity: true
    //     });
    //     let uri = GlobalVariables._URL +  "/history/" + userId + "/orders/" + orderId + "/" + GlobalVariables.userLanguage.value;


    //     try {
    //         fetch(uri, {
    //             method: "GET",
    //             headers: new Headers({
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/x-www-form-urlencoded'
    //             }),
    //         })
    //             .then(response => response.json())
    //             .then(response => {

    //                 if (response !== "") {
    //                     this.setState({
    //                         orderItems: response.orderItems,
    //                         subtotal: response.subtotal,
    //                         taxAmount: response.taxAmount,
    //                         shippingAmount: response.shippingAmount,
    //                         discountAmount: response.locationDiscount,
    //                         orderTotal: response.orderTotal,
    //                         enterActivity: false
    //                     })

    //                 }

    //             })
    //             .catch(error => {
    //                 console.log("upload error", error);
    //                 alert(error);

    //             });
    //     } catch (e) {
    //         console.error("upload catch error", e);

    //     }
    // }






    renderTotalSum() {
        return (
            <View style={{
                flexDirection: "row",
                width: "100%",
                marginBottom: 10,
                marginTop: 10,
                justifyContent: "flex-end"
            }}>
                <View style={{
                    flexDirection: "column",
                    marginRight: 15,
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                }}>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                    }}>{localeStrings.orderDetailsStrings.subTotal}</Text>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{localeStrings.orderDetailsStrings.deliveryCharge}</Text>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,

                        marginTop: 8
                    }}>{localeStrings.orderDetailsStrings.tax}</Text>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,

                        marginTop: 8
                    }}>{localeStrings.orderDetailsStrings.locationDiscount}</Text>
                    <Text
                        style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 15,

                        }}>{localeStrings.orderDetailsStrings.total}</Text>
                </View>

                <View style={{
                    flexDirection: "column",
                    marginRight: 10,
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                }}>

                    {I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                    }}>₪ {this.state.subtotal.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                    }}>{this.state.subtotal.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>}

                    {I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                    }}>₪ {this.state.shippingAmount.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{this.state.shippingAmount.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>
                    }

                    {I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>₪ {this.state.taxAmount.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{this.state.taxAmount.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>}

                    {I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>₪ {this.state.discountAmount.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{this.state.discountAmount.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>
                    }

                    {I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 15,
                        fontWeight: "bold",
                    }}>₪ {this.state.orderTotal.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 15,
                        fontWeight: "bold",
                    }}>{this.state.orderTotal.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>
                    }

                </View>


            </View>)
    }

    renderOrderId() {
        return (
            <View style={{ flex: 1, width: "100%", marginTop: 10 }}>
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                {this.state.orderItems.map((items, index) => {
                    return (
                        <View key={index} style={{
                            width: "100%",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            borderBottomWidth: 0.5,
                            borderBottomColor: "#4A4A4A",
                        }}>
                            <View style={{ flexDirection: "row", width: "100%", justifyContent: "center" }}>
                                <Image style={{ resizeMode: "contain", width: 80, height: 110 }}
                                    source={{ uri: GlobalVariables._URL + "/" + items.productImage }} />

                                <View style={{
                                    marginRight: 15,
                                    marginLeft: 15,
                                    width: "65%"
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        width: "100%",
                                        justifyContent: "space-between",
                                        height: "100%"
                                    }}>
                                        <View style={{
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "flex-start",
                                        }}>
                                            <Text style={{
                                                color: "black",
                                                marginTop: 5,
                                                fontWeight: "bold",
                                                fontSize: 15,
                                            }}>{items.productName}</Text>
                                            <Text style={{

                                            }}>{localeStrings.orderDetailsStrings.quantity} {items.quantity}</Text>
                                        </View>

                                        <View style={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}>
                                            {I18nManager.isRTL ? <Text style={{
                                                color: "black",
                                                //  textAlign: "left",
                                                marginRight: 15
                                            }}>₪ {items.total}</Text> : <Text style={{
                                                color: "black",
                                                // textAlign: "left",
                                                marginRight: 15
                                            }}>{items.total} {GlobalVariables.restCurrencyCode.value}</Text>}

                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )


                })}
                <View style={{ flex: 1 }}>
                    {this.renderTotalSum()}
                </View>
            </View>
        )
    }

    render() {
        return (<View style={{ flex: 1 }}>

            <ScrollView>
                <View style={{ flex: 1, flexDirection: "column", marginBottom: 5 }}>
                    <View style={{
                        height: 40,
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        backgroundColor: "#d8d8d8"
                    }}>
                        <Text style={{
                            fontSize: 13,
                            color: "#a3a3a3",
                            marginLeft: 8
                        }}>{localeStrings.orderDetailsStrings.yourOrderSummary}</Text>
                    </View>
                    {this.renderOrderId()}

                </View>

            </ScrollView>
        </View>)
    }


}
