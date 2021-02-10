import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import {
    View,
    Image,
    AsyncStorage,
    TouchableOpacity,
    Alert, I18nManager, ActivityIndicator
} from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import localeStrings from '../res/strings/LocaleStrings';
import StyleSheetFactory from "../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import { GlobalVariables } from "./GlobalVariables";


export default class Isracard extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: (<View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("HomeScreen", { screen: "HomeScreen" })
                }}>
                    <Image style={{
                        resizeMode: "contain", width: 65, height: 65, marginBottom: 5,
                    }} source={require("../res/images/logo.png")} />
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

            headerRight: (<View />),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.navigate("HomeScreen", { screen: "HomeScreen" })}
                    style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        marginBottom: 5,
                        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
                    }}
                        source={require("../res/images/back.png")} />
                </TouchableOpacity>
            ),
            headerTintColor: '#fff',
            headerTitleStyle: {
                textAlign: "center",
                flex: 1,
                alignSelf: "center",
                color: 'white',
                fontSize: 17,
            },

        }
    };

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = ({
            urlIsracard: "",
            email: "",
            cardMask: this.params.item1,
            cardExp: this.params.item2,
            cardName: this.params.item3,
            orderId: "",
            webViewLoading: false,
            payme_sale_id: "",
            payme_signature: "",
            payme_transaction_id: "",
            isSavedCard : false

        })
    }


    componentDidMount() {
        let Obj = {};
        if (this.state.cardMask === undefined && this.state.cardExp === undefined && this.state.cardName === undefined) {
            Obj = {
                UserID: GlobalVariables.userId.value,
                CouponCode: this.params.coupon,
                Tips: this.params.tips,
                Remember: this.params.item,
                Card: {}
            }
        } else {
            Obj = {
                UserID: GlobalVariables.userId.value,
                CouponCode: this.params.coupon,
                Tips: this.params.tips,
                Remember: this.params.item,
                Card: {
                    "buyer_card_mask": this.state.cardMask,
                    "buyer_card_exp": this.state.cardExp,
                    "buyer_name": this.state.cardName
                }
            }
        }
        console.log(Obj);
        this.setState({
            webViewLoading: true
        });
        try {
            fetch(GlobalVariables._URL + '/Isracard/CreatePayment', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(Obj)
            })
                .then(response => response.json())
                .then(response => {
                    console.log("enter create", response);
                    
                    
                    if (response.done === "true" && Obj.Card.buyer_card_mask != undefined) {
                        if (response.payme_signature != '' || response.payme_signature != 'undefined' || response.payme_signature != 'null' || response.payme_signature != null || response.payme_signature != undefined) {
                            this.setState({
                                payme_signature: response.payme_signature,
                                payme_sale_id: response.payme_sale_id,
                                payme_transaction_id: response.payme_transaction_id,
                                orderId: response.order_id,
                                urlIsracard: response.sale_url,
                                isSavedCard : true
                            })
                            this._onNavigationStateChange();
                        }
                    }

                    setTimeout(() => {

                        this.setState({
                            orderId: response.order_id,
                            urlIsracard: response.sale_url,

                        })

                    }, 500)


                })
                .catch(error => {
                    console.log(error)

                });
        } catch (e) {
            console.log(e)


        }
    }

    _onNavigationStateChange = (webViewState) => {
        if (this.state.isSavedCard === true) {
            let data = {
                payme_signature: this.state.payme_signature,
                payme_sale_id: this.state.payme_sale_id,
                payme_transaction_id: this.state.payme_transaction_id
            };
            try {
                fetch(GlobalVariables._URL + '/Isracard/ExecutePayment/' + GlobalVariables.userId.value + "/" + this.state.orderId, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);
                        if (response.status === "success") {
                            this.props.navigation.navigate("OrderCompleted", {
                                screen: "OrderCompleted", NoOrder: response.orderId
                            })
                        } else {
                            Alert.alert(
                                "Payment failed",
                                "Please try again",
                                [
                                    {
                                        text: "Ok", onPress: () => this.props.navigation.goBack(null)
                                    },
                                ],
                                { cancelable: false },
                            );
                        }
                    })
                    .catch(error => {
                        console.log("FROM FETCH", error)

                    });
            } catch (e) {
                console.error("upload catch error", e);

            }
        } else {
            if (!webViewState.title.includes("about"))  {
                console.log("enter about");
                if (webViewState.url.includes('http://bob.justplus.eu/app/index.html?payme_status') && webViewState.loading === false) {

                    console.log("enter succes");

                    this.setState({ urlIsracard: "" });

                    const urlSite = webViewState.url;
                    let newSite = urlSite.split("&", 4);

                    let signature = newSite[1].split("=");
                    let paymeSignature = signature[1];

                    let saleId = newSite[2].split("=");
                    let paymeSaleId = saleId[1];

                    let transactionId = newSite[3].split("=");
                    let paymeTransactionId = transactionId[1];

                    let data = {
                        payme_signature: paymeSignature,
                        payme_sale_id: paymeSaleId,
                        payme_transaction_id: paymeTransactionId
                    };

                    console.log("before fetch");
                    console.log(GlobalVariables.userId.value);
                    try {
                        fetch(GlobalVariables._URL + '/Isracard/ExecutePayment/' + GlobalVariables.userId.value + "/" + this.state.orderId, {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',

                            },
                            body: JSON.stringify(data)
                        }).then(response => response.json())
                            .then(response => {
                                console.log(response);
                                if (response.status === "success") {

                                    this.props.navigation.navigate("OrderCompleted", {
                                        screen: "OrderCompleted", NoOrder: response.orderId
                                    })
                                } else {
                                    Alert.alert(
                                        "Payment failed",
                                        "Please try again",
                                        [
                                            {
                                                text: "Ok", onPress: () => this.props.navigation.goBack(null)
                                            },
                                        ],
                                        { cancelable: false },
                                    );
                                }
                            })
                            .catch(error => {
                                console.log("FROM FETCH", error)

                            });
                    } catch (e) {
                        console.error("upload catch error", e);

                    }
                }
            } else {
                console.log("not good")
            }
        }
    };


    render() {
        console.log("enter render");
        if (this.state.urlIsracard !== null && this.state.urlIsracard !== "") {


            const injectedJs = `window.postMessage(window.location.href);`;
            return (
                <View style={{ flex: 1 }}>
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
                    <WebView
                        onNavigationStateChange={this._onNavigationStateChange}
                        injectedJavaScript={injectedJs}
                        style={{ marginTop: 20 }}
                        source={{ uri: this.state.urlIsracard }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={false}
                        onMessage={event => {
                            console.log('MESSAGE >>>>' + event.nativeEvent.data);
                        }}
                        onLoadStart={() => {
                            console.log("LOAD START ");
                        }}
                        onLoadEnd={() => {
                            this.setState({
                                webViewLoading: false
                            });
                            console.log('LOAD END');


                        }}
                        onError={err => {
                            console.log('ERROR ');
                            console.log(err);
                        }}

                    />
                </View>
            )
        } else {
            return (
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
            );
        }
    }
}