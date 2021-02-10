import React, {Component} from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    I18nManager,ScrollView

} from "react-native";

import Modal from "react-native-modal";

import {getStatusBarHeight} from 'react-native-iphone-x-helper'
import session from "../session";

const {width} = Dimensions.get('window');

import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
export default class PeopleCheckIn extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: localeStrings.whoIsInStrings.whosIn,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View/>),
            headerLeft: (
                <TouchableOpacity onPress={() => {
                    navigation.goBack(null)
                }}
                                  style={styles.headerBackButton}>
                    <Image style={{resizeMode: "contain", width: 15, height: 15,  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}}
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
                fontFamily: "Helvetica"

            },

        }
    };

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
       this.state={
            users:this.params.person
       }
    }

   
   



       

    

    render() {

        return (
            <ScrollView style={{flex: 1}}>
            <View style={{
                flex: 1,
                height: "100%",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 20
            }}>
                {this.state.users.map((items, index) =>
                    (<View style={{
                        flexDirection: "row",
                        height: 55,
                        marginLeft: 15,
                        alignItems: "center",
                        borderBottomColor: "black",
                        borderBottomWidth: 1,
                        width: "100%"
                    }}>
                 <Image style={{resizeMode: "contain", width: 40, height: 40,borderRadius:20,marginLeft:5}}
                           source={{uri:items.url}}/>
                <Text>{items.fn}</Text>
           </View>)
                )}
               </View>
            </ScrollView>
        )
    }
}


