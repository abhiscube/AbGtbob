import React, {Component} from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity, I18nManager,


} from "react-native";
import {getStatusBarHeight} from 'react-native-iphone-x-helper'
import {GlobalVariables} from "../GlobalVariables"
import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class Dressing extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.state.params.typeDressing,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View/>),
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.navigate("DetailsItem", {screen: "DetailsItem"})} style={styles.headerBackButton}>
                    <Image style={{resizeMode: "contain", width: 15, height: 15, marginBottom: 5,transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}}
                           source={require('../../res/images/back.png')}/>
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
        this.params = this.props.navigation.state.params

    }


    render() {

        return (
            <DressingSelected navigation={this.props.navigation}/>

        )
    }
}

class DressingSelected extends React.Component {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = {
            dressing: false,
            extraDressing: false,
            number: null,
            dressingId: 0,
            dressingName: "",
            dressingImage:null,
            extraDressingName: "",
            extraDressingId: 0,
            extraDressingPrice: 0,
            extraDressingImage:null
        };
    }


    render() {

        if (this.params.choiceDressing === true) {
            return (
                <View style={{flex: 1, marginTop: 15}}>
                    {this.params.dressingData.map((items, index) => (
                        <View style={{flexDirection: "column", height: 45, width: "100%", marginLeft: 15}} key={index}>
                            <View style={{height: 45, flexDirection: "row", justifyContent: "space-between"}}>
                                <Text style={styles.text}>{items.n}</Text>

                                <TouchableOpacity
                                    style={{marginRight: 25, justifyContent: "center"}}
                                    onPress={() => {
                                        this.setState({
                                            dressing: true,
                                            number: index,
                                            dressingId: items.i,
                                            dressingName: items.n,
                                            dressingImage:GlobalVariables._URL +  "/"+items.t


                                        });


                                    }
                                    }>
                                    {this.state.dressing && this.state.number === index ?
                                        <Image source={require('../../res/images/confirmed.png')}
                                               style={{height: 15, width: 15}}/> :
                                        <View style={{height: 25, width: 25, borderColor: "black", borderWidth: 1}}/>}
                                </TouchableOpacity>
                            </View>
                            <View style={styles.BorderView}/>
                        </View>


                    ))
                    }
                    <View style={{flex: 1, justifyContent: "flex-end", marginBottom: 0}}>
                        <TouchableOpacity
                            onPress={() => {
                                GlobalVariables.dressings.id = this.state.dressingId;
                                GlobalVariables.dressings.name = this.state.dressingName;
                                GlobalVariables.dressings.image=this.state.dressingImage;

                                this.props.navigation.navigate("DetailsItem",{screen:"DetailsItem"})
                            }}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#004C6C",
                                height: 45,
                            }}>
                            <Text style={{fontSize: 16, color: "white", textAlign: "center"}}>{localeStrings.detailItemsStrings.apply}</Text>

                        </TouchableOpacity>
                    </View>
                </View>
            )

        } else {
            return (
                <View style={{flex: 1, marginTop: 15}}>
                    {this.params.dressingData.map((items, index) => (
                        <View key={index} style={{height: 45, width: "100%", marginLeft: 15,}}>
                            <View style={{
                                height: 45,
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}>
                                <View style={{justifyContent: 'center', flexDirection: "row"}}>
                                    <Text style={styles.text}>{items.n}</Text>
                                    {I18nManager.isRTL ? <Text style={[styles.text, {marginLeft: 15}]}>₪ {items.p}+</Text>:<Text style={[styles.text, {marginLeft: 15}]}>+{items.p} ILS</Text>}

                                </View>
                                <TouchableOpacity
                                    style={{marginRight: 25, justifyContent: "center"}}
                                    onPress={() => {
                                        this.setState({
                                            extraDressing: true,
                                            number: index,
                                            extraDressingId: items.i,
                                            extraDressingName: items.n,
                                            extraDressingPrice:items.p,
                                            extraDressingImage:GlobalVariables._URL +  "/"+items.t
                                        });

                                    }}>
                                    {this.state.extraDressing && this.state.number === index ?
                                        <Image source={require('../../res/images/confirmed.png')}
                                               style={{height: 15, width: 15}}/> :
                                        <View style={{height: 25, width: 25, borderColor: "black", borderWidth: 1}}/>}
                                </TouchableOpacity>
                            </View>
                            <View style={styles.BorderView}/>

                        </View>

                    ))
                    }
                    <View style={{flex: 1, justifyContent: "flex-end", marginBottom: 0}}>
                        <TouchableOpacity
                            onPress={() => {
                                GlobalVariables.extraDressings.id = this.state.extraDressingId;
                                GlobalVariables.extraDressings.name = this.state.extraDressingName;
                                GlobalVariables.extraDressings.price = this.state.extraDressingPrice;
                                GlobalVariables.extraDressings.image= this.state.extraDressingImage;
                                this.props.navigation.navigate("DetailsItem",{screen:"DetailsItem"})
                            }}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#004C6C",
                                height: 45,
                            }}>
                            <Text style={{fontSize: 16, color: "white", textAlign: "center"}}>{localeStrings.detailItemsStrings.apply}</Text>

                        </TouchableOpacity>
                    </View>
                </View>
            )
        }


    }
}






