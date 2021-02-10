import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Platform,
    ActivityIndicator, Alert, I18nManager
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { GlobalVariables } from "../GlobalVariables";
import Modal from "react-native-modal";
import StyleSheetFactory from "../../res/styles/LocaleStyles";
import { Share } from 'react-native';
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import Spinner from 'react-native-loading-spinner-overlay';
export default class OrderDetails extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.orderDetailsStrings.myCart,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<TouchableOpacity onPress={() => navigation.state.params.handlePopup()} style={{
                height: 45,
                width: 45,
                marginRight: 5,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center"
            }}>
                <View style={{ flexDirection: "row" }}>
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "white" }} />
                    <View style={{
                        width: 7,
                        height: 7,
                        borderRadius: 3.5,
                        marginLeft: 4,
                        marginRight: 4,
                        backgroundColor: "white"
                    }} />
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "white" }} />

                </View>
            </TouchableOpacity>),
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
            orderItems: [],
            subtotal: 0,
            taxAmount: 0,
            tips: 0,
            shippingAmount: 0,
            discountAmount: 0,
            discountPercent: 0,
            orderTotal: 0,
            enterActivity: false,
            modalVisible: false

        }
    }

    componentWillMount() {
        this.props.navigation.setParams({ handlePopup: this.showPopUp.bind(this) });
        this.getOrderById(GlobalVariables.userId.value, this.params.orderId)
    }

    SendNotification(type, message, smsAlert) {
        let uri = GlobalVariables._URL + "/notification"
        let Obj = {
            MessageType: type,
            OrderId: this.params.orderId,
            Title: "Info",
            Message: message,

        }
        console.log(Obj)
        try {
            fetch(uri, {
                method: "POST",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }),
                body: (JSON.stringify(Obj))
            })
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                    if (response === true) {
                        this.alertWaiter(smsAlert)
                    }
                    else {
                        Alert.alert(
                            "Info",
                            "Something gone wrong.Please try again later",
                            [
                                {
                                    text: "OK",
                                    onPress: () => console.log("Cancel Pressed"),

                                },

                            ],

                            { cancelable: false }
                        );
                    }


                })
                .catch(error => {
                    console.log("upload error", error);
                    // alert(error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }
    showPopUp() {
        this.setState({ modalVisible: true })
    }

    getOrderById(userId, orderId) {
        this.setState({
            enterActivity: true
        });
        let uri = GlobalVariables._URL + "/history/" + userId + "/orders/" + orderId + "/" + GlobalVariables.userLanguage.value;


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
                    if (response !== "") {
                        this.setState({
                            orderItems: response.orderItems,
                            subtotal: response.subtotal,
                            taxPercent: response.orderItems[0].taxPercent,
                            taxAmount: response.taxAmount,
                            tips: response.tips,
                            //shippingAmount: response.shippingAmount, //To be uncommented and implemented later on
                            discountAmount: response.locationDiscount,
                            discountPercent: response.locationDiscountPercent,
                            orderTotal: response.orderTotal,
                            enterActivity: false
                        })

                    }

                })
                .catch(error => {
                    console.log("upload error", error);
                    alert(error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }

    alertWaiter(title) {
        setTimeout(() => {
            Alert.alert(
                title,
                localeStrings.orderDetailsStrings.messageSent,
                [

                    {
                        text: localeStrings.orderDetailsStrings.ok, onPress: () => this.props.navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                    }
                ],

                { cancelable: false }
            );
        }, 500)

    }

    lateDelivery() {

        Alert.alert(
            localeStrings.orderDetailsStrings.lateDelivery,
            localeStrings.orderDetailsStrings.isProblem, [

            {
                text: localeStrings.orderDetailsStrings.part, onPress: () => {
                    let message = localeStrings.orderDetailsStrings.didNotReceive + " " + localeStrings.orderDetailsStrings.part
                    this.SendNotification("0", message, localeStrings.orderDetailsStrings.didNotReceive)


                }
            },
            {
                text: localeStrings.orderDetailsStrings.all, onPress: () => {

                    let message = localeStrings.orderDetailsStrings.didNotReceive + " " + localeStrings.orderDetailsStrings.all
                    this.SendNotification("1", message, localeStrings.orderDetailsStrings.didNotReceive)

                }
            }
        ],

            { cancelable: false }
        );


    }


    renderTotalSum() {
        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ flexDirection: "column", width: "50%", marginLeft: 15, justifyContent: "flex-start" }}>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                        textAlign: 'left'
                    }}>{localeStrings.orderDetailsStrings.subTotal}</Text>
                    {/* To be implemented later again*/}
                    {/*<Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{localeStrings.orderDetailsStrings.deliveryCharge}</Text>*/}
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                        textAlign: 'left'
                    }}>{localeStrings.orderDetailsStrings.tips}</Text>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                        textAlign: 'left'
                    }}>{localeStrings.orderDetailsStrings.tax} ({this.state.taxPercent}%)</Text>
                    <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                        textAlign: 'left'
                    }}>{localeStrings.orderDetailsStrings.locationDiscount} ({this.state.discountPercent}%)</Text>
                    <Text
                        style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8,
                            textAlign: 'left'
                        }}>{localeStrings.orderDetailsStrings.total}</Text>
                </View>

                <View style={{ flexDirection: "column", width: "50%", justifyContent: "flex-end" }}>
                    <View style={{
                        flexDirection: "column",
                        marginRight: 35,
                        justifyContent: "flex-end",
                        alignItems: "flex-end"
                    }}>
                        {I18nManager.isRTL ? <Text style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8
                        }}>₪ {this.state.subtotal.toFixed(2)}</Text> : <Text style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8
                        }}>{this.state.subtotal.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>}

                        {/* To be implemented again*/}
                        {/*{I18nManager.isRTL ? <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8,
                    }}>₪ {this.state.shippingAmount.toFixed(2)}</Text> : <Text style={{
                        fontFamily: "Helvetica",
                        fontSize: 15,
                        marginTop: 8
                    }}>{this.state.shippingAmount.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>
                    }*/}
                        {I18nManager.isRTL ? <Text style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8
                        }}>₪ {this.state.tips.toFixed(2)}</Text> : <Text style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8
                        }}>{this.state.tips.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>}

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
                            marginTop: 8,
                            fontWeight: "bold",
                        }}>₪ {this.state.orderTotal.toFixed(2)}</Text> : <Text style={{
                            fontFamily: "Helvetica",
                            fontSize: 15,
                            marginTop: 8,
                            fontWeight: "bold",
                        }}>{this.state.orderTotal.toFixed(2)} {GlobalVariables.restCurrencyCode.value}</Text>
                        }
                    </View>

                </View>

                <Modal transparent={true} isVisible={this.state.modalVisible}>
                    <View style={{
                        flex: 1,
                        width: "100%",
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        marginBottom: 10,
                    }}>
                        <View style={{
                            height: 300,
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
                                {/* <View style={{height: 45, marginTop: 10, marginBottom: 5}}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }} onPress={() => {
                                        this.setState({
                                            modalVisible:false
                                        })
                                      
                                        setTimeout(() => {
           
          
                                            this.lateDelivery();
                                          }, 1000)
                                  
                         
                                    }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.orderDetailsStrings.didNotReceive}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View>
                                <View style={styles.BorderView}/>
                                <View style={{height: 45, marginTop: 5, marginBottom: 5}}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }}
                                                      onPress={() => {
                                                        this.setState({modalVisible: false});
                                                        this.SendNotification("2",localeStrings.orderDetailsStrings.changeMyTable,localeStrings.orderDetailsStrings.changeMyTable)
                                                       
                                                          


                                                      }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.orderDetailsStrings.changeMyTable}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View>

                                <View style={styles.BorderView}/>
                                <View style={{height: 45, marginTop: 5, marginBottom: 5}}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }}
                                                      onPress={() => {
                                                        this.setState({modalVisible: false});
                                                        this.SendNotification("3",localeStrings.orderDetailsStrings.callTheWaiter,localeStrings.orderDetailsStrings.callTheWaiter)
                                                        
                                                         
                                                        

                                                      }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.orderDetailsStrings.callTheWaiter}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View> */}
                                <View style={styles.BorderView} />
                                <View style={{ height: 45, marginTop: 5, marginBottom: 5 }}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }}
                                        onPress={() => {
                                            this.setState({ modalVisible: false });
                                            setTimeout(() => {

                                                Share.share({
                                                    message: 'BOB',
                                                    url: 'https://gtbob.com/',
                                                    title: 'Wow, did you see that?'
                                                }, {
                                                    // Android only:
                                                    dialogTitle: 'BOB',
                                                    // iOS only:
                                                    excludedActivityTypes: [
                                                        'com.apple.UIKit.activity.PostToTwitter'
                                                    ]
                                                })

                                            }, 500)



                                        }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.orderDetailsStrings.invoice}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View>
                            </View>


                            <View style={{
                                height: 45,
                                backgroundColor: "white",
                                width: "95%",
                                marginTop: 10,
                                borderRadius: 10,
                                overflow: "hidden"
                            }}>
                                <TouchableOpacity onPress={() => {
                                    this.setState({ modalVisible: false })
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
                                    }}> {localeStrings.orderDetailsStrings.cancel} </Text>
                                </TouchableOpacity>


                            </View>
                        </View>
                    </View>
                </Modal>
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
                                        

                                        <View style={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}>
                                            {I18nManager.isRTL ? <Text style={{
                                                color: "black",
                                                fontWeight: "bold",
                                                fontSize: 15,
                                                //  textAlign: "left",
                                                marginRight: 15
                                            }}>₪ {items.total}</Text> : <Text style={{
                                                color: "black",
                                                fontWeight: "bold",
                                                fontSize: 15,
                                                // textAlign: "left",
                                                marginRight: 15
                                            }}>{items.total} {GlobalVariables.restCurrencyCode.value}</Text>}

                                        </View>
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
                        alignItems: "center",
                        backgroundColor: "#d8d8d8"
                    }}>
                        <Text style={{
                            fontSize: 13,
                            color: "#a3a3a3",

                            fontWeight: "bold"
                        }}>{localeStrings.orderDetailsStrings.yourOrderSummary}</Text>
                    </View>
                    {this.renderOrderId()}

                </View>

            </ScrollView>
        </View>)
    }


}
