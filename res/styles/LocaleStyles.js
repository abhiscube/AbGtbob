import { I18nManager, StyleSheet, View } from 'react-native';

import i18n from '../../res/strings/LocaleStrings';
import DeviceInfo from "react-native-device-info";
import { GlobalVariables } from "../../src/GlobalVariables";
import {
    Dimensions,
} from "react-native";
import React from "react";
const { width } = Dimensions.get('window');

const { height } = Dimensions.get('window');
const deviceLocale = DeviceInfo.getDeviceLocale();
export default class StyleSheetFactory {
    static getSheet(isRTL) {
        isRTL ? i18n.setLanguage('he') : i18n.setLanguage('en');

        return StyleSheet.create({
            TextInputStyle: {
                letterSpacing: 1,
                fontSize: 20
            },
            otpInputStyle: {
                letterSpacing: 30,
                fontSize: 20,
                width: "100%"
            },
            headerBackButton: {
                height: 45,
                width: 45,
                marginLeft: 15,
                justifyContent: "center",
                alignItems: "flex-start"
            },
            ratingPlace: {
                justifyContent: isRTL ? "flex-end" : "flex-start"
            },

            //FirstPage
            Text: {
                color: "white",
                fontSize: 13,
                fontFamily: "Helvetica"
            },
            BtnSignUp: {
                backgroundColor: "#26466c",
                width: isRTL ? "54%" : "45%",
                justifyContent: "center",
                height: 55,
                alignItems: "center",
                borderRadius: 4
            },
            /*Hairline */
            hairline: {
                borderBottomColor: "black",
                borderBottomWidth: 10,
                alignSelf: 'stretch',
                width: "100%"
            },
            BtnLogIn: {
                backgroundColor: "white",
                width: isRTL ? "42%" : "45%",
                justifyContent: "center",
                height: 55,
                alignItems: "center",
                marginLeft: 10,
                borderRadius: 4
            },
            isVisibleImg: {
                resizeMode: "contain", width: 15, height: 15, marginTop: -53, tintColor: "blue"
            },
            isNotVisibleImg: {
                resizeMode: "contain", width: 15, height: 15, marginTop: -53, tintColor: "black"
            },

            //Log in / Sign up / forgot pass
            emailImgPass: {
                resizeMode: "contain",
                height: 25,
                width: 25,
            },
            logInFields: {
                alignItems: "flex-start",
                textAlign: isRTL ? "right" : "left",
                position: "absolute",
                fontFamily: "Helvetica",
                fontSize: 14,
                //  width:"100%"
            },

            invalidField: {

                textAlign: (deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US") ? "right" : "auto",
                color: 'red',
                marginTop: 44,
                fontSize: 12
            },


            //home screen / modal

            ImgArrow: {
                transform: [{ scaleX: isRTL ? -1 : 1 }],
                resizeMode: "contain",
                width: 10,
                height: 15,
                marginRight: 15
            },
            ViewTextImg: {
                marginLeft: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
                paddingRight: 15,

            },
            ViewTextWithBtn: {
                marginLeft: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
                paddingRight: 15,

            },
            imgLeft: {
                width: "5%",
                width: 12,
                height: 12,
                marginRight: 15
            },
            BtnRight: {
                fontFamily: 'Helvetica',
                fontSize: 13,
                width: "30%",
            },
            halfByHalf: {
                width: '55%',
                height: 40
            },
            statusBtn: {
                width: '35%',
                height: 30,
                borderRadius: 10,

            },
            SubmitButtonStyle: {
                paddingBottom: 2,
                backgroundColor: '#00BCD4',
                borderRadius: 50,
                borderWidth: 1,
                borderColor: '#fff'
            },
            TextStyle: {
                color: '#fff',
                textAlign: 'center',
            },

            ViewOptions: {
                height: 50,
                justifyContent: "center",
                borderColor: "black",
                borderBottomWidth: 0.5

            },
            cardTouchableOpacity: {
                flex: 1, flexDirection: "row"
            },
            couponMainImg: {
                width: width / 1.63, height: height * 0.124
            },
            couponMainImgShadow: {
                backgroundColor: "#fff", borderRadius: 0, overflow: "hidden"
            },
            imageShadowView: {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderBottomWidth: 0,
                shadowColor: '#eee',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 2.4,
                marginLeft: 10,
                marginRight: 5,
                marginTop: 0,
                marginBottom: 1
            },
            cardTextView: {
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            cardTextColumn: {
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            cardTitleTop: {
                color: '#494949', fontSize: 18, marginLeft: 20, fontWeight: "bold"
            },
            cardTitleBottom: {
                color: '#494949', marginLeft: 18, fontSize: 14, marginBottom: 5
            },
            footerImage: {
                resizeMode: "contain",
                width: 50,
                height: 30,
                margin: 8,
                alignSelf: "flex-end"
            },
            ImgBackground: {
                ...Platform.select({
                    ios: {
                        height: height / 4.8,
                    },
                    android: {
                        height: height / 10,
                    },
                }),
                borderWidth: 2,
                borderRadius: 10,
                borderColor: '#f7f9fc',
                overflow: "hidden",
                //position:"absolute",
                shadowColor: '#26466c', // '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 5.8,
            },
            ImgBackgroundCheckin: {
                ...Platform.select({
                    ios: {
                        resizeMode: 'contain',
                        height: height / 4.8,
                    },
                    android: {
                        height: height / 10,
                    },
                }),
                borderWidth: 2,
                borderRadius: 10,
                borderColor: '#f7f9fc',
                overflow: "hidden",
                //position:"absolute",
                shadowColor: '#26466c', // '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 2.6,
                zIndex: 5

            },
            OpenOrderPopUp: {
                position: 'absolute',
                height: 45,
                width: 45,
                right: -17,
                top: 23,
                //transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
            },
            currentLocationPopUp: {
                position: 'absolute',
                height: 45,
                width: 45,
                right: -13,
                top: 23
                //transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
            },
            TextImg: {
                alignSelf: "center",
                marginTop: (height / 12) / 1.3,
                color: "white",
                fontFamily: "Helvetica",
                fontSize: 12,
                position: "absolute"
            },
            TextImgCheckin: {
                alignSelf: "center",
                marginTop: (height / 12) / 1.3,
                color: "white",
                fontFamily: "Helvetica",
                fontSize: 12,
                position: "absolute"
            },
            TextModal: {
                fontFamily: 'Helvetica',
                fontSize: 13
            },
            TextModalBtn: {
                fontFamily: 'Helvetica',
                fontSize: 13,
            },
            homeScreenSignInText: {
                fontFamily: 'Helvetica',
                fontSize: 13,
                marginBottom: 15
            },
            NumberInput: {
                textAlignVertical: "top",
                color: "gray",
                width: 40,
                flexWrap: "wrap",
                alignSelf: "center",
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: "center",
                height: 40,
                fontSize: 18,
                fontFamily: "Helvetica",
            },

            //editProfile

            textInputs: {
                alignItems: "center",
                textAlign: isRTL ? "right" : "left",
                color: "black",
                flexDirection: "row",
                height: 50,
                justifyContent: "center",


            },
            textInputsPassword: {
                alignItems: "center",
                textAlign: isRTL ? "right" : "left",
                color: "black",
                flexDirection: "row",
                height: 50,
                justifyContent: "center",
                position: "absolute",

            },

            //orders
            BorderView: {
                height: 0.5,
                borderColor: "#979797",
                width: "100%",
                borderWidth: 0.5
            },
       

            text: {
                fontFamily: "Helvetica",
                fontSize: 14,
                color: "#4A4A4A",
                justifyContent: "center",
                marginBottom: 10,
                marginTop: 10,
                textAlign: 'center',
                fontWeight: 'bold',
               
            
            },

            textlabelexc: {
                fontFamily: "Helvetica",
                fontSize: 16,
                color: "#4A4A4A",
                justifyContent: "center",
                
                textAlign: 'center',
                fontWeight: 'bold',
    
            },

            textnewhead: {
                fontFamily: "Helvetica",
                fontSize: 18,
                color: "#4A4A4A",
                justifyContent: "center",
                marginBottom: 10,
                marginTop: 10,
                textAlign: 'center',
                fontWeight: 'bold',
                textTransform : "uppercase",
               borderRadius: 5,
               borderWidth: 1.0,
                padding : 5,
                textAlign: 'center',
             },




            MainContainer: { 
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
             
              },

              
            textexc: {
                fontFamily: "Helvetica",
                fontSize: 14,
                color: "#4A4A4A",
                fontWeight: 'bold',              
            
            },

            
            
            textheader: {
                fontFamily: "Helvetica",
                fontSize: 18,
                textAlign: 'center',
                color: "#4A4A4A",
                justifyContent: "center",
                marginBottom: 4,
                marginTop: 5,
                fontWeight: 'bold',
                textTransform : "uppercase",
            },


            
            textnew: {
                textAlign: 'center', // <-- the magic
                fontFamily: 'Helvetica',
                fontSize: 18,
                textTransform : "uppercase",
                marginTop: 8,
                marginBottom: 8,
                width: 400,
                padding: 5,
                color: 'white',
                backgroundColor: '#004C6C',
            },

           
            //Bar location all
            ImgBackgroundBarAll: {

                resizeMode: "contain",
                height: 125,
                marginRight: 10, marginLeft: 10, marginTop: 8,
                borderRadius: 15,
                overflow: "hidden",

            },
            sizeTextInput: {
                fontFamily: "Helvetica",
                fontSize: 14,
            },
            selectedKM: {
                borderWidth: 1, borderColor: "#004C6C", height: 45, width: 54, backgroundColor: "#004C6C"
            },
            unSelectedKm: {
                borderWidth: 1, borderColor: "#004C6C", height: 45, width: 54
            },
            textUnselected: {
                color: "#004C6C",
                fontSize: 13,
            },
            textSelected: {
                color: "white",
                fontSize: 13,
            },

            //menu
            searchImg: {
                resizeMode: "contain",
                width: 15,
                height: 15,
                marginLeft: 15,
                alignSelf: "center"
            },
            imageItem: {
                resizeMode: "contain",
                width: 150,
                height: 200
            },
            ViewImage: {
                justifyContent: "center",
                alignItems: "center"
            }, ViewCriteria: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
                marginLeft: 15,
                marginRight: 15,
                height: 45,
                alignItems: "center"
            }, ImgViewCriteria: {

                resizeMode: "contain",
                width: 10,
                height: 10,
                marginLeft: 8,
                marginRight: 8
            },
            TouchableCriteria: {
                justifyContent: "center",
                height: 45,
                width: "100%"
            },
            TextCriteria: {
                fontFamily: "Helvetica",
                color: "#4A4A4A",
                fontSize: 13
            },
            BorderViewItem: {
                height: 0.5,
                borderColor: "#979797",
                width: "100%",
                marginLeft: 15,
                borderWidth: 0.5
            },



            //
            chatInviteButton: {
                backgroundColor: "#ff0000",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%"
            },
            // renderComposerTextInput: {
            //     paddingTop: 5,
            //     paddingBottom: 5,
            //     width: "80%",
            //     marginTop: 5,
            //     marginBottom: 5,
            //     marginLeft: 8,
            //     backgroundColor: "white",
            //     borderRadius: 10,
            //     fontSize: 15
            // },
            modalFirstView: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                flex: 1,
                flexDirection: 'column',
                justifyContent: "center",
                alignItems: "center"
            },

            homeModalView: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: "center",
                alignItems: "center"
            },
            barModalView: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: "center",
                alignItems: "center",
                width: "80%"
            },
            homeModal: {
                marginTop: "10%",
                backgroundColor: "white",
                width: "81%",
                height: "29.5%",
                borderRadius: 10,
            },
            modal: {
                margin: 0, // This is the important style you need to set
                alignItems: undefined,
                justifyContent: undefined,
            },
            modalSecondView: {
                marginTop: "10%",
                backgroundColor: "white",
                width: "80%",
                height: "36.4%",
                borderRadius: 10,
            },
            modalSecondDetailsView: {
                marginTop: "10%",
                backgroundColor: "white",
                width: "80%",
                height: "40%",
                borderRadius: 10,
            },
            modalLogin: {
                marginTop: "10%",
                backgroundColor: "white",
                width: "80%",
                height: "10%",
                borderRadius: 10,
            },
            numberModal: {
                marginTop: "10%",
                backgroundColor: "white",
                width: "90%",
                height: "50%",
                borderRadius: 10,
            },
            modalCloseButton: {
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "flex-end",
                width: 35,
                height: 35
            },
            modalImage: {
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                width: 110,
                height: 110,
                borderRadius: 55,
            },
            modalCenterText: {
                marginTop: 15,
                marginBottom: 15,
                width: "70%",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center"
            },
            CenterText: {
                //marginTop: 15,
                //marginBottom: 15,
                width: "50%",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center"
            },
            padCenterText: {
                //marginTop: 15,
                marginBottom: 15,
                width: "50%",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center"
            },
            modalInviteButton: {
                marginTop: 20,
                width: "100%",
                height: 35,
                backgroundColor: "#9ab7ff",
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center"
            },
            container: {
                //flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between'

            },
            button: {
                backgroundColor: 'white',
                width: '50%',
                height: 30
                //paddingHorizontal:20,
            },
            textStyle: {
                fontSize: 20,
                color: '#000000',
                textAlign: 'center'
            },
            buttonStyle: {
                padding: 5,
                backgroundColor: 'white',
                borderRadius: 5,
                width: '50%',
                top: -10
            },
            indicator: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 80
            },
            QuickMenuButton: {
                marginTop: 10,
                padding: 14,
                backgroundColor: '#386aa6',
                borderRadius: 10,
                width: '97%',
                marginLeft: 8,
                borderWidth: 10,
                borderRadius: 20,
                borderColor: '#f7f9fc',
                overflow: "hidden",
                //position:"absolute",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 5.8,

            },
            QuickBtnTextStyle: {
                fontSize: 25,
                color: 'white',
                textAlign: 'center'
            },
        })
            ;
    }
}
