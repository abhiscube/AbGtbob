import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Picker,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay';

import localeStrings from '../../res/strings/LocaleStrings';
import {GlobalVariables} from '../GlobalVariables';
import DeviceInfo from 'react-native-device-info';
const deviceLocale = DeviceInfo.getDeviceLocale();
import {
  addressTitleStyle,
  backStyle,
  footerButtonStyle,
  footerButtonTextStyle,
  footerStyle,
  headerStyle,
  titleWrapStyle,
  optionTextStyle,
  screenStyle,
  textInputStyle,
  textInputWrapStyle,
  subTitleTextStyle,
  addressWrapStyle,
  addressContainerStyle,
  addressInputContainerStyle,
  radioStyle,
  addressInnerContainerStyle,
  radioImageStyle,
  titleTextStyle,
  addressTextStyle,
  deleteImageStyle,
  headerBackImageStyle,
} from './DeliveryAddressStyle';

let selectedRadioButton = require('../../res/images/selectedRadioButton.png');
let unselectedRadioButton = require('../../res/images/unselectedRadioButton.png');

export default class DeliveryAddress extends React.Component {
  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      newAddress: '',
      Buildingnumber:'',
      Appartment:'',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      selectedAddress: null,
      enterActivity: true,
      keyboardOpened: false,
    };
  }

  componentDidMount() {
   // console.log("Hi Ab");
   // console.log(GlobalVariables.restCurrencyCode);
    this._fetchSavedAddresses();
    this._addKeyboardListeners();
   
  }

  componentWillUnmount() {
    this._removeKeyboardListeners();
  }

  _addKeyboardListeners() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => this.setState({keyboardOpened: true}),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      (e) => this.setState({keyboardOpened: false}),
    );
  }

  _removeKeyboardListeners() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: localeStrings.deliveryAddressStrings.screenName,
      headerStyle: {
        backgroundColor: '#26466c',
      },
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={backStyle}>
          <Image
            style={headerBackImageStyle}
            source={require('../../res/images/back.png')}
          />
        </TouchableOpacity>
      ),
      headerRight: <View />,
      headerTintColor: '#fff',
      headerTitleStyle: headerStyle,
    };
  };

  

  _fetchSavedAddresses() {
    const {_URL, userId} = GlobalVariables;
    if (userId.value) {
      const url = `${_URL}/customers/${userId.value}/GetDeliveryAddresses`;
      fetch(url, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((res) => {
          GlobalVariables.addresses = this._getAddresses(res);
          console.log("Address ",GlobalVariables.addresses)
          this.setState({enterActivity: false});
        })
        .catch((error) => {
          console.log('error', error);
          this.setState({enterActivity: false});
          this._serverErrorAlert();
        });
    }
  }

  _getAddresses(addresses) {   
    return Array.isArray(addresses)
      ? addresses.map((a) => ({id: a.id,ZipCode: a.zipCode, DeliveryAddress: a.deliveryAddress, addressLine1: a.addressLine1, addressLine2: a.addressLine2, city: a.city}))
      : [];
  }


  _onNextButtonClick() {
    if (this._isValidAddress()) {
      const {addresses} = GlobalVariables;
      const {Buildingnumber,Appartment,AddressLine1,AddressLine2,City, selectedAddress} = this.state;
      let address;
      if (GlobalVariables.userLanguage.value === 'he-IL') {        
         address = 'מספר בניין/מספר בית :- '+ Buildingnumber +"\n" +'מספר דירה, :- '+ Appartment +"\n" +'קומה :- '+ AddressLine1 +"\n" +'שם הרחוב :- '+ AddressLine2 +"\n" +'שם העיר:- '+ City;    
      }else{
        address = 'Building Number :- '+ Buildingnumber +"\n" +'Appartment :- '+ Appartment +"\n" +'Floor :- '+ AddressLine1 +"\n" +'Street Name :- '+ AddressLine2 +"\n" +'City :- '+ City;
      }
      if (selectedAddress !== null) {
        const choosen = addresses.find((a) => a.id === selectedAddress);
        //if (choosen) address = choosen.text;
        if (GlobalVariables.userLanguage.value === 'he-IL') {  
          if (choosen) address = 'מספר בניין/מספר בית :- '+ choosen.ZipCode +"\n" +'מספר דירה, :- '+ choosen.DeliveryAddress +"\n" +'קומה :- '+ choosen.addressLine1 +"\n" +'שם הרחוב :- '+ choosen.addressLine2 +"\n" +'שם העיר:- '+ choosen.city;    
        }else{
          if (choosen) address = 'Building Number :- '+ choosen.ZipCode +"\n" +'Appartment :- '+ choosen.DeliveryAddress +"\n" +'Floor :- '+ choosen.addressLine1 +"\n" +'Street Name :- '+ choosen.addressLine2 +"\n" +'City :- '+ choosen.city;
        }
    }
      this._confirmAlert(address);
    } else {
      this._inValidAlert();
    }
  }

  _isValidAddress() {
    const {addresses} = GlobalVariables;
    const {Buildingnumber,Appartment,AddressLine1,AddressLine2,City,selectedAddress} = this.state;
    const wasChoosen = addresses.some((a) => a.id === selectedAddress);
    const validAddress = AddressLine1.trim().length > 0;
    const validAddress1 = AddressLine2.trim().length > 0;
    const validAddress2 = Buildingnumber.trim().length > 0;
    const validAddress3 = Appartment.trim().length > 0;
    const validAddress4 = City.trim().length > 0;
    return wasChoosen || (selectedAddress === null && validAddress && validAddress1 && validAddress2 && validAddress3 && validAddress4);
  }

  _inValidAlert() {
    Alert.alert(
      localeStrings.deliveryAddressStrings.invalidTitle,
      localeStrings.deliveryAddressStrings.invalidText,
      [
        {
          text: localeStrings.deliveryAddressStrings.ok,
          onPress: () => console.log('Ok Pressed'),
        },
      ],
      {cancelable: false},
    );
  }

  _serverErrorAlert() {
    Alert.alert(
      localeStrings.deliveryAddressStrings.serverError,
      localeStrings.deliveryAddressStrings.serverErrorText,
      [
        {
          text: localeStrings.deliveryAddressStrings.ok,
          onPress: () => console.log('Ok Pressed'),
        },
      ],
      {cancelable: false},
    );
  }

  _confirmAlert(address) {
    Alert.alert(
      localeStrings.deliveryAddressStrings.confirm,
      address,
      [
        {
          text: localeStrings.deliveryAddressStrings.textNo,
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: localeStrings.deliveryAddressStrings.textYes,
          onPress: () => this._confirmed(),
        },
      ],
      {cancelable: false},
    );
  }

  _confirmed() {
    const {selectedAddress} = this.state;
    if (selectedAddress !== null) {
      GlobalVariables.selectedAddressId = selectedAddress;
      this._gotoPaymentScreen();
    } else {
      this._saveAddress();
    }
  }

  ///Address Chnages Here To Save 04/02/2021
  _saveAddress() {
    let data = {
      ZipCode:this.state.Buildingnumber,
      DeliveryAddress:this.state.Appartment,
      AddressLine1: this.state.AddressLine1,
      AddressLine2: this.state.AddressLine2,
      City: this.state.City
  };
    const {_URL, userId} = GlobalVariables;
    const url = `${_URL}/customers/${userId.value}/AddDeliveryAddress`;
    const body = JSON.stringify(data);
    console.log("Its Address ",body);
    const headers = {
      'Content-Type': 'application/json',
    };
    const requestOptions = {
      method: 'POST',
      headers,
      body,
    };
    fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        GlobalVariables.selectedAddressId = result;
        console.log("selectedAddressId",result);
        this.setState({enterActivity: false});
        this._gotoPaymentScreen();
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({enterActivity: false});
        this._serverErrorAlert();
      });
  }

  _gotoPaymentScreen() {
    this.props.navigation.navigate('Payment', {
      ...this.params,
      screen: 'Payment',
    });
  }

  _onDelete(address) {
    this.setState({enterActivity: true});
    const {_URL, addresses} = GlobalVariables;
    const url = `${_URL}/deleteDeliveryAddress/${address.id}`;
    const requestOptions = {
      method: 'POST',
    };
    fetch(url, requestOptions)
      .then((response) => response.text())
      .then((res) => {
        console.log('Deleted', res);
        GlobalVariables.addresses = addresses.filter((a) => a.id != address.id);
        this.setState({enterActivity: false});
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({enterActivity: false});
        this._serverErrorAlert();
      });
  }

  _deleteAlert(address) {
    Alert.alert(
      localeStrings.deliveryAddressStrings.deleteMessage,
      address.text,
      [
        {
          text: localeStrings.deliveryAddressStrings.textNo,
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: localeStrings.deliveryAddressStrings.textYes,
          onPress: () => this._onDelete(address),
        },
      ],
      {cancelable: false},
    );
  }

  render() {
    return (
      <View style={screenStyle}>
        <Spinner color="#000" visible={this.state.enterActivity} />
        <ScrollView
          style={{width: '100%', height: '100%'}}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              flex: 1,
              marginBottom: 10,
            }}>
            <View style={{flex: 1}}>
              <View style={titleWrapStyle}>
                <Text style={titleTextStyle}>
                  {GlobalVariables.addresses.length
                    ? localeStrings.deliveryAddressStrings.chooseOption
                    : localeStrings.deliveryAddressStrings.addMethod}
                </Text>
              </View>
              <View>
                {GlobalVariables.addresses.length ? (
                  <Text style={subTitleTextStyle}>
                    {localeStrings.deliveryAddressStrings.useAgain}
                  </Text>
                ) : null}

                {!this.state.keyboardOpened &&
                  GlobalVariables.addresses.map((address, idx) => (
                    <View key={idx} style={{marginHorizontal: 8}}>
                      <View style={addressWrapStyle}>
                        <View style={addressContainerStyle}>
                          <TouchableOpacity
                            style={radioStyle}
                            onPress={() =>
                              this.setState({selectedAddress: address.id})
                            }>
                            <Image
                              style={radioImageStyle}
                              resizeMode="contain"
                              source={
                                this.state.selectedAddress === address.id
                                  ? selectedRadioButton
                                  : unselectedRadioButton
                              }
                            />
                          </TouchableOpacity>
                          <View style={addressInnerContainerStyle()}>
                          {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                            <Text style={addressTitleStyle}>
                             {localeStrings.deliveryAddressNew.AddressLabel + `-` + `${idx + 1}`}
                            </Text>
                        ):(
                          <Text style={addressTitleStyle}>
                          {localeStrings.deliveryAddressNew.AddressLabel + `-` + `${idx + 1}`}
                        </Text>
                        )}
                            <Text style={addressTextStyle}>{address.ZipCode+`/`}{address.DeliveryAddress+`/`}{address.addressLine1}</Text>
                            <Text style={addressTextStyle}>{address.addressLine2}</Text>
                            <Text style={addressTextStyle}>{address.city}</Text>
                            
                          </View>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={{flexDirection: 'row'}}
                            onPress={() => this._deleteAlert(address)}>
                            <Image
                              style={deleteImageStyle}
                              source={require('../../res/images/delete.png')}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {idx + 1 != GlobalVariables.addresses.length ? null : (
                        <Text style={optionTextStyle}>
                          {localeStrings.deliveryAddressStrings.textOr}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
                marginHorizontal: 8,
              }}>
              <View style={addressWrapStyle}>
                <View style={addressInputContainerStyle}>
                  <TouchableOpacity
                    style={radioStyle}
                    onPress={() => {
                      this.setState({selectedAddress: null});
                    }}>
                    <Image
                      style={radioImageStyle}
                      resizeMode="contain"
                      source={
                        this.state.selectedAddress === null
                          ? selectedRadioButton
                          : unselectedRadioButton
                      }
                    />
                  </TouchableOpacity>
                  <View style={addressInnerContainerStyle('88%')}>
                    <Text style={addressTitleStyle}>
                      {localeStrings.deliveryAddressStrings.addNew}
                    </Text>
                     <View>

                  <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                            <KeyboardAvoidingView>
                              <View
                                style={{
                                  height: '100%',
                                  marginTop:5,
                                  marginLeft:10,
                                  marginRight:10,
                                }}>
                        {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                                <TextInput
                                  style={{
                                    color: '#4A4A4A',
                                    padding:5,
                                    borderBottomWidth :0.5,
                                    borderLeftWidth: 0.5,
                                    borderRightWidth: 0.5,
                                    borderTopWidth: 0.5,
                                    fontFamily: 'Helvetica',
                                    fontSize: 15,
                                    alignItems: 'flex-start',
                                    textAlign:'left',
                                  }}
                                  onChangeText={(Buildingnumber) =>
                                    this.setState({Buildingnumber})
                                  }
                                
                                  value={this.state.Buildingnumber}
                                  placeholderTextColor="#4A4A4A"
                                  placeholder={localeStrings.deliveryAddressNew.Buildingnumber+(' * ')}                            
                                />
                        ):(
                          <TextInput
                          style={{
                            color: '#4A4A4A',
                            padding:5,
                            borderBottomWidth :0.5,
                            borderLeftWidth: 0.5,
                            borderRightWidth: 0.5,
                            borderTopWidth: 0.5,
                            fontFamily: 'Helvetica',
                            fontSize: 15,
                            alignItems: 'flex-start',
                            textAlign:'left',
                          }}
                          onChangeText={(Buildingnumber) =>
                            this.setState({Buildingnumber})
                          }
                        
                          value={this.state.Buildingnumber}
                          placeholderTextColor="#4A4A4A"
                          placeholder={localeStrings.deliveryAddressNew.Buildingnumber+(' * ')}                            
                        />
                        )}
                              </View>
                            </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>

                  <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                            <KeyboardAvoidingView>
                              <View
                                style={{
                                  height: '100%',
                                  marginTop:5,
                                  marginLeft:10,
                                  marginRight:10,
                                }}>
                        {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                                <TextInput
                                  style={{
                                    color: '#4A4A4A',
                                    padding:5,
                                    borderBottomWidth :0.5,
                                    borderLeftWidth: 0.5,
                                    borderRightWidth: 0.5,
                                    borderTopWidth: 0.5,
                                    fontFamily: 'Helvetica',
                                    fontSize: 15,
                                    alignItems: 'flex-start',
                                    textAlign:'left',
                                  }}
                                  onChangeText={(Appartment) =>
                                    this.setState({Appartment})
                                  }
                                
                                  value={this.state.Appartment}
                                  placeholderTextColor="#4A4A4A"
                                  placeholder={localeStrings.deliveryAddressNew.Appartment+(' * ')}                            
                                />
                        ):(
                          <TextInput
                          style={{
                            color: '#4A4A4A',
                            padding:5,
                            borderBottomWidth :0.5,
                            borderLeftWidth: 0.5,
                            borderRightWidth: 0.5,
                            borderTopWidth: 0.5,
                            fontFamily: 'Helvetica',
                            fontSize: 15,
                            alignItems: 'flex-start',
                            textAlign:'left',
                          }}
                          onChangeText={(Appartment) =>
                            this.setState({Appartment})
                          }
                        
                          value={this.state.Appartment}
                          placeholderTextColor="#4A4A4A"
                          placeholder={localeStrings.deliveryAddressNew.Appartment+(' * ')}                            
                        />
                        )}
                              </View>
                            </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>


                  <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                            <KeyboardAvoidingView>
                              <View
                                style={{
                                  height: '100%',
                                  marginTop:5,
                                  marginLeft:10,
                                  marginRight:10,
                                }}>
                        {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                                <TextInput
                                  style={{
                                    color: '#4A4A4A',
                                    padding:5,
                                    borderBottomWidth :0.5,
                                    borderLeftWidth: 0.5,
                                    borderRightWidth: 0.5,
                                    borderTopWidth: 0.5,
                                    fontFamily: 'Helvetica',
                                    fontSize: 15,
                                    alignItems: 'flex-start',
                                    textAlign:'left',
                                  }}
                                  onChangeText={(AddressLine1) =>
                                    this.setState({AddressLine1})
                                  }
                                
                                  value={this.state.AddressLine1}
                                  placeholderTextColor="#4A4A4A"
                                  placeholder={localeStrings.deliveryAddressNew.AddressLine1+(' * ')}                            
                                />
                        ):(
                          <TextInput
                          style={{
                            color: '#4A4A4A',
                            padding:5,
                            borderBottomWidth :0.5,
                            borderLeftWidth: 0.5,
                            borderRightWidth: 0.5,
                            borderTopWidth: 0.5,
                            fontFamily: 'Helvetica',
                            fontSize: 15,
                            alignItems: 'flex-start',
                            textAlign:'left',
                          }}
                          onChangeText={(AddressLine1) =>
                            this.setState({AddressLine1})
                          }
                        
                          value={this.state.AddressLine1}
                          placeholderTextColor="#4A4A4A"
                          placeholder={localeStrings.deliveryAddressNew.AddressLine1+(' * ')}                            
                        />
                        )}
                              </View>
                            </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>

                  <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                      <KeyboardAvoidingView>
                        <View
                          style={{
                            height: '100%',
                            marginTop:5,
                            marginLeft:10,
                            marginRight:10,
                          }}>
                      {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                          <TextInput
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :0.5,
                              borderLeftWidth: 0.5,
                              borderRightWidth: 0.5,
                              borderTopWidth: 0.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign:'left',
                            }}
                            onChangeText={(AddressLine2) =>
                              this.setState({AddressLine2})
                            }
                            value={this.state.AddressLine2}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.deliveryAddressNew.AddressLine2+(' * ')}                            
                          />
                          ) : (
                            <TextInput
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :0.5,
                              borderLeftWidth: 0.5,
                              borderRightWidth: 0.5,
                              borderTopWidth: 0.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign:'left',
                            }}
                            onChangeText={(AddressLine2) =>
                              this.setState({AddressLine2})
                            }
                            value={this.state.AddressLine2}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.deliveryAddressNew.AddressLine2+(' * ')}                            
                          />
                          )}
                        </View>
                      </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>


                  <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                      <KeyboardAvoidingView>
                        <View
                          style={{
                            height: '100%',
                            marginTop:5,
                            marginLeft:10,
                            marginRight:10,
                          }}>
                      {deviceLocale === 'he-IL' &&
                        GlobalVariables.userLanguage.value === 'en-US' ? (
                          <TextInput
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :0.5,
                              borderLeftWidth: 0.5,
                              borderRightWidth: 0.5,
                              borderTopWidth: 0.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign:'left',
                            }}
                            onChangeText={(City) =>
                              this.setState({City})
                            }
                            value={this.state.City}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.deliveryAddressNew.City+(' * ')}                            
                          />
                          ) : (

                            <TextInput
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :0.5,
                              borderLeftWidth: 0.5,
                              borderRightWidth: 0.5,
                              borderTopWidth: 0.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign:'left',
                            }}
                            onChangeText={(City) =>
                              this.setState({City})
                            }
                            value={this.state.City}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.deliveryAddressNew.City+(' * ')}                            
                          />

                          )}
                        </View>
                      </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>

              

                   {/* <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

                  <TouchableOpacity>
                        <KeyboardAvoidingView>
                          <View
                            style={{
                              height: '100%',
                              marginTop:5,
                              marginLeft:10,
                              marginRight:10,
                            }}>
                            <TextInput
                              style={{
                                color: '#4A4A4A',
                                padding:5,
                                borderBottomWidth :0.5,
                                borderLeftWidth: 0.5,
                                borderRightWidth: 0.5,
                                borderTopWidth: 0.5,
                                fontFamily: 'Helvetica',
                                fontSize: 15,
                                alignItems: 'flex-start',
                                textAlign:'left',
                              }}
                              onChangeText={(ZipCode) =>
                                this.setState({ZipCode})
                              }
                              value={this.state.ZipCode}
                              placeholderTextColor="#4A4A4A"
                              placeholder={localeStrings.deliveryAddressNew.ZipCode}                            
                            />
                          </View>
                        </KeyboardAvoidingView>
                  </TouchableOpacity>
                  </View>   */}



          
                      {/* <KeyboardAvoidingView>
                        <View style={textInputWrapStyle}>


                          <TextInput
                            style={textInputStyle}
                            numberOfLines={4}
                            onChangeText={(newAddress) =>
                              this.setState({newAddress})
                            }
                            value={this.state.newAddress}></TextInput>
                        </View>
                      </KeyboardAvoidingView> */}
                    </View> 
                  </View>
                </View>
                <View></View>
              </View>
            </View>

           {/* <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

            <TouchableOpacity>
                      <KeyboardAvoidingView>
                        <View
                          style={{
                            height: '100%',
                            marginTop:5,
                            marginLeft:10,
                            marginRight:10,
                          }}>
                          <TextInput
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :0.5,
                              borderLeftWidth: 0.5,
                              borderRightWidth: 0.5,
                              borderTopWidth: 0.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign:'left',
                            }}
                            onChangeText={(custname) =>
                              this.setState({custname})
                            }
                            value={this.state.custname}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.deliveryAddressNew.Name}                            
                          />
                        </View>
                      </KeyboardAvoidingView>
          </TouchableOpacity>
        </View>


        <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

              <TouchableOpacity>
                        <KeyboardAvoidingView>
                          <View
                            style={{
                              height: '100%',
                              marginTop:5,
                              marginLeft:10,
                              marginRight:10,
                            }}>
                            <TextInput
                              style={{
                                color: '#4A4A4A',
                                padding:5,
                                borderBottomWidth :0.5,
                                borderLeftWidth: 0.5,
                                borderRightWidth: 0.5,
                                borderTopWidth: 0.5,
                                fontFamily: 'Helvetica',
                                fontSize: 15,
                                alignItems: 'flex-start',
                                textAlign:'left',
                              }}
                              placeholderTextColor="#4A4A4A"
                              placeholder={localeStrings.deliveryAddressNew.ContactNo}                            
                            />
                          </View>
                        </KeyboardAvoidingView>
              </TouchableOpacity>
        </View> */}

       


          {/* <View style={{
                         marginLeft:10,
                          marginRight:10,
                        borderBottomWidth :0.5,
                        borderLeftWidth: 0.5,
                        borderRightWidth: 0.5,
                        borderTopWidth: 0.5,
                        fontFamily: 'Helvetica',
                        fontSize: 15,                         
                        textAlign:'left'
                        }}>  
                <Picker    style={{
                            color: '#4A4A4A',
                            margin:-5,
                            marginLeft:-2
                          }}
                          selectedValue={this.state.language}  
                          onValueChange={(itemValue, itemPosition) =>  
                              this.setState({language: itemValue, choosenIndex: itemPosition})} >  

                    <Picker.Item label="Java" value="java" />  
                    <Picker.Item label="JavaScript" value="js" />  
                    <Picker.Item label="React Native" value="rn" />  
                
                </Picker>  
          </View>   */}


       </View>
        </ScrollView>
        <View style={footerStyle}>
          <TouchableOpacity
            style={footerButtonStyle}
            onPress={() => this._onNextButtonClick()}>
            <Text style={footerButtonTextStyle}>
              {localeStrings.deliveryAddressStrings.btnText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
