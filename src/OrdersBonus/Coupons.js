import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground, I18nManager
} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
var DataCoupon = require("../JSON/Coupon.js");
const {width} = Dimensions.get('window');
let widthView = width;

import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';


export default class Coupons extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.couponsStrings.coupons,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View />),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.navigate("HomeScreen", {screen: "HomeScreen"})} style={styles.headerBackButton}>
                    <Image style={{resizeMode: "contain", width: 15, height: 15, transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}}
                           source={require('../../res/images/back.png')}/>
                </TouchableOpacity>
            ),
            headerTintColor: '#fff',
            headerTitleStyle: {
                textAlign: "center",
                flex: 1,
                alignSelf: "center",
                color: 'white',
                fontSize: 19,
                fontFamily:"Helvetica"
            },

        }
    };
    constructor(props) {
        super(props)

        this.state = {
            coupons:DataCoupon
        }
    }
    componentDidMount(){
      //  this.getCoupons();
    }
    getCoupons(){
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
                     if (response !== "") {
                   this.setState({
                       coupons:response
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

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{flex: 1, height: "100%", width: "100%"}}>
                <View style={{ alignItems:"flex-start"}}>
                    <Text style={{marginLeft: 10, fontSize: 12, fontFamily: "Arial", marginBottom: 10, marginTop: 10}}>{localeStrings.couponsStrings.exploreMore}</Text>
                </View>

                <View style={{width: "100%", height: 0.5, backgroundColor: "black"}}/>

                {this.state.coupons.map((items, index) => (
                    <View key={index} style={{flexDirection: "column"}}>
                        <View style={{width: "100%", height: 0.5, backgroundColor: "black"}}/>
                        <View style={{flexDirection: "row", width: "100%"}}>

                            <View style={{marginLeft: 0, width: 130}}>
                                <ImageBackground style={{resizeMode: "contain", width: 130, height: 100}}
                                                 source={items.image}/>
                            </View>

                            <View style={{
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems:"flex-start",
                                marginLeft: 10,
                                width: widthView - 130
                            }}>
                                <Text style={{fontSize: 12}}>{items.title}</Text>
                                <Text style={{fontSize: 12}}>{items.discount}{localeStrings.couponsStrings.checkOurCoupons}</Text>
                            </View>

                        </View>
                        <View style={{width: "100%", backgroundColor: "black", height: 0.5}}/>
                    </View>
                ))}


            </View>
        )
    }
}


