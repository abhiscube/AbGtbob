import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  TextInput,
  Keyboard,
  Alert,
  Platform,
  ActivityIndicator,
  I18nManager,
  AsyncStorage,
  BackHandler,
} from 'react-native';
import {GlobalVariables} from '../GlobalVariables';
import Modal from 'react-native-modal';
import moment from 'moment';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import session from '../session';
import haversine from 'haversine';
const {width, height} = Dimensions.get('window');
import {Linking} from 'react-native';
let widthView = width;
let field1, field2, field3, field4;
let field_n1, field_n2, field_n3, field_n4;
let DataItem = {},
  images = [];

import StyleSheetFactory from '../../res/styles/LocaleStyles';
import Geolocation from '@react-native-community/geolocation';
import GPSState from 'react-native-gps-state';
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import DeviceInfo from 'react-native-device-info';
import {withNavigationFocus} from 'react-navigation';
import email from 'react-native-email';
import call from 'react-native-phone-call';

import Spinner from 'react-native-loading-spinner-overlay';
const deviceLocale = DeviceInfo.getDeviceLocale();
//"navigation.state.params.barName"
class BarLocation extends React.Component {
  _enableGPS(fnCallback) {
    //Get the current GPS state
    GPSState.getStatus().then((status) => {
      switch (status) {
        case GPSState.NOT_DETERMINED:
          //alert('Please, allow the location, for us to do amazing things for you!')
          break;

        case GPSState.RESTRICTED:
          GPSState.openLocationSettings();
          break;

        case GPSState.DENIED:
          //alert('It`s a shame that you do not allowed us to use location :(')
          break;

        case GPSState.AUTHORIZED_ALWAYS:
        case GPSState.AUTHORIZED_WHENINUSE:
          if (fnCallback) {
            fnCallback();
          }
          break;
      }
    });
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.state.params.barName,
      headerStyle: {
        backgroundColor: '#26466c',
        borderBottomWidth: 0,
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerRight: <View />,
      headerLeft: (
        <TouchableOpacity
          onPress={navigation.getParam('handleBackButton')}
          style={styles.headerBackButton}>
          <Image
            style={{
              resizeMode: 'contain',
              width: 15,
              height: 15,
              transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
            }}
            source={require('../../res/images/back.png')}
          />
        </TouchableOpacity>
      ),
      headerTintColor: '#fff',
      headerTitleStyle: {
        textAlign: 'center',
        flex: 1,
        alignSelf: 'center',
        color: 'white',
        fontSize: 19,
        fontFamily: 'Helvetica',
      },
    };
  };

  constructor(props) {
    super(props);

    this.params = this.props.navigation.state.params;

    this.state = {
      txt1: '',
      txt2: '',
      txt3: '',
      txt4: '',
      barData: DataItem,
      numberStars: 0,
      workingHours: [],
      IsModalVisible: false,
      IsMenuModalVisible: false,
      IsCheckinModalVisible: false,
      IsModalVisibleTable: false,
      IsModalVisibleConfirmed: false,
      IsModalVisibleTableNumber: false,
      enterActivity: false,
      checkText: localeStrings.barLocationStrings.checkIn,
      distanceTravelled: 0,
      prevLatLng: {},
      showAlert: true,
      CouponsBar: [],
      coupons: [],
    };
  }

  _handleBackButton = () => {
    const {isFocused, navigation} = this.props;
    if (isFocused) {
      const {orders, isDeliveryAndTA, isSelectedLocation} = GlobalVariables;
      const showAlert =
        isDeliveryAndTA() &&
        orders.length > 0 &&
        isSelectedLocation(this.params.barId);
      if (showAlert) {
        this._showExitLocationAlert();
      } else {
        this._gotoLocationsScreen();
      }
    } else {
      navigation.goBack(null);
    }
    return true;
  };

  _gotoLocationsScreen() {
    const {resetSelectedLocation} = GlobalVariables;
    const {navigation} = this.props;
    resetSelectedLocation();
    this._enableGPS(() => navigation.goBack(null));
  }

  _showExitLocationAlert() {
    Alert.alert(
      localeStrings.barLocationStrings.exitLocationTitle,
      localeStrings.barLocationStrings.exitLocationMessage,
      [
        {
          text: localeStrings.barLocationStrings.cancel,
          onPress: () => console.log('_showExitLocationAlert: Cancel Pressed'),
          style: 'destructive',
        },
        {
          text: localeStrings.barLocationStrings.ok,
          onPress: () => {
            GlobalVariables.orders = [];
            this._gotoLocationsScreen();
          },
        },
      ],
      {cancelable: false},
    );
  }

  goToLogin() {
    this.params = this.props.navigation.state.params;
    const {navigate} = this.props.navigation;
    navigate('FirstPage', {screen: 'FirstPage', id: this.params.barId});
  }

  UNSAFE_componentWillMount() {
    // this.setState({enterActivity: true});
  }

  UNSAFE_componentWillReceiveProps(prevProps) {
    console.log('props', this.params.barId);
  }

