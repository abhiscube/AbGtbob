import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  I18nManager,
  AsyncStorage,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {GlobalVariables} from '../GlobalVariables';
import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from '../../res/styles/LocaleStyles';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class OrderCompleted extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: localeStrings.orderCompletedStrings.confirmation,
      headerStyle: {
        backgroundColor: '#26466c',
        paddingTop: getStatusBarHeight(),
      },
      headerLeft: <View />,
      headerRight: <View />,
      headerTintColor: '#fff',
      headerTitleStyle: {
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 10,
        marginRight: 15,
        color: '#fefefe',
        fontFamily: 'Helvetica',
        fontSize: 17,
      },
    };
  };

  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      orderNumber: 0,
    };
  }

  componentWillMount() {
    //  this.getOrderNumber(this.params.orderNumber)
  }

  getOrderNumber(cartId) {
    try {
      fetch(GlobalVariables._URL + '/cart/' + cartId + '/order', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({orderNote: null}),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log('cart', response);
          if (response !== '') {
            this.setState({orderNumber: response});
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  render() {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <Text style={PageStyles.textUp}>
            {localeStrings.orderCompletedStrings.thankYou}
          </Text>
          <Text style={[PageStyles.textStyle, {marginTop: 10}]}>
            {localeStrings.orderCompletedStrings.youJustConfirmed}
          </Text>
          <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.ourStaff}
          </Text>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 45,
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              width: 110,
              height: 120,
              transform: [{scaleX: I18nManager.isRTL ? 1 : 1}],
            }}
            source={require('../../res/images/confirmed.png')}
          />
          <Text
            style={{fontFamily: 'Helvetica', fontSize: 21, color: '#2CA970'}}>
            {localeStrings.orderCompletedStrings.orderNumber}
            {this.params.NoOrder}
          </Text>
          <Text
            style={{fontFamily: 'Helvetica', fontSize: 21, color: '#2CA970'}}>
            {localeStrings.orderCompletedStrings.completed}
          </Text>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.receiveOrder}
          </Text>
          <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.pleaseConfirm}
          </Text>
          {/* <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.whenHeArrives}
          </Text>
          <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.pleaseOpen}{' '}
          </Text>
          <Text style={PageStyles.textStyle}>
            {localeStrings.orderCompletedStrings.soHeWill}
          </Text> */}
        </View>

        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            alignContent: 'center',
            alignSelf: 'center',
            backgroundColor: '#004C6C',
            height: 50,
            bottom: 0,
            position: 'absolute',
          }}>
          <TouchableOpacity
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              height: 65,
              width: '100%',
            }}
            onPress={() => {
              GlobalVariables.orders = [];
              GlobalVariables.totalOrders.value = 0;
              GlobalVariables.restId.value = '';
              AsyncStorage.setItem('savedOrders', '');
              AsyncStorage.getItem('role')
                .then((value) => {
                  if (value === 'waiter') {
                    this.props.navigation.navigate('HomeScreenWaiters', {
                      screen: 'HomeScreenWaiters',
                    });
                  } else {
                    this.props.navigation.navigate('HomeScreen', {
                      screen: 'HomeScreen',
                    });
                  }
                })
                .done();
            }}>
            <Text
              style={{
                color: 'white',
                alignSelf: 'center',
                justifyContent: 'center',
                fontFamily: 'Helvetica',
                fontSize: 16,
              }}>
              {localeStrings.orderCompletedStrings.completed}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const PageStyles = StyleSheet.create({
  textStyle: {
    fontFamily: 'Helvetica',
    fontSize: 13,
  },
  textUp: {
    fontFamily: 'Helvetica',
    fontSize: 17,
  },
});
