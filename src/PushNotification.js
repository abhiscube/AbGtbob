import React, { Component } from 'react'
import { PushNotificationIOS,Platform,Alert,AsyncStorage} from 'react-native'
import {GlobalVariables} from "./GlobalVariables";
 
 export default class PushNotificationHandler extends Component {

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
  let uri = GlobalVariables._URL +  "/core/updatedevicetoken"
                       try {
                    
                        fetch(uri, {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(OBJ)
                    
                        })
                            
                           .then(response => response.json())
                            .then(response => {
                           
                           console.log("true")
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

                  
                    PushNotificationIOS.addEventListener('register', token => {
                     
                     
                      AsyncStorage.getItem('role').then((value) => {
                       
                    //    if (value !== null) {
            
                          this.callApi(userId,token)
                           
                      //  } 
                    }).done();
                      
                 
                     
                  
                    
                      })
                      PushNotificationIOS.addEventListener('registrationError', registrationError => {
                        console.log(registrationError, '--')
                      })
                      PushNotificationIOS.addEventListener('notification', function(notification) {
                        if (!notification) {
                          return
                        }
                        // openApp
                        const data = notification.getData()
                        console.log(data)
                      })
                      PushNotificationIOS.getInitialNotification().then(notification => {
                        if (!notification) {
                          return
                        }
                        //close App
                        const data = notification.getData()
                    
                    //   if(data.type === "2"){
                    //     if(data.url !=="" && data.url !==null)
                    //     {
                    //       const navigateFull = this.props.navigation;
                    //       navigateFull.navigate("webViewRestaurant",{screen:"webViewRestaurant",itemsRestaurant:data.url})
                    //      }
                    //     PushNotificationIOS.setApplicationIconBadgeNumber(0)
                      
                    //  }
                     PushNotificationIOS.setApplicationIconBadgeNumber(0)
                    
                    
                      })
                     
                  }
                
              }).done();
             

          }
      } 
  }).done();
}
componentDidMount() {
  PushNotificationIOS.requestPermissions()
  }

  render() {
    return null
  }
 }

