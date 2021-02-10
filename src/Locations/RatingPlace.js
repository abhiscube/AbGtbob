import React from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Easing,
    ActivityIndicator,
    Dimensions,
    Alert,
    ImageBackground,
    I18nManager,
    KeyboardAvoidingView,
    Keyboard
} from "react-native";
import Rating from 'react-native-rating'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { GlobalVariables } from "../GlobalVariables";
import Spinner from 'react-native-loading-spinner-overlay';


const ratingPoint = {
    starFilled: require("../../res/images/StarLocationFull.png"),

    starUnfilled: require("../../res/images/StarLocationEmpty.png")
};
const { width } = Dimensions.get('window');

let TextInputWidth = width * 0.84;
let TextInputHeight = TextInputWidth - TextInputWidth * 0.6;
import StyleSheetFactory from "../../res/styles/LocaleStyles";

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import LocaleStyles from "../../res/styles/LocaleStyles"
import DeviceInfo from "react-native-device-info";

const deviceLocale = DeviceInfo.getDeviceLocale();
export default class RatingPlace extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.ratingStrings.rateUs,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,


            },

            headerRight: (<View />),
            headerLeft: (
                <TouchableOpacity onPress={() => {
                    navigation.goBack(null);
                }}
                    style={styles.headerBackButton}>
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
            scorRating: 0,
            comments: "",
            data: [],
            toScroll: true,
            scrollMarginTop: '0%'
        }
    }

    sendFeedBack() {

        if (GlobalVariables.userId.value === "") {
            Alert.alert(
                localeStrings.ratingStrings.inOrderTo,
                "",
                [
                    {
                        text: localeStrings.ratingStrings.cancel,
                        onPress: () => console.log("Cancel Pressed"),
                        style: "destructive"
                    },
                    {
                        text: localeStrings.ratingStrings.ok,
                        onPress: () => this.props.navigation.navigate("FirstPage", { screen: "FirstPage" })
                    }
                ],

                { cancelable: false }
            );
        } else {
            if (this.state.scorRating === 0) {
                Alert.alert(
                    localeStrings.ratingStrings.youDidNot,
                    "",
                    [

                        {
                            text: localeStrings.ratingStrings.ok, onPress: () => console.log("Ok"),
                        }
                    ],

                    { cancelable: false }
                );
            } else {



                let feedBackInfo = {
                    "UserId": Number(GlobalVariables.userId.value),
                    "VendorId": Number(this.params.items.barId),
                    "RatingStars": Number(this.state.scorRating),
                    "Review": this.state.comments,

                };

                try {
                    fetch(GlobalVariables._URL + "/ratings", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },

                        body:
                            JSON.stringify(feedBackInfo)

                    })
                        .then(response => response.json())
                        .then(response => {

                            if (response) {
                                this.feedBackSend()
                            }

                        })
                        .catch(error => {
                            console.log(error)


                        });
                } catch (e) {
                    console.log(e)

                }
            }
        }
    }


    feedBackSend() {
        Alert.alert(
            localeStrings.ratingStrings.thankYou,
            localeStrings.ratingStrings.yourRatingWasSent,
            [
                {
                    text: localeStrings.ratingStrings.ok,
                    onPress: () => console.log("Send")
                },
            ],

            { cancelable: false }
        );
        this.setState({
            comments: "",
        });


        this.ratingView()
    }
    ratingView() {
        this.setState({ enterActivity: true });
        try {
            fetch(GlobalVariables._URL + "/ratings/allratings/" + this.params.items.barId, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
            })

                .then(response => response.json())
                .then(response => {


                    this.setState({
                        data: response,
                        enterActivity: false
                    })

                })
                .catch(error => {
                    this.setState({ enterActivity: false });
                    console.log("upload errorCatch", error);

                });
        } catch (e) {
            this.setState({ enterActivity: false });
            console.log("upload catch error", e);

        }
    }
    componentDidMount() {
        this.ratingView();
        let that = this;
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            that.setState({ toScroll: true, scrollMarginTop: -e.endCoordinates.height + 20 });
        });
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            that.setState({ toScroll: false, scrollMarginTop: '0%' });
        });
    }

    generateStar(noStar) {

        let images = [];
        const FilledStars = () => {
            return (


                <View style={{ marginLeft: 1.2, marginRight: 1.2, marginTop: 2 }}>



                    <Image source={require("../../res/images/StarLocationFull.png")} style={{
                        width: 15,
                        height: 15,
                    }} />

                </View>

            )

        };




        for (let i = 0; i < noStar; i++) {
            images.push(
                <View style={{ flexDirection: "row" }} key={i}>
                    <FilledStars />
                </View>
            );

        }
        return images;
    }
    render() {

        const { navigate } = this.props.navigation;
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <ScrollView contentContainerStyle={{ marginBottom: 10 }} scrollEnabled={this.state.toScroll} style={{ width: "100%", height: "100%" }} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled">

                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: this.state.scrollMarginTop
                    }}>
                        <ImageBackground style={{ width: width, height: 150, resizeMode: "contain" }}
                            source={this.params.images} />
                        <Text style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 15,
                            marginTop: 15
                        }}><Text>{localeStrings.ratingStrings.welcomeToOur} {this.params.items.barName}</Text></Text>
                        <Text style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 15
                        }}> {localeStrings.ratingStrings.ifYouEnjoy} </Text>

                        <View style={{
                            flexDirection: "column",
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%"
                        }}>
                            <Rating
                                onChange={rating => this.setState({ scorRating: rating })}
                                selectedStar={ratingPoint.starFilled}
                                unselectedStar={ratingPoint.starUnfilled}
                                config={{
                                    easing: Easing.inOut(Easing.ease),
                                    duration: 350,
                                }}
                                stagger={80}
                                maxScale={1.4}
                                starStyle={{
                                    width: 32,
                                    height: 35,
                                    marginLeft: 5,
                                    marginRight: 5,
                                    resizeMode: "center",
                                    marginTop: 15

                                }}
                            />

                            <Text style={{
                                fontFamily: "Helvetica-Bold",
                                marginTop: 10,
                                fontSize: 15
                            }}> {localeStrings.ratingStrings.addReview} </Text>
                            <View style={{
                                height: 100,
                                backgroundColor: "#F1F1F1",
                                flex: 1,
                                marginRight: 20,
                                marginLeft: 20
                            }}>
                                <KeyboardAvoidingView>
                                    <TextInput editable={true} multiline={true}
                                        style={{
                                            justifyContent: "center",
                                            textAlignVertical: "top",
                                            margin: 5,
                                            height: 80,
                                            width: 250,
                                            textAlign: I18nManager.isRTL ? "right" : "left"
                                        }}
                                        onChangeText={(text) => {
                                            this.setState({ comments: text })
                                        }
                                        }
                                        value={this.state.comments}

                                    />
                                </KeyboardAvoidingView>

                            </View>

                            <TouchableOpacity
                                onPress={() => this.sendFeedBack()}
                                style={{
                                    backgroundColor: "#26466c",
                                    width: 120,
                                    marginTop: 10,
                                    height: 45,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    alignContent: "center"
                                }}>
                                <Text style={{
                                    color: "white",
                                    fontSize: 17,
                                    alignSelf: "center",
                                    justifyContent: "center"
                                }}>{localeStrings.ratingStrings.send}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, marginTop: 15, marginBottom: 5, width: "100%" }}>

                            {this.state.data.map((items, index) => (

                                <View key={index} style={{
                                    borderBottomWidth: 1,
                                    borderColor: "black",
                                    marginLeft: 15,
                                    marginRight: 15,
                                    marginTop: 10
                                }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "flex-start"
                                        }}>

                                        <Text
                                            style={{ fontFamily: "Helvetica", fontSize: 16 }}>{items.userName}</Text>

                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                                        <Text style={{
                                            marginRight: 8,
                                            fontFamily: "Helvetica",
                                            fontSize: 16
                                        }}>{((items.dateInserted).split("T")[1]).split(".")[0]}</Text>
                                        <View style={{ flexDirection: "row" }}>
                                            {this.generateStar(items.ratingStars)}
                                        </View>

                                    </View>
                                    <View style={{ marginTop: 10, marginBottom: 5 }}>
                                        {deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ?
                                            <Text style={{ textAlign: "right" }}>{items.review}</Text>
                                            :
                                            <Text>{items.review}</Text>}

                                    </View>
                                </View>

                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}


