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
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay';

import localeStrings from '../../res/strings/LocaleStrings';
import {GlobalVariables} from '../GlobalVariables';
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
      selectedAddress: null,
      enterActivity: true,
      keyboardOpened: false,
    };
  }

  componentDidMount() {
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
      ? addresses.map((a) => ({id: a.id, text: a.deliveryAddress}))
      : [];
  }

  _onNextButtonClick() {
    if (this._isValidAddress()) {
      const {addresses} = GlobalVariables;
      const {newAddress, selectedAddress} = this.state;
      let address = newAddress;
      if (selectedAddress !== null) {
        const choosen = addresses.find((a) => a.id === selectedAddress);
        if (choosen) address = choosen.text;
      }
      this._confirmAlert(address);
    } else {
      this._inValidAlert();
    }
  }

  _isValidAddress() {
    const {addresses} = GlobalVariables;
    const {newAddress, selectedAddress} = this.state;
    const wasChoosen = addresses.some((a) => a.id === selectedAddress);
    const validAddress = newAddress.trim().length > 0;
    return wasChoosen || (selectedAddress === null && validAddress);
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
    const {newAddress, selectedAddress} = this.state;
    if (selectedAddress !== null) {
      GlobalVariables.selectedAddressId = selectedAddress;
      this._gotoPaymentScreen();
    } else {
      this._saveAddress(newAddress);
    }
  }

  _saveAddress(address) {
    this.setState({enterActivity: true});
    const {_URL, userId} = GlobalVariables;
    const url = `${_URL}/customers/${userId.value}/AddDeliveryAddress`;
    const body = JSON.stringify(address);
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
        console.log(result);
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
                            <Text style={addressTitleStyle}>
                              {`Address ${idx + 1}`}
                            </Text>
                            <Text style={addressTextStyle}>{address.text}</Text>
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
                      <KeyboardAvoidingView>
                        <View style={textInputWrapStyle}>
                          <TextInput
                            style={textInputStyle}
                            numberOfLines={4}
                            onChangeText={(newAddress) =>
                              this.setState({newAddress})
                            }
                            value={this.state.newAddress}></TextInput>
                        </View>
                      </KeyboardAvoidingView>
                    </View>
                  </View>
                </View>
                <View></View>
              </View>
            </View>
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
