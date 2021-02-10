import React, {Component} from 'react'
import {WebView} from 'react-native-webview';
import {
    View,
    ActivityIndicator,
    Text,
    Image,
    TouchableOpacity,
    Alert, I18nManager
} from 'react-native'
import {getStatusBarHeight} from 'react-native-iphone-x-helper'
import localeStrings from '../res/strings/LocaleStrings';
import StyleSheetFactory from "../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import {GlobalVariables} from "./GlobalVariables";

export default class Paypal extends Component {

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

            headerRight: (<View/>),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.navigate("HomeScreen", {screen: "HomeScreen"})}
                                  style={styles.headerBackButton}>
                    <Image style={{
                        resizeMode: "contain",
                        width: 15,
                        height: 15,
                        marginBottom: 5,
                        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]
                    }}
                           source={require("../res/images/back.png")}/>
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
        this.state = {
            accessToken: null,
            approvalUrl: "",
            paymentId: "",
            sendOnce: true,
        }
    }

    componentDidMount() {


        try {
            fetch(GlobalVariables._URL+'/PaypalExpress/CreatePayment/' + GlobalVariables.userId.value, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                }
            })
                .then(response => response.json())
                .then(response => {
              
                    this.setState({
                        approvalUrl: response.approvalUrl,
                        paymentId: response.paymentId
                    })
                })
                .catch(error => {
                    console.log(error)

                });
        } catch (e) {
            console.log(e)


        }
    }


    _onNavigationStateChange = (webViewState) => {

        if (!webViewState.title.includes("about")) {
            console.log("it is about not ");

            if (webViewState.url.includes('https://gtbob.com/paypalexpresssuccess')) {
                console.log("webViewState", JSON.stringify(webViewState) + "approvalUrl", this.state.approvalUrl);

            this.setState({
                approvalUrl: ""
            });

            const urlSite = webViewState.url;
            let newSite = urlSite.split("?");
            let date = newSite[1];
            let newDate = date.split("&");
            /// paymendId
            let split3 = newDate[0];
            let paymentIdFull = split3.split("=");
            let paymentid = paymentIdFull[1];
            //payerID
            let payerIdFull = newDate[2].split("=");
            let payerid = payerIdFull[1];


            let data = {
                paymentID: paymentid,
                payerID: payerid
            };


                console.log("ExecutePayment", data);
                fetch(GlobalVariables._URL+'/PaypalExpress/ExecutePayment/' + GlobalVariables.userId.value, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(response => {
                        console.log("response", response);
                        let orderId = response.orderId;
                        this.props.navigation.navigate("OrderCompleted", {
                            screen: "OrderCompleted", NoOrder: orderId
                        })
                    })
                    .catch(error => {
                        console.log("FROM FETCH", error)

                });


            }
        } else {
            console.log("it is about");
        }


    };

    showPaypal() {

        if (this.state.approvalUrl != null || this.state.approvalUrl !== "") {
            const injectedJs = `window.postMessage(window.location.href);`;
            return (

                <View style={{flex: 1}}>
                    <WebView
                        style={{marginTop: 20}}
                        source={{uri: this.state.approvalUrl}}
                        injectedJavaScript={injectedJs}
                        onNavigationStateChange={this._onNavigationStateChange}
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
                            console.log('LOAD END');
                        }}
                        onError={err => {
                            console.log('ERROR ');
                            console.log(err);
                        }}

                    />

                </View>


            )
        }


    }

    render() {


        return (
            <View style={{flex: 1}}>
                {this.showPaypal()}
            </View>
        )
    }
}