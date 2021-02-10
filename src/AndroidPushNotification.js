import React, { Component } from 'react'
import { PushNotificationIOS,Platform,Alert,AsyncStorage} from 'react-native';
import {GlobalVariables} from "./GlobalVariables";
import DeviceInfo from 'react-native-device-info';
import firebase  from '../src/firebase.js';

export default class AndroidPushNotificationHandler extends Component {

    constructor(props) {
        super(props);

        this.state = {
            token: null,
        };}

    callApi(value,token){
        let OBJ={
            UserId:value,
            DeviceToken:token,
            DeviceType:Platform.OS
        }
        //alert(JSON.stringify(OBJ))
        let uri = GlobalVariables._URL + "/core/updatedevicetoken";
        try {

            fetch(uri, {
                method: "POST",
                headers: {
                    //'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(OBJ)

            })

                .then(response => response.json())
                .then(response => {

                    console.log("true");
                    console.log('Token was:' +token);
                })
                .catch(error => {
                    console.error(error)
                });
        } catch (e) {

            console.error("upload catch error", e);


        }
    }

    componentWillMount(){

        AsyncStorage.getItem('UserLogged').then((value) => {

            if (value !== "") {
                if (value === "true") {
                    AsyncStorage.getItem('userId').then((userId) => {

                        if (userId !== null && userId !== "") {
                            firebase.messaging().getToken().then((token) => {
                                this.callApi(userId,token);
                                console.log('tok- ' + token);
                            });
                        }

                    }).done();


                }
            }
        }).done();
    }
    componentDidMount() {
        let tokenX = '';
        firebase.messaging().getToken().then((token) => {
            console.log('tok- ' + token);
        });
        console.log('deepak' + tokenX);
    }

    render() {
        return null
    }
}