  componentDidMount() {
    this.setState({enterActivity: true});
    this.getCurrentLocation(this.props.navigation.state.params.barId);
    this.showCheckIn();
    this.props.navigation.addListener('didFocus', (payload) => {
      this.params = this.props.navigation.state.params;
      this.getCurrentLocation(this.params.barId);
      this.getCoupons(this.params.barId);
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._handleBackButton,
    );
    this.props.navigation.setParams({handleBackButton: this._handleBackButton});
  }

  componentDidUpdate(prevProps) {
    this.params = this.props.navigation.state.params;
    if (prevProps.isFocused !== this.props.isFocused) {
      if (this.props.isFocused) {
        this.getCurrentLocation(this.params.barId);
        this.getCoupons(this.params.barId);
      }
    }
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  showCheckIn() {
    AsyncStorage.getItem('checkIn')
      .then((value) => {
        if (value === 'true') {
          this.setState({isCheckIn: true});
          AsyncStorage.getItem('restCurrCode')
            .then((value) => {
              GlobalVariables.restCurrencyCode.value = value;
            })
            .done();
        } else {
          this.setState({isCheckIn: false});
        }
      })
      .done();
  }

  getCurrentLocation(barId) {
    Geolocation.getCurrentPosition(
      (position) => {
        this.getBarLocations(
          barId,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => this.getCurrentLocation(barId),
    );
  }

  getOfferCouponBar(id) {
    try {
      fetch(GlobalVariables._URL + '/cart-rules/random/' + id, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response !== '') {
            this.setState({
              CouponsBar: response,
            });
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  getCoupons(id) {
    try {
      fetch(GlobalVariables._URL + '/cart-rules/allrandom/' + id, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response !== '') {
            this.setState({
              coupons: response,
            });
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  getBarLocations(idBar, lat, long) {
    try {
      fetch(
        GlobalVariables._URL +
          '/vendors/' +
          idBar +
          '/' +
          GlobalVariables.userLanguage.value +
          '/' +
          lat +
          '/' +
          long,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
        },
      )
        .then((response) => response.json())
        .then((response) => {
          if (GlobalVariables.userLanguage.value === 'he-IL') {
            AsyncStorage.setItem('restCurrCode', response.c.s);
            GlobalVariables.restCurrencyCode.value = response.c.s;
          } else {
            AsyncStorage.setItem('restCurrCode', response.c.c);
            GlobalVariables.restCurrencyCode.value = response.c.c;
          }
          if (response !== '') {
            let curr_distance = Number(response.dst.replace(',', ''));
            DataItem = {};
            // if (response.i !== null && response.n !== null && response.a !== null && response.t !== null && response.ra !== null && response.re !== null
            //     && response.d !== null && response.w !== null && response.p !== null && response.s !== null) {
            GlobalVariables.restCurrencyCode.value = response.c.c;
            DataItem = {
              id: response.i,
              name: response.n,
              address: response.a,
              image: {uri: GlobalVariables._URL + '/' + response.t},
              noStars: response.ra,
              noRecenzii: response.re,
              phone: response.p,
              website: response.s,
              description: response.d,
              distance: curr_distance,
            };

            let WorkingHours = JSON.parse(response.w);

            let hourItem = {
              Sunday:
                localeStrings.barLocationStrings.open +
                WorkingHours[0].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[0].close,
              Monday:
                localeStrings.barLocationStrings.open +
                WorkingHours[1].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[1].close,
              Tuesday:
                localeStrings.barLocationStrings.open +
                WorkingHours[2].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[2].close,
              Wednesday:
                localeStrings.barLocationStrings.open +
                WorkingHours[3].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[3].close,
              Thursday:
                localeStrings.barLocationStrings.open +
                WorkingHours[4].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[4].close,
              Friday:
                localeStrings.barLocationStrings.open +
                WorkingHours[5].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[5].close,
              Saturday:
                localeStrings.barLocationStrings.open +
                WorkingHours[6].open +
                ' - ' +
                localeStrings.barLocationStrings.close +
                WorkingHours[6].close,
            };

            this.setState({
              numberStars: response.ra,
              barData: DataItem,
              workingHours: hourItem,
              distance: curr_distance,
            });
            this.setState({enterActivity: false});
            // }
          }
        })
        .catch((error) => {
          this.setState({enterActivity: false});
          console.log('upload error', error);
        });
    } catch (e) {
      this.setState({enterActivity: false});
      console.error('upload catch error', e);
    }
    this.setState({
      NameBar: this.params.barName,
    });
  }

  generateStar() {
    images = [];
    const FilledStars = () => {
      return (
        <View style={{marginLeft: 1.2, marginRight: 1.2}}>
          <Image
            source={require('../../res/images/StarLocationFull.png')}
            style={{
              width: 13,
              height: 13,
            }}
          />
        </View>
      );
    };

    const UnfilledStars = () => {
      return (
        <View style={{marginLeft: 1.2, marginRight: 1.2}}>
          <Image
            source={require('../../res/images/StarLocationEmpty.png')}
            style={{
              width: 13,
              height: 13,
            }}
          />
        </View>
      );
    };

    if (this.state.numberStars === 1) {
      images = [];
      images.push(
        <View style={{flexDirection: 'row'}}>
          <FilledStars />
        </View>,
      );
      for (let i = 0; i < 4; i++) {
        images.push(
          <View style={{flexDirection: 'row'}} key={i}>
            <UnfilledStars />
          </View>,
        );
      }
    } else {
      for (let i = 0; i < this.state.numberStars; i++) {
        images.push(
          <View style={{flexDirection: 'row'}} key={i}>
            <FilledStars />
          </View>,
        );
      }

      if (5 - this.state.numberStars !== 0) {
        for (let i = 0; i < 5 - this.state.numberStars; i++) {
          images.push(
            <View style={{flexDirection: 'row'}} key={i}>
              <UnfilledStars />
            </View>,
          );
        }
      }
    }

    return images;
  }

  checkOut() {
    this.setState({showAlert: false});
    Geolocation.clearWatch(this.watchID);
    alert(localeStrings.barLocationStrings.youMovedToFar);

    try {
      fetch(
        GlobalVariables._URL +
          '/checkin/checkout/' +
          GlobalVariables.userId.value,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
        .then((response) => response.json())
        .then((response) => {
          AsyncStorage.setItem('checkIn', 'false');
          AsyncStorage.setItem('savedBarId', '');
          AsyncStorage.setItem('savedBarName', '');
          AsyncStorage.setItem('tableNumber', '');
          GlobalVariables.restId.value = '';
          this.setState({
            checkText: localeStrings.barLocationStrings.checkIn,
          });
        })
        .catch((error) => {});
    } catch (e) {}
  }

  manualCheckOut() {
    try {
      fetch(
        GlobalVariables._URL +
          '/checkin/checkout/' +
          GlobalVariables.userId.value,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
        .then((response) => response.json())
        .then((response) => {
          GlobalVariables.restId.value = '';
          AsyncStorage.setItem('checkIn', 'false');
          AsyncStorage.setItem('savedBarId', '');
          AsyncStorage.setItem('savedBarName', '');
          AsyncStorage.setItem('tableNumber', '');
          alert(localeStrings.barLocationStrings.youHaveSuccessfully);
          this.setState({
            checkText: localeStrings.barLocationStrings.checkIn,
          });
        })
        .catch((error) => {});
    } catch (e) {}
  }

  getPeopleChekIn() {
    try {
      fetch(
        GlobalVariables._URL +
          '/vendors/' +
          this.params.barId +
          '/' +
          GlobalVariables.userLanguage.value,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
        },
      )
        .then((response) => response.json())
        .then((response) => {
          if (response.uc > 0) {
            this.props.navigation.navigate('PeopleCheckIn', {
              screen: 'PeopleCheckIn',
              person: response.u,
            });
          } else {
            alert(localeStrings.barLocationStrings.noPeopleCheckIn);
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  callBar() {
    if (this.state.barData.phone !== '') {
      //Linking.openURL(`tel:${this.state.barData.phone}`)
      const args = {
        number: this.state.barData.phone,
        prompt: false,
      };
      call(args).catch(console.error);
    } else alert('No number phone');
  }
  emailBar() {
    const to = ['foo@bar.com']; // string or array of email addresses
    email(to, {
      // Optional additional arguments
      //cc: ['bazzy@moo.com', 'doooo@daaa.com'], // string or array of email addresses
      //bcc: 'mee@mee.com', // string or array of email addresses
      subject: 'Show how to use',
      body: 'Some body right here',
    }).catch(console.error);
  }

  _isTAandDeliveryValid() {
    const {selectedOrderType, ORDER_TYPE} = GlobalVariables;
    return (
      session.value === 'true' &&
      (selectedOrderType === ORDER_TYPE.TAKE_AWAY ||
        selectedOrderType === ORDER_TYPE.DELIVERY)
    );
  }

  // _onMenuButtonClick() {
  //   const {barId} = this.params;
  //   const {barData} = this.state;
  //   const {isDeliveryAndTA, restId, isValidLocation} = GlobalVariables;
  //   const isSameCheckedInLocation =
  //     restId.value.toString() === barId.toString();
  //   const inRange = isValidLocation(barData.distance);
  //   const isSignedIn = session.value === 'true';
  //   if (isSignedIn) {
  //     if (isDeliveryAndTA()) {
  //       this._gotoMenu();
  //     } else {
  //       if (inRange) {
  //         AsyncStorage.getItem('checkIn').then((checkIn) => {
  //           if (checkIn === 'true' && isSameCheckedInLocation) {
  //             this._gotoMenu();
  //           } else {
  //             this.setState({IsModalVisible: true});
  //           }
  //         });
  //       } else {
  //         this._showTooFarAlert();
  //       }
  //     }
  //   } else {
  //     this._showSignInAlert();
  //   }
  // }

  _gotoMenu() {
    const {navigate} = this.props.navigation;
    GlobalVariables.restCurrencyCode.value = this.params.restCurrencyCode;
    navigate('MenuSlider', {
      screen: 'MenuSlider',
      barId: this.params.barId,
      nameBar: this.params.barName,
      tableNumber: GlobalVariables.tableNumber.value,
      showWelcome: false,
      restCurrencyCode: this.params.restCurrencyCode,
    });
  }

  _showTooFarAlert() {
    Alert.alert(
      localeStrings.barLocationStrings.youAreTooFar,
      '',
      [
        {
          text: localeStrings.barLocationStrings.cancel,
          onPress: () => console.log('Cancel Pressed'),
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  }

  _showSignInAlert() {
    Alert.alert(
      localeStrings.barLocationStrings.toContinue,
      '',
      [
        {
          text: localeStrings.barLocationStrings.cancel,
          onPress: () => console.log('_showSignInAlert: Cancel Pressed'),
          style: 'destructive',
        },
        {
          text: localeStrings.barLocationStrings.ok,
          onPress: () => this.goToLogin(),
        },
      ],

      {cancelable: false},
    );
  }

  _onMenuButtonClick() {
    this.setState({IsCheckinModalVisible: false});
    const {navigate} = this.props.navigation;
    if (this._isTAandDeliveryValid()) {
      GlobalVariables.restCurrencyCode.value = this.params.restCurrencyCode;
      navigate('MenuSlider', {
        screen: 'MenuSlider',
        barId: this.params.barId,
        nameBar: this.params.barName,
        tableNumber: GlobalVariables.tableNumber.value,
        showWelcome: false,
        restCurrencyCode: this.params.restCurrencyCode,
      });
    } else if (
      session.value === 'true' &&
      GlobalVariables.restId.value.toString() === this.params.barId.toString()
    ) {
      navigate('MenuSlider', {
        screen: 'MenuSlider',
        barId: this.state.barData.id
          ? this.state.barData.id
          : GlobalVariables.restId.value,
        nameBar: this.params.barName,
        tableNumber: GlobalVariables.tableNumber.value,
        showWelcome: false,
      });
    } else {
      AsyncStorage.getItem('checkIn').then((checkedIn) => {
        if (session.value == 'false') {
          if (checkedIn == null || checkedIn === 'false') {
            this.setState({IsMenuModalVisible: true});
          }
          //todo
          /*else{
                                    navigate("MenuSlider", {
                                        screen: "MenuSlider",
                                        barId: this.state.barData.id,
                                        nameBar: this.params.barName,
                                        tableNumber: GlobalVariables.tableNumber.value,
                                        showWelcome: false
                                    })*/
          //}
        } else {
          GlobalVariables.restCurrencyCode.value = this.params.restCurrencyCode;
          navigate('MenuSlider', {
            screen: 'MenuSlider',
            barId: this.params.barId,
            nameBar: this.params.barName,
            tableNumber: GlobalVariables.tableNumber.value,
            showWelcome: false,
            restCurrencyCode: this.params.restCurrencyCode,
          });
        }
      });
    }
  }

  renderBarLocation() {
    let currentDay = moment(new Date()).format('dddd');
    let stringDate = currentDay.toString();

    let TimeToShow = this.state.workingHours[stringDate];

    if (TimeToShow !== undefined) {
      if (TimeToShow.includes(localeStrings.barLocationStrings.closed)) {
        TimeToShow = localeStrings.barLocationStrings.close;
      }
    }

    // console.log(TimeToShow);

    return (
      <View style={{flex: 1}}>
        <ImageBackground
          style={{width: '100%', height: 170}}
          source={this.state.barData.image}
        />
        {/*<TouchableOpacity onPress={() => {
                    this.getPeopleChekIn()
                }} style={{
                    flexDirection: "row",
                    height: 80,
                    alignItems: "center",
                    position: "absolute",
                    marginTop: 90,
                    width: "100%"
                }}>
                    <View opacity={0.7} style={{
                        flexDirection: "row",
                        backgroundColor: "black",
                        height: 80,
                        alignItems: "center",
                        position: "absolute",
                        marginTop: 90,
                        width: "100%"
                    }}>
                        <Image source={require('../../res/images/person1.png')}
                               style={{width: 50, height: 50, borderRadius: 25, overflow: "hidden", marginLeft: 40}}/>
                        <Image source={require('../../res/images/person2.png')}
                               style={{width: 50, height: 50, borderRadius: 25, overflow: "hidden", marginLeft: -30}}/>
                        <Image source={require('../../res/images/person3.png')}
                               style={{width: 50, height: 50, borderRadius: 25, overflow: "hidden", marginLeft: -30}}/>
                        <Text style={{
                            color: "white",
                            marginLeft: 10,
                            fontFamily: "Helvetica",
                            fontSize: 12
                        }}>{localeStrings.barLocationStrings.seeWhoIsIn}</Text>
                    </View>
                </TouchableOpacity>*/}

        <ScrollView style={{flex: 1}}>
          <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  marginTop: 15,
                  marginRight: 8,
                  width: '65%',
                }}>
                {deviceLocale === 'he-IL' &&
                GlobalVariables.userLanguage.value === 'en-US' ? (
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontFamily: 'Arial',
                        fontSize: 14,
                        // textAlign: "right",
                      }}>
                      {this.state.barData.name}
                    </Text>
                    <Text
                      style={{
                        marginTop: 5,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                        // textAlign: "right"
                      }}>
                      {this.state.barData.address}
                    </Text>
                    <Text
                      style={{
                        marginTop: 5,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                        //  textAlign: "right"
                      }}>
                      {TimeToShow}
                    </Text>
                  </View>
                ) : (
                  <View style={{flexDirection: 'column'}}>
                    <Text
                      style={{
                        fontFamily: 'LucidaGrande',
                        fontSize: 14,
                      }}>
                      {this.state.barData.name}
                    </Text>
                    <Text
                      style={{
                        marginTop: 5,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 11,
                      }}>
                      {this.state.barData.address}
                    </Text>
                    <Text
                      style={{
                        marginTop: 5,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                        textAlign: 'left',
                      }}>
                      {TimeToShow}
                    </Text>
                  </View>
                )}

                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={{height: 45, width: 200, flexDirection: 'row'}}
                    onPress={() => {
                      this.props.navigation.navigate('RatingPlace', {
                        screen: 'RatingPlace',
                        items: this.params,
                        images: this.state.barData.image,
                      });
                    }}>
                    <Text
                      style={{
                        marginTop: 5,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 10,
                      }}>
                      {this.state.numberStars}
                    </Text>
                    <View
                      style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        marginLeft: 4,
                        marginRight: 4,
                      }}>
                      {this.generateStar()}
                    </View>
                    <Text
                      style={{
                        marginTop: 5,
                        marginLeft: 10,
                        color: '#4A4A4A',
                        fontFamily: 'Helvetica',
                        fontSize: 10,
                      }}>
                      ({this.state.barData.noRecenzii})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#3275b7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                  overflow: 'hidden',
                  width: 95,
                  height: 100,
                }}>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this._onMenuButtonClick()}>
                  <Image
                    source={require('../../res/images/menu-bg.png')}
                    style={{width: 50, height: 50, resizeMode: 'contain'}}
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Helvetica',
                      fontSize: 14,
                      fontWeight: 'bold',
                      marginTop: 3,
                    }}>
                    {localeStrings.barLocationStrings.menu}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '90%',
              }}>
              {GlobalVariables.userLanguage.value === 'he-IL' ? (
                <Text
                  style={{
                    color: '#9b9b9b',
                    marginTop: 8,
                    textAlign: 'left',
                  }}>
                  {this.state.barData.phone != 'null'
                    ? this.state.barData.phone
                    : ''}
                </Text>
              ) : (
                <Text style={{color: '#9b9b9b', marginTop: 8}}>
                  {this.state.barData.phone != 'null'
                    ? this.state.barData.phone
                    : ''}
                </Text>
              )}
              {GlobalVariables.userLanguage.value === 'he-IL' ? (
                <Text
                  style={{
                    color: '#9b9b9b',
                    marginTop: 8,
                    textAlign: 'left',
                  }}>
                  {this.state.barData.website != 'null'
                    ? this.state.barData.website
                    : ''}
                </Text>
              ) : (
                <Text style={{color: '#9b9b9b', marginTop: 8}}>
                  {this.state.barData.website != 'null'
                    ? this.state.barData.website
                    : ''}
                </Text>
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  flex: 1,
                }}>
                <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-start',
                      justifyContent: 'center',
                      height: 65,
                    }}
                    onPress={() => {
                      this.callBar();
                    }}>
                    <Image
                      source={require('../../res/images/call.png')}
                      style={{width: 50, height: 50, resizeMode: 'contain'}}
                    />
                  </TouchableOpacity>

                  {/* //todo: Removed as requested by client, To be implemented later*/}
                  {/*<TouchableOpacity*/}
                  {/*    style={{*/}
                  {/*        marginLeft: 20,*/}
                  {/*        justifyContent: "center",*/}
                  {/*        height: 65*/}
                  {/*    }}*/}
                  {/*    onPress={() => {*/}
                  {/*        this.emailBar();*/}
                  {/*    }}*/}
                  {/*>*/}
                  {/*    <Image*/}
                  {/*        source={require("../../res/images/mail.png")}*/}

                  {/*        style={{width: 50, height: 50, resizeMode: "contain"}}*/}
                  {/*    />*/}
                  {/*</TouchableOpacity>*/}
                </View>
              </View>
              {!this._isTAandDeliveryValid() && (
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.getItem('savedBarId')
                      .then((savedBarId) => {
                        if (session.value === 'false') {
                          this.setState({IsCheckinModalVisible: true});
                        } else if (
                          savedBarId == this.params.barId &&
                          this.state.isCheckIn
                        ) {
                          this.manualCheckOut();
                        } else if (this.state.distance !== null) {
                          //Number(this.params.barDistance.replace(",", "")) > 0.5 &&
                          let locationCheckoutCondition =
                            this.state.barData.distance > 0.5;
                          if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
                            locationCheckoutCondition = false;
                            //let locationCheckoutCondition = (this.state.barData.distance < 0.5);
                          }

                          if (locationCheckoutCondition) {
                            Alert.alert(
                              localeStrings.barLocationStrings.youAreTooFar,
                              '',
                              [
                                {
                                  text: localeStrings.barLocationStrings.cancel,
                                  //if far way can't login
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'destructive',
                                  // onPress: () => this.setState({IsModalVisible: true})
                                },
                                // {
                                //     text: localeStrings.barLocationStrings.ok,
                                // onPress: () => this.setState({IsModalVisible: true})
                                // }
                              ],

                              {cancelable: false},
                            );
                          } else {
                            this.setState({IsModalVisible: true});
                          }
                        } else {
                          this.setState({IsModalVisible: true});
                        }
                      })
                      .done();
                  }}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#3275b7',
                    borderWidth: 1,
                    width: 95,
                    maxHeight: 45,
                    marginTop: 10,
                    borderRadius: 4,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#3275b7',
                      fontFamily: 'Helvetica',
                      fontSize: 14,
                    }}>
                    {this.state.checkText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {deviceLocale === 'he-IL' &&
            GlobalVariables.userLanguage.value === 'en-US' ? (
              <Text
                style={{
                  marginTop: 15,
                  fontFamily: 'Helvetica',
                  fontSize: 13,
                  textAlign: 'right',
                }}>
                {this.state.barData.description}
              </Text>
            ) : (
              <Text
                style={{
                  marginTop: 15,
                  fontFamily: 'Helvetica',
                  fontSize: 13,
                }}>
                {this.state.barData.description}
              </Text>
            )}

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
                alignContent: 'center',
                alignSelf: 'center',
                backgroundColor: '#26466c',
                marginTop: 25,
                borderRadius: 10,
                height: 65,
              }}>
              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  height: 65,
                  width: '100%',
                }}
                onPress={() => {
                  this.callBar();
                }}>
                <Text
                  style={{
                    color: 'white',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                  }}>
                  {localeStrings.barLocationStrings.reserveTable}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{flex: 1, bottom: 5}}>
              {this.state.coupons.length === 1 ? (
                <View
                  style={{marginTop: 5, marginBottom: 5, flexDirection: 'row'}}>
                  {this.state.coupons.map((items, index) => (
                    <View key={index} style={{flex: 1}}>
                      <ImageBackground
                        style={{
                          resizeMode: 'contain',
                          height: 175,
                          bottom: 10,
                          marginTop: 15,
                          flex: 1,
                        }}
                        source={{uri: items.thumbnailImageUrl}}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <ScrollView
                  horizontal={true}
                  contentContainerStyle={{
                    marginTop: 5,
                    marginBottom: 5,
                    flexDirection: 'row',
                  }}>
                  {this.state.coupons.map((items, index) => (
                    <View key={index} style={{flex: 1}}>
                      <ImageBackground
                        style={{
                          resizeMode: 'contain',
                          marginLeft: 5,
                          height: this.state.coupons === 2 ? 200 : 150,
                          bottom: 10,
                          marginTop: 15,
                          width: this.state.coupons.length === 1 ? 250 : 150,
                        }}
                        source={{uri: items.thumbnailImageUrl}}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
  calcDistance = (newLatLng) => {
    let prevLatLng = this.state.prevLatLng;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  getCurrentBarLocation(uniqueId) {
    Geolocation.getCurrentPosition(
      (position) => {
        this.getTable(
          uniqueId,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => this.getCurrentLocation(uniqueId),
    );
  }

  getTableByNumber(tableNumber) {
    var userId = GlobalVariables.userId.value;
    if (isNaN(GlobalVariables.userId.value)) {
      userId = GlobalVariables.userId.value.replace(/['"]+/g, '');
    }
    try {
      fetch(GlobalVariables._URL + '/checkin', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserId: userId,
          TableNumber: tableNumber,
          VendorId: this.state.barData.id,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          if (response !== null) {
            let restaurantId;
            restaurantId = response.vendorId;
            AsyncStorage.removeItem('savedBarId');
            AsyncStorage.removeItem('tableNumber');
            AsyncStorage.removeItem('savedBarName');
            AsyncStorage.setItem('savedBarId', restaurantId.toString());
            AsyncStorage.setItem('tableNumber', response.tableNumber);
            AsyncStorage.setItem(
              'checkedInLocationLat',
              response.vendorLat.toString(),
            );
            AsyncStorage.setItem(
              'checkedInLocationLong',
              response.vendorLng.toString(),
            );
            AsyncStorage.setItem(
              'LocationDiscountPercent',
              response.discountPercentage,
            );

            GlobalVariables.orders = [];
            GlobalVariables.restId.value = restaurantId;
            AsyncStorage.setItem(
              'locationDiscount',
              response.discountPercentage,
            );
            GlobalVariables.tableNumber.value = response.tableNumber;
            GlobalVariables.checkedInLocation.value = restaurantId;
            this.setState({barId: restaurantId});
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              AsyncStorage.setItem('savedBarName', response.vendorNameHe);
            } else {
              AsyncStorage.setItem('savedBarName', response.vendorName);
            }
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              GlobalVariables.restName.value = response.vendorNameHe;
            } else {
              GlobalVariables.restName.value = response.vendorName;
            }
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              this.setState({nameBar: response.vendorNameHe});
            } else {
              this.setState({nameBar: response.vendorName});
            }
            this.setState({tableNumber: response.tableNumber});
            // todo: removed temporarily as per client request
            this.watchID = Geolocation.watchPosition(
              (position) => {
                let distanceTravelled = this.state.distanceTravelled;
                let latitude = position.coords.latitude;

                let longitude = position.coords.longitude;

                const newCoordinate = {
                  latitude,
                  longitude,
                };

                this.setState({
                  latitude: latitude,
                  longitude: longitude,
                  distanceTravelled:
                    distanceTravelled + this.calcDistance(newCoordinate),
                  prevLatLng: newCoordinate,
                });
                if (this.state.showAlert) {
                  if (
                    parseFloat(this.state.distanceTravelled).toFixed(2) > 0.15
                  ) {
                    this.checkOut();
                  }
                }
              },
              (error) => console.log(error),
              {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 1000,
                distanceFilter: 1,
              },
            );
            setTimeout(() => {
              this.setState({
                IsModalVisibleConfirmed: true,
                txt1: '',
                txt2: '',
                txt3: '',
                txt4: '',
              });
            }, 500);
          } else {
            Alert.alert(
              localeStrings.barLocationStrings.checkInFailed,
              localeStrings.barLocationStrings.pleaseTryAgain,
              [
                {
                  text: localeStrings.barLocationStrings.ok,
                  onPress: () =>
                    this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
                },
              ],
              {cancelable: false},
            );
          }
        })
        .catch((error) => {
          console.log('upload error', error);
          this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
            setTimeout(() => {
              Alert.alert(
                localeStrings.barLocationStrings.checkInFailed,
                localeStrings.barLocationStrings.pleaseTryAgain,
                [
                  {
                    text: localeStrings.barLocationStrings.ok,
                    onPress: () =>
                      this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
                  },
                ],
                {cancelable: false},
              );
            }, 1000);
        });
    } catch (e) {
      console.error('upload catch error', e);
      this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
        setTimeout(() => {
          Alert.alert(
            localeStrings.barLocationStrings.checkInFailed,
            localeStrings.barLocationStrings.pleaseTryAgain,
            [
              {
                text: localeStrings.barLocationStrings.ok,
                onPress: () =>
                  this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
              },
            ],
            {cancelable: false},
          );
        }, 1000);
    }
  }

  getTable(id, lat, long) {
    try {
      var userId = GlobalVariables.userId.value;
      if (isNaN(GlobalVariables.userId.value)) {
        userId = GlobalVariables.userId.value.replace(/['"]+/g, '');
      }

      let url = GlobalVariables._URL + '/checkin/' + lat + '/' + long;
      if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
        url = GlobalVariables._URL + '/checkin/';
      }
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          UserId: userId,
          UniqueID: id,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response !== null) {
            let restaurantId;
            restaurantId = response.vendorId;
            AsyncStorage.setItem('checkIn', 'true');
            AsyncStorage.setItem('savedBarId', restaurantId.toString());
            AsyncStorage.setItem('tableNumber', response.tableNumber);
            AsyncStorage.setItem(
              'checkedInLocationLat',
              response.vendorLat.toString(),
            );
            AsyncStorage.setItem(
              'checkedInLocationLong',
              response.vendorLng.toString(),
            );
            AsyncStorage.setItem(
              'LocationDiscountPercent',
              response.discountPercentage,
            );

            GlobalVariables.orders = [];
            GlobalVariables.restId.value = restaurantId;
            GlobalVariables.tableNumber.value = response.tableNumber;
            GlobalVariables.checkedInLocation.value = restaurantId;

            this.setState({barId: restaurantId});

            this.setState({tableNumber: response.tableNumber});
            AsyncStorage.setItem(
              'locationDiscount',
              response.discountPercentage,
            );
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              AsyncStorage.setItem('savedBarName', response.vendorNameHe);
            } else {
              AsyncStorage.setItem('savedBarName', response.vendorName);
            }
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              GlobalVariables.restName.value = response.vendorNameHe;
            } else {
              GlobalVariables.restName.value = response.vendorName;
            }
            if (GlobalVariables.userLanguage.value === 'he-IL') {
              this.setState({nameBar: response.vendorNameHe});
            } else {
              this.setState({nameBar: response.vendorName});
            }
            // todo: removed temporarily as per client request
            this.watchID = Geolocation.watchPosition(
              (position) => {
                let distanceTravelled = this.state.distanceTravelled;
                let latitude = position.coords.latitude;

                let longitude = position.coords.longitude;

                const newCoordinate = {
                  latitude,
                  longitude,
                };

                this.setState({
                  latitude: latitude,
                  longitude: longitude,
                  distanceTravelled:
                    distanceTravelled + this.calcDistance(newCoordinate),
                  prevLatLng: newCoordinate,
                });
                if (this.state.showAlert) {
                  if (
                    parseFloat(this.state.distanceTravelled).toFixed(2) > 0.15
                  ) {
                    this.checkOut();
                  }
                }
              },
              (error) => console.log(error),
              {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 1000,
                distanceFilter: 1,
              },
            );
            setTimeout(() => {
              this.setState({
                IsModalVisibleConfirmed: true,
                txt1: '',
                txt2: '',
                txt3: '',
                txt4: '',
              });
            }, 500);
          } else {
            Alert.alert(
              localeStrings.barLocationStrings.checkInFailed,
              localeStrings.barLocationStrings.pleaseTryAgain,
              [
                {
                  text: localeStrings.barLocationStrings.ok,
                  onPress: () =>
                    this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
                },
              ],
              {cancelable: false},
            );
          }
        })
        .catch((error) => {
          console.log('upload error', error);
          this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
            setTimeout(() => {
              Alert.alert(
                localeStrings.barLocationStrings.checkInFailed,
                localeStrings.barLocationStrings.pleaseTryAgain,
                [
                  {
                    text: localeStrings.barLocationStrings.ok,
                    onPress: () =>
                      this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
                  },
                ],
                {cancelable: false},
              );
            }, 1000);
        });
    } catch (e) {
      console.error('upload catch error', e);
      this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
        setTimeout(() => {
          Alert.alert(
            localeStrings.barLocationStrings.checkInFailed,
            localeStrings.barLocationStrings.pleaseTryAgain,
            [
              {
                text: localeStrings.barLocationStrings.ok,
                onPress: () =>
                  this.setState({txt1: '', txt2: '', txt3: '', txt4: ''}),
              },
            ],
            {cancelable: false},
          );
        }, 1000);
    }
  }
  render() {
    //    alert("gbv:" + GlobalVariables.restId.value + "BAR:" + this.params.barId)
    /*if (GlobalVariables.checkedInLocation.value.toString() === this.params.barId.toString()) {
            AsyncStorage.getItem('checkIn').then((checkedIn) => {
                console.log(checkedIn);
                if (checkedIn === "true") {
                    this.setState({isCheckIn: true})
                } else {
                    this.setState({isCheckIn: false})
                }
            }).done();

            /!*if(this.state.isCheckIn === "true"){//GlobalVariables.checkedInLocation.value.toString() === this.params.barId.toString()
                this.state.checkText = localeStrings.barLocationStrings.checkOut
            }else {
                this.state.checkText = localeStrings.barLocationStrings.checkIn
            }*!/
        } else {

            this.state.checkText = localeStrings.barLocationStrings.checkIn
        }*/
    AsyncStorage.getItem('checkIn')
      .then((checkedIn) => {
        if (checkedIn === 'true') {
          AsyncStorage.getItem('savedBarId')
            .then((savedBarId) => {
              if (savedBarId == this.params.barId) {
                this.state.checkText =
                  localeStrings.barLocationStrings.checkOut;
              } else {
                this.state.checkText = localeStrings.barLocationStrings.checkIn;
              }
            })
            .done();
          /*if(this.params.barId == GlobalVariables.checkedInLocation.value){
                    this.state.checkText = localeStrings.barLocationStrings.checkOut
                }else{
                    this.state.checkText = localeStrings.barLocationStrings.checkIn
                }*/
        } else {
          this.state.checkText = localeStrings.barLocationStrings.checkIn;
        }
      })
      .done();
    return (
      <View
        style={{
          flex: 1,
          height: '100%',
          width: '100%',
          flexDirection: 'column',
        }}>
        <Spinner color="#000" visible={this.state.enterActivity} />

        {this.renderBarLocation()}
        <Modal transparent={true} isVisible={this.state.IsModalVisible}>
          <View
            style={{
              flex: 1,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginBottom: 10,
            }}>
            <View
              style={{
                height: 285,
                width: '95%',
                flexDirection: 'column',
                alignSelf: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  borderRadius: 15,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  width: '95%',
                }}>
                <View style={{height: 55, marginTop: 10, marginBottom: 5}}>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      width: '100%',
                    }}
                    onPress={() => {
                      this.setState({IsModalVisible: false});
                      this.props.navigation.navigate('ScanScreen', {
                        screen: 'ScanScreen',
                        nameBar: this.params.barName
                          ? this.params.barName
                          : GlobalVariables.restName.value,
                      });
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        style={{width: 17, height: 17}}
                        source={require('../../res/images/scan.png')}
                      />
                      <Text
                        style={{
                          fontFamily: 'Helvetica',
                          fontSize: 16,
                          marginLeft: 10,
                          color: '#444444',
                        }}>
                        {localeStrings.barLocationStrings.scanCode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.BorderView} />
                <View style={{height: 55, marginTop: 5, marginBottom: 5}}>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      width: '100%',
                    }}
                    onPress={() => {
                      this.setState({IsModalVisible: false});
                      setTimeout(() => {
                        this.setState({IsModalVisibleTable: true});
                      }, 500);
                      setTimeout(() => {
                        this.input1.focus();
                      }, 1000);
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        style={{width: 17, height: 17}}
                        source={require('../../res/images/circledot.png')}
                      />
                      <Text
                        style={{
                          fontFamily: 'Helvetica',
                          fontSize: 16,
                          marginLeft: 10,
                          color: '#444444',
                        }}>
                        {localeStrings.barLocationStrings.typeCode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.BorderView} />
                {/*<View style={{height: 55, marginTop: 5, marginBottom: 5}}>
                                    <TouchableOpacity style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        width: "100%"
                                    }}
                                                      onPress={() => {
                                                          this.setState({IsModalVisible: false});
                                                          setTimeout(() => {
                                                              this.setState({IsModalVisibleTableNumber: true})
                                                          }, 500);
                                                          setTimeout(() => {
                                                              this.input1.focus();
                                                          }, 1000)


                                                      }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>

                                            <Image style={{width: 17, height: 17}}
                                                   source={require("../../res/images/bell.png")}/>
                                            <Text style={{
                                                fontFamily: "Helvetica",
                                                fontSize: 16,
                                                marginLeft: 10,
                                                color: "#444444"
                                            }}>{localeStrings.barLocationStrings.typeRoomTableNumber}</Text>
                                        </View>
                                    </TouchableOpacity>


                                </View>*/}
                <View style={styles.BorderView} />
              </View>

              <View
                style={{
                  height: 55,
                  backgroundColor: 'white',
                  width: '95%',
                  marginTop: 10,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({IsModalVisible: false});
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Helvetica',
                      fontSize: 16,
                      color: '#444444',
                    }}>
                    {' '}
                    {localeStrings.barLocationStrings.cancel}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          isVisible={this.state.IsModalVisibleTableNumber}>
          <View
            style={{
              flex: 1,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <View
              style={{
                height: 235,
                width: '95%',
                flexDirection: 'column',
                alignSelf: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  borderRadius: 15,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  width: '95%',
                  height: 100,
                }}>
                <Text
                  style={{
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                    alignSelf: 'center',
                    marginTop: 8,
                  }}>
                  {localeStrings.barLocationStrings.typeTableNumber}
                </Text>

                <View
                  style={{
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                    marginTop: 10,
                    marginLeft: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input1 = ref)}
                      keyboardType={
                        Platform.OS === 'android' ? 'numeric' : 'number-pad'
                      }
                      maxLength={1}
                      style={styles.NumberInput}
                      value={this.state.txt1}
                      autoCapitalize="characters"
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[0-9\b]+$/)) {
                              field_n1 = text;
                              this.setState({
                                txt1: field_n1,
                              });
                              this.input2.focus();
                            }
                          } else {
                            field_n1 = null;

                            this.setState({
                              txt1: '',
                            });
                          }
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input2 = ref)}
                      keyboardType={
                        Platform.OS === 'android' ? 'numeric' : 'number-pad'
                      }
                      maxLength={1}
                      autoCapitalize="characters"
                      style={styles.NumberInput}
                      value={this.state.txt2}
                      onKeyPress={({nativeEvent}) => {
                        nativeEvent.key === 'Backspace'
                          ? this.input1.focus()
                          : console.log('did not press');
                      }}
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[0-9\b]+$/)) {
                              field_n2 = text;
                              this.setState({
                                txt2: field_n2,
                              });
                              this.input3.focus();
                            }
                          } else {
                            field_n2 = null;
                            this.setState({
                              txt2: '',
                            });
                            this.input1.focus();
                          }
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input3 = ref)}
                      keyboardType={
                        Platform.OS === 'android' ? 'numeric' : 'number-pad'
                      }
                      maxLength={1}
                      autoCapitalize="characters"
                      style={styles.NumberInput}
                      value={this.state.txt3}
                      onKeyPress={({nativeEvent}) => {
                        nativeEvent.key === 'Backspace'
                          ? this.input2.focus()
                          : console.log('did not press');
                      }}
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[0-9\b]+$/)) {
                              field_n3 = text;
                              this.setState({
                                txt3: field_n3,
                              });
                              //this.input4.focus()
                            }
                          } else {
                            field_n3 = null;
                            this.setState({
                              txt3: '',
                            });
                          }
                        }
                      }}
                    />
                  </View>
                  {/*<View style={{borderBottomWidth: 1, borderBottomColor: "#979797", marginRight: 8}}>*/}
                  {/*    <TextInput*/}
                  {/*        ref={ref => this.input4 = ref}*/}
                  {/*        keyboardType={Platform.OS === 'android' ? "numeric" : "number-pad"}*/}
                  {/*        maxLength={1}*/}
                  {/*        autoCapitalize='characters'*/}
                  {/*        style={styles.NumberInput}*/}
                  {/*        value={this.state.txt4}*/}

                  {/*        onKeyPress={({nativeEvent}) => {*/}
                  {/*            nativeEvent.key === 'Backspace' ? this.input3.focus() : console.log("did not press")*/}
                  {/*        }}*/}
                  {/*        onChangeText={(text) => {*/}
                  {/*            {*/}
                  {/*                if (text.length > 0) {*/}
                  {/*                    if (text.match(/^[0-9\b]+$/)) {*/}
                  {/*                        field_n4 = text;*/}
                  {/*                        this.setState({*/}
                  {/*                            txt4: field_n4*/}
                  {/*                        })*/}

                  {/*                    }*/}
                  {/*                } else {*/}

                  {/*                    field_n4 = text;*/}
                  {/*                    this.setState({*/}
                  {/*                        txt4: ""*/}
                  {/*                    });*/}

                  {/*                }*/}

                  {/*            }*/}
                  {/*        }*/}
                  {/*        }*/}

                  {/*    />*/}
                  {/*</View>*/}
                </View>
                {/* space */}
              </View>

              <View
                style={{
                  height: 55,
                  backgroundColor: 'white',
                  width: '95%',
                  marginTop: 10,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({IsModalVisibleTableNumber: false});
                    let code = '';
                    if (field_n1 !== undefined) {
                      code = field_n1;
                    }
                    if (field_n2 !== undefined) {
                      code = code + field_n2;
                    }
                    if (field_n3 !== undefined) {
                      code = code + field_n3;
                    }
                    // if (field_n4 !== undefined) {
                    //     code = code + field_n4
                    // }
                    let tableNumber = code;
                    Keyboard.dismiss();
                    this.getTableByNumber(tableNumber);
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Helvetica',
                      fontSize: 16,
                      color: '#444444',
                    }}>
                    {' '}
                    {localeStrings.barLocationStrings.confirm}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              height: 55,
              backgroundColor: 'white',
              width: '95%',
              marginTop: 10,
              borderRadius: 10,
              overflow: 'hidden',
              bottom: 0,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({IsModalVisibleTableNumber: false});
              }}
              style={{
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 16,
                  color: '#444444',
                }}>
                {' '}
                {localeStrings.barLocationStrings.cancel}{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal transparent={true} isVisible={this.state.IsModalVisibleTable}>
          <View
            style={{
              flex: 1,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <View
              style={{
                height: 235,
                width: '95%',
                flexDirection: 'column',
                alignSelf: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  borderRadius: 15,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  width: '95%',
                  height: 100,
                }}>
                <Text
                  style={{
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                    alignSelf: 'center',
                    marginTop: 8,
                  }}>
                  {localeStrings.barLocationStrings.typeCode}
                </Text>

                <View
                  style={{
                    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                    marginTop: 10,
                    marginLeft: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input1 = ref)}
                      maxLength={1}
                      style={styles.NumberInput}
                      value={this.state.txt1}
                      autoCapitalize="characters"
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[A-Za-z0-9]+$/)) {
                              field1 = text;
                              this.setState({
                                txt1: field1,
                              });
                              this.input2.focus();
                            }
                          } else {
                            field1 = null;

                            this.setState({
                              txt1: '',
                            });
                          }
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input2 = ref)}
                      maxLength={1}
                      autoCapitalize="characters"
                      style={styles.NumberInput}
                      value={this.state.txt2}
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Backspace') {
                          this.setState({txt1: ''});
                          this.input1.focus();
                        } else {
                          console.log('did not press');
                        }
                      }}
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[A-Za-z0-9]+$/)) {
                              field2 = text;
                              this.setState({
                                txt2: field2,
                              });
                              this.input3.focus();
                            }
                          } else {
                            field2 = null;
                            this.setState({
                              txt2: '',
                            });
                            this.input1.focus();
                          }
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input3 = ref)}
                      maxLength={1}
                      autoCapitalize="characters"
                      style={styles.NumberInput}
                      value={this.state.txt3}
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Backspace') {
                          this.setState({txt2: ''});
                          this.input2.focus();
                        } else {
                          console.log('did not press');
                        }
                      }}
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[A-Za-z0-9]+$/)) {
                              field3 = text;
                              this.setState({
                                txt3: field3,
                              });
                              this.input4.focus();
                            }
                          } else {
                            field3 = null;
                            this.setState({
                              txt3: '',
                            });
                          }
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#979797',
                      marginRight: 8,
                    }}>
                    <TextInput
                      ref={(ref) => (this.input4 = ref)}
                      maxLength={1}
                      autoCapitalize="characters"
                      style={styles.NumberInput}
                      value={this.state.txt4}
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Backspace') {
                          this.setState({txt3: ''});
                          this.input3.focus();
                        } else {
                          console.log('did not press');
                        }
                      }}
                      onChangeText={(text) => {
                        {
                          if (text.length > 0) {
                            if (text.match(/^[A-Za-z0-9]+$/)) {
                              field4 = text;
                              this.setState({
                                txt4: field4,
                              });
                            }
                          } else {
                            field4 = text;
                            this.setState({
                              txt4: '',
                            });
                          }
                        }
                      }}
                    />
                  </View>
                </View>
                {/* space */}
              </View>

              <View
                style={{
                  height: 55,
                  backgroundColor: 'white',
                  width: '95%',
                  marginTop: 10,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({IsModalVisibleTable: false});
                    let code = '';
                    if (field1 !== undefined) {
                      code = field1;
                    }
                    if (field2 !== undefined) {
                      code = code + field2;
                    }
                    if (field3 !== undefined) {
                      code = code + field3;
                    }
                    if (field4 !== undefined) {
                      code = code + field4;
                    }
                    let restaurantNumber = code;
                    Keyboard.dismiss();
                    this.getCurrentBarLocation(restaurantNumber);
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Helvetica',
                      fontSize: 16,
                      color: '#444444',
                    }}>
                    {' '}
                    {localeStrings.barLocationStrings.confirm}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              height: 55,
              backgroundColor: 'white',
              width: '95%',
              marginTop: 10,
              borderRadius: 10,
              overflow: 'hidden',
              bottom: 0,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({IsModalVisibleTable: false});
              }}
              style={{
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 16,
                  color: '#444444',
                }}>
                {' '}
                {localeStrings.barLocationStrings.cancel}{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          transparent={true}
          animationType="fade"
          visible={this.state.IsMenuModalVisible}
          style={styles.modal}>
          <View style={styles.modalFirstView}>
            <View style={styles.barModalView}>
              <View style={PageStyles.modalSecondView}>
                <Image
                  source={require('../../res/images/popuplogo.png')}
                  resizeMode="cover"
                  style={PageStyles.modalImage}></Image>
                <View style={PageStyles.modalCenterText}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: 'gray',
                      fontWeight: 'bold',
                    }}>
                    {localeStrings.barLocationStrings.ohOh}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'black',
                      marginTop: 15,
                      textAlign: 'center',
                    }}>
                    {localeStrings.barLocationStrings.toReview}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: '3%',
                    borderBottomWidth: 1,
                    borderBottomColor: 'black',
                    borderStyle: 'solid',
                    top: '-6%',
                  }}
                />
                <View style={PageStyles.container}>
                  <TouchableOpacity
                    style={styles.padCenterText}
                    onPress={() => this.setState({IsMenuModalVisible: false})}>
                    <Text style={styles.textStyle}>
                      {localeStrings.barLocationStrings.later}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: 'black',
                      borderStyle: 'solid',
                      height: '138%',
                      margin: 0,
                      top: '-5%',
                    }}
                  />
                  <TouchableOpacity
                    style={styles.padCenterText}
                    onPress={() => {
                      this.setState({IsMenuModalVisible: false});
                      this.goToLogin();
                    }}>
                    <Text style={styles.textStyle}>
                      {localeStrings.barLocationStrings.login}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          animationType="fade"
          visible={this.state.IsCheckinModalVisible}
          style={styles.modal}>
          <View style={styles.modalFirstView}>
            <View style={styles.barModalView}>
              <View style={PageStyles.modalSecondView}>
                <Image
                  source={require('../../res/images/popuplogo.png')}
                  resizeMode="cover"
                  style={PageStyles.modalImage}></Image>
                <View style={PageStyles.modalCenterText}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: 'gray',
                      fontWeight: 'bold',
                    }}>
                    {localeStrings.barLocationStrings.ohOh}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'black',
                      marginTop: 15,
                      textAlign: 'center',
                    }}>
                    {localeStrings.barLocationStrings.checkInMsg}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: '3%',
                    borderBottomWidth: 1,
                    borderBottomColor: 'black',
                    borderStyle: 'solid',
                    top: '-6%',
                  }}
                />
                <View style={PageStyles.container}>
                  <TouchableOpacity
                    style={styles.padCenterText}
                    onPress={() =>
                      this.setState({IsCheckinModalVisible: false})
                    }>
                    <Text style={PageStyles.textStyle}>
                      {localeStrings.barLocationStrings.later}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: 'black',
                      borderStyle: 'solid',
                      height: '138%',
                      margin: 0,
                      top: '-5%',
                    }}
                  />
                  <TouchableOpacity
                    style={styles.padCenterText}
                    onPress={() => {
                      this.props.navigation.navigate('HomeScreen', {
                        screen: 'HomeScreen',
                      });
                    }}>
                    <Text style={PageStyles.textStyle}>
                      {localeStrings.barLocationStrings.checkIn}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          isVisible={this.state.IsModalVisibleConfirmed}>
          <View
            style={{
              flex: 1,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <View
              style={{
                height: 235,
                width: '95%',
                flexDirection: 'column',
                alignSelf: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  borderRadius: 15,
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  width: '95%',
                  height: 135,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                    alignSelf: 'center',
                    marginTop: 8,
                  }}>
                  {localeStrings.barLocationStrings.tableCodeConfirm}
                </Text>
                <Image
                  style={{
                    resizeMode: 'contain',
                    width: 75,
                    height: 75,
                    alignSelf: 'center',
                    marginTop: 10,
                  }}
                  source={require('../../res/images/confirm.png')}
                />
              </View>
              <View
                style={{
                  height: 55,
                  backgroundColor: 'white',
                  width: '95%',
                  marginTop: 10,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({IsModalVisibleConfirmed: false});
                    AsyncStorage.setItem(
                      'savedBarId',
                      this.state.barData.id.toString(),
                    );
                    AsyncStorage.setItem('savedBarName', this.params.barName);
                    setTimeout(() => {
                      this.props.navigation.navigate('MenuSlider', {
                        screen: 'MenuSlider',
                        barId: GlobalVariables.restId.value,
                        nameBar: GlobalVariables.restName.value,
                        //barId: this.state.barData.id ? this.state.barData.id : GlobalVariables.restId.value,
                        //nameBar: this.params.barName ? this.params.barName : GlobalVariables.restName.value,
                        tableNumber: GlobalVariables.tableNumber.value,
                        showWelcome: true,
                      });
                    }, 250);
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Helvetica',
                      fontSize: 16,
                      color: '#444444',
                    }}>
                    {' '}
                    {localeStrings.barLocationStrings.done}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default withNavigationFocus(BarLocation);

const PageStyles = StyleSheet.create({
  roundCircleCategory: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFB300',
    justifyContent: 'center',
  },

  roundCircleCategorySelected: {
    width: '100%',
    height: '100%',
    borderRadius: 50,

    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E2BA5D',
    justifyContent: 'center',
  },
  selectedSubSubSubCategory: {
    backgroundColor: '#F7B314',
    height: 45,
    width: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 8,
  },
  UnselectedSubSubSubCategory: {
    height: 45,
    width: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginLeft: 8,
  },
  modalSecondView: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 3,
  },
  modalCloseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 35,
    height: 35,
  },
  modalImage: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  modalCenterText: {
    marginTop: 15,
    marginBottom: 15,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  container: {
    //flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: 'white',
    width: '50%',
    height: 30,
    //paddingHorizontal:20,
  },
  textStyle: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
  },
  buttonStyle: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    width: '50%',
    top: -10,
  },
});
