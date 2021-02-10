import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  AsyncStorage,
  I18nManager,
  Alert,
  Keyboard,
  Platform,
  Linking,
} from 'react-native';
import {
  withNavigationFocus,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import Modal from 'react-native-modal';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {ScrollView} from 'react-native-gesture-handler';
import session from './session';
import VersionNumber from 'react-native-version-number';
import {GlobalVariables} from './GlobalVariables';
import ImageLoad from 'react-native-image-placeholder';
import RNRestart from 'react-native-restart';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';
import PushNotification from '../src/PushNotification';
import GPSState from 'react-native-gps-state';
import Share from 'react-native-share';
import Geolocation from '@react-native-community/geolocation';
import RNFetchBlob from 'react-native-fetch-blob';
import {getPreciseDistance, getDistance} from 'geolib';
const {width} = Dimensions.get('window');
import {Card} from 'react-native-elements';

const {height} = Dimensions.get('window');

let imgWidth = width * 0.75;
let locationTracking = 0;

let imgHeight = imgWidth + imgWidth * 0.1;
let field1, field2, field3, field4;
let locationTrackingHndl = 0;

import localeStrings from '../res/strings/LocaleStrings';
import StyleSheetFactory from '../res/styles/LocaleStyles';
import DeviceInfo from 'react-native-device-info';
import haversine from 'haversine';

const deviceLocale = DeviceInfo.getDeviceLocale();

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

//const imgVisible = require("../res/images/visible.png")

let message = '';
class HomeScreen extends React.Component {
  onShare = async () => {
    try {
      if (session.value === 'true') {
        message =
          this.state.userName +
          localeStrings.homeScreenStrings.shareMessageLoggeedIn +
          '\n';
      } else {
        message = localeStrings.homeScreenStrings.shareMessage + '\n';
      }
      const shareOptions = {
        title: 'Share BOB via',
        message: message,
        url: GlobalVariables.shareUrl,
      };
      Share.open(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } catch (error) {
      alert(error.message);
    }
  };
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              width: 65,
              height: 65,
              marginBottom: 5,
            }}
            source={require('../res/images/logo.png')}
          />
        </View>
      ),
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
          style={{
            height: 45,
            width: 55,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            navigation.state.params.handleSave();
          }}>
          <Image
            style={{resizeMode: 'contain', width: 15, height: 15}}
            source={require('../res/images/hamburger.png')}
          />
        </TouchableOpacity>
      ),
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

    this.state = {
      IsModalVisible: false,
      IsModalVisibleScan: false,
      IsLoggedinModalVisible: false,
      userName: '',
      image: {
        uri: '',
        base64Uri: '',
      },
      gotOrder: false,
      savedOrder: [],
      savedBarId: '',
      savedBarName: '',
      tableNumber: '',
      offerAll: [],
      bestofferAll: [],
      email: '',
      isCheckIn: false,
      isOn: true,
      distanceTravelled: 0,
      prevLatLng: {},
      showAlert: true,
      checkedInLocationLong: '',
      checkedInLocationLat: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      if (this.params != undefined) {
        if (this.props.isFocused) {
          this.Async();
          this.getOrders();
          this.showCheckIn();
        }
      }
    }
  }

  checkLocation = () => {
    this.watchID = Geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        AsyncStorage.getItem('checkIn').then((checkIn) => {
          if (checkIn === 'true' && GlobalVariables.restId.value != '') {
            try {
              let url = `${GlobalVariables._URL}/checkin/getdistancefromvendorlocation/${latitude}/${longitude}`;
              fetch(url, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  VendorId: GlobalVariables.restId.value,
                }),
              })
                .then((response) => response.json())
                .then((response) => {
                  if (response.distance > 0) {
                    let distanceFromLocation = response.distance.toFixed(2);
                    console.log(
                      '<-------- distanceFromLocation ',
                      distanceFromLocation,
                      GlobalVariables.DISTANCE_FROM_CHECKED_IN_LOCATION,
                    );
                    if (
                      distanceFromLocation >
                      GlobalVariables.DISTANCE_FROM_CHECKED_IN_LOCATION
                    ) {
                      this.checkOut();
                    }
                  } else {
                    distanceFromLocation = GlobalVariables.NO_PREV_CHECK_IN;
                  }
                })
                .catch((error) => {
                  console.log('<-------- Error while checking out--> ' + error);
                });
            } catch (e) {
              console.error('Server Error :---->>>>>> ', e);
            }
          }
        });
      },
      (error) => console.log('while checking position--->>>', error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10,
      },
    );
  };

  UNSAFE_componentWillMount() {
    GPSState.addListener((status) => {
      switch (status) {
        case GPSState.NOT_DETERMINED:
          GPSState.requestAuthorization(3);
          //alert('Please, allow the location, for us to do amazing things for you!')
          break;

        case GPSState.RESTRICTED:
          GPSState.openLocationSettings();
          GPSState.requestAuthorization(3);
          break;

        case GPSState.DENIED:
          //alert('It`s a shame that you do not allowed us to use location :(')
          break;

        case GPSState.AUTHORIZED_ALWAYS:
          break;
        case GPSState.AUTHORIZED_WHENINUSE:
          break;
      }
    });

    this.props.navigation.addListener('didFocus', (payload) => {
      // this.enableGPS(() => {
      //     this.startLocationTimer();
      // });
      if (GlobalVariables.restId.value != '') {
        this.getCurrentLocationOfUser(GlobalVariables.restId.value);
      }
      this.params = this.props.navigation.state.params;

      //For Popping Up Check-In Modal
      if (this.params != undefined) {
        if (this.params.showCheckInModal === true) {
          this.setState({IsModalVisibleScan: true});
          AsyncStorage.getItem('restCurrCode')
            .then((value) => {
              GlobalVariables.restCurrencyCode.value = value;
            })
            .done();
        }
      }
      AsyncStorage.getItem('savedBarId')
        .then((value) => {
          if (value !== null) {
            this.setState({savedBarId: value});
            GlobalVariables.restId.value = value;
          }
        })
        .done();
    });

    this.Async();
    this.getLanguage();
    this.getOrders();
    this.showCheckIn();
    // this.getOffer()
  }

  startLocationTimer() {
    if (locationTrackingHndl == 0) {
      locationTrackingHndl = setInterval(() => {
        //console.log(locationTrackingHndl);
        let checkedInLocationLat = this.state.checkedInLocationLat;
        let checkedInLocationLng = this.state.checkedInLocationLong;
        if (checkedInLocationLat && checkedInLocationLng) {
          if (this.state.isCheckIn === true) {
            Geolocation.getCurrentPosition(
              (position) => {
                //this.getBarLocations(barId, position.coords.latitude, position.coords.longitude)
                let startCoords = position.coords;
                let endCoords = {
                  latitude: checkedInLocationLat,
                  longitude: checkedInLocationLng,
                };

                let distFromRestaurant = getPreciseDistance(
                  startCoords,
                  endCoords,
                );
                if (
                  distFromRestaurant >
                  GlobalVariables.DISTANCE_FROM_CHECKED_IN_LOCATION
                ) {
                  this.checkOut();
                }
              },
              (error) => {
                console.log(error);
              },
            );
          } else {
            this.endLocationTimer();
          }
        }
      }, GlobalVariables.TIME_INTERVAL_FOR_LOCATION_TIMER);
    }
  }

  endLocationTimer() {
    if (locationTrackingHndl > 0) {
      clearInterval(locationTrackingHndl);
      locationTrackingHndl = 0;
    }
  }

  getOffer() {
    try {
      fetch(GlobalVariables._URL + '/cart-rules/all', {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          if (response !== '') {
            this.setState({
              offerAll: response,
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


  getBestOffer() {
    try {
      fetch(GlobalVariables._URL + '/cart-rules/allBestDiscount', {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          if (response !== '') {
            this.setState({
              bestofferAll: response,
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


  

  getBarLocationCurrency(lat, long) {
    try {
      fetch(
        GlobalVariables._URL +
          '/vendors/searchNearby/*/' +
          lat +
          '/' +
          long +
          '/' +
          GlobalVariables.userLanguage.value,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
        .then((response) => response.json())
        .then((response) => {
          if (response !== '') {
            console.log('here');
            AsyncStorage.setItem('restCurrCode', response[0].c.c);
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
  }

  getCurrentLocation(uniqueId) {
    Geolocation.getCurrentPosition(
      (position) => {
        this.getBarLocationCurrency(
          position.coords.latitude,
          position.coords.longitude,
        );
        this.getTable(
          uniqueId,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => this.getCurrentLocation(uniqueId),
    );
  }

  getCurrentLocationOfUser(vendorId) {
    Geolocation.getCurrentPosition(
      (position) => {
        // Commented this code as we are using checkLocation to tracking location of user
        // this.autoCheckout(
        //   vendorId,
        //   position.coords.latitude,
        //   position.coords.longitude,
        // );
      },
      (error) => this.getCurrentLocationOfUser(vendorId),
    );
  }

  getUserLocationOnLoad(userId) {
    Geolocation.getCurrentPosition(
      (position) => {
        this.getCheckedInDistance(
          userId,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => this.getCurrentLocationOfUser(userId),
    );
  }

  getCheckedInDistance(userId, lat, long) {
    try {
      let url = `${GlobalVariables._URL}/checkin/getdistancefromlastvendorlocation/${userId}/${lat}/${long}`;
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.distance > 0) {
            distanceFromLocation = response.distance.toFixed(2);
            if (
              distanceFromLocation >
              GlobalVariables.DISTANCE_FROM_CHECKED_IN_LOCATION
            ) {
              this.checkOut();
            }
          } else {
            distanceFromLocation = GlobalVariables.NO_PREV_CHECK_IN;
          }
        })
        .catch((error) => {
          console.log('Some error occurred.');
        });
    } catch (e) {
      console.error('Server Error : ', e);
    }
  }

  calcDistance = (newLatLng) => {
    let prevLatLng = this.state.prevLatLng;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  checkOut() {
    this.endLocationTimer();
    //console.log('here')
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
          AsyncStorage.setItem('checkedInLocationLat', '');
          AsyncStorage.setItem('checkedInLocationLong', '');
          AsyncStorage.setItem('restCurrCode', '');
          GlobalVariables.restId.value = '';
          this.setState({isCheckIn: false});
          if (!this.props.isFocused) {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({routeName: 'HomeScreen'})],
            });
            this.props.navigation.dispatch(resetAction);
          }
        })
        .catch((error) => {});
    } catch (e) {}
  }
  getTable(id, lat, long) {
    var userId = GlobalVariables.userId.value;

    if (isNaN(GlobalVariables.userId.value)) {
      userId = GlobalVariables.userId.value.replace(/['"]+/g, '');
    }
    try {
      let url = `${GlobalVariables._URL}/checkin/${lat}/${long}`;
      if (GlobalVariables.TEST_CHECK_IN_ENABLED) {
        url = `${GlobalVariables._URL}/checkin/`;
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
            if (response.vendorId === 0) {
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
              console.log(response);
              let restaurantId;
              restaurantId = response.vendorId;

              //alert(response);
              AsyncStorage.setItem('checkIn', 'true');
              AsyncStorage.setItem(
                'checkedInLocationLat',
                response.vendorLat.toString(),
              );
              AsyncStorage.setItem(
                'checkedInLocationLong',
                response.vendorLng.toString(),
              );
              AsyncStorage.setItem('savedBarId', restaurantId.toString());
              AsyncStorage.setItem('tableNumber', response.tableNumber);
              AsyncStorage.setItem(
                'LocationDiscountPercent',
                response.discountPercentage,
              );

              GlobalVariables.orders = [];
              GlobalVariables.restId.value = restaurantId;
              GlobalVariables.tableNumber.value = response.tableNumber;
              GlobalVariables.checkedInLocation.value = restaurantId;
              this.setState({barId: restaurantId});
              AsyncStorage.setItem(
                'locationDiscount',
                response.discountPercentage.toString(),
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
                      parseFloat(this.state.distanceTravelled).toFixed(2) ===
                      0.0
                    ) {
                      // this.checkOut();
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
            }
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

  getOrders() {
    AsyncStorage.getItem('savedOrders')
      .then((value) => {
        if (value !== null) {
          this.setState({gotOrder: true, savedOrder: JSON.parse(value)});
        } else {
          this.setState({gotOrder: false});
        }
      })
      .done();
    AsyncStorage.getItem('savedBarId')
      .then((value) => {
        if (value !== null) {
          this.setState({savedBarId: value});
          GlobalVariables.restId.value = value;
        }
      })
      .done();
    AsyncStorage.getItem('savedBarName')
      .then((value) => {
        if (value !== null) {
          this.setState({savedBarName: value});

          GlobalVariables.restName.value = value;
        }
      })
      .done();
  }

  changeNewLanguage() {
    const {isHe} = GlobalVariables;
    Alert.alert(
      isHe() ? '' : localeStrings.homeScreenStrings.changeLanguage,
      localeStrings.homeScreenStrings.selectLanguage,
      [
        {
          text: localeStrings.homeScreenStrings.english,
          onPress: () => this.changeLanguage(false, 'en-US'),
        },
        {
          text: localeStrings.homeScreenStrings.hebrew,
          onPress: () => this.changeLanguage(true, 'he-IL'),
        },
      ],

      {cancelable: false},
    );
  }

  changeLanguage(force, language) {
    console.log(force, language);

    I18nManager.forceRTL(force);
    I18nManager.allowRTL(force);
    AsyncStorage.setItem('userLanguage', language);
    setTimeout(() => {
      RNRestart.Restart();
    }, 1000);
  }

  Async() {
    AsyncStorage.getItem('UserLogged')
      .then((value) => {
        if (value !== '') {
          if (value === 'true') {
            AsyncStorage.getItem('userId')
              .then((value) => {
                if (value !== null && value !== '') {
                  GlobalVariables.userId.value = value;
                  if (isNaN(GlobalVariables.userId.value)) {
                    GlobalVariables.userId.value = GlobalVariables.userId.value.replace(
                      /['"]+/g,
                      '',
                    );
                  }
                  this.ShowDetails(value);
                  this.getUserLocationOnLoad(value);
                }
              })
              .done();
            session.value = 'true';
          } else {
            session.value = 'false';
            GlobalVariables.userId.value = '';
          }
        } else {
          AsyncStorage.setItem('UserLogged', 'false');
          AsyncStorage.setItem('userId', null);
          session.value = 'false';
          GlobalVariables.userId.value = '';
        }
      })
      .done();
  }

  getLanguage() {
    AsyncStorage.getItem('userLanguage')
      .then((value) => {
        if (value !== undefined) {
          GlobalVariables.userLanguage.value = value;
        } else {
          console.log('else getLanguage', deviceLocale);
          AsyncStorage.setItem('userLanguage', deviceLocale);
          GlobalVariables.userLanguage.value = deviceLocale;
        }
      })
      .done();
  }

  ShowDetails(value) {
    var value = value;
    if (isNaN(value)) {
      value = value.replace(/['"]+/g, '');
    }
    try {
      fetch(GlobalVariables._URL + '/core/getprofile/' + value, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          /*this.setState({
                        userName: response.fullName,
                        image: { uri: response.thumbnailImage }
                    });*/
          this.loadProfileImage(response.fullName, response.thumbnailImage);
        })
        .catch((error) => {
          console.log('upload errorCatch', error);
        });
    } catch (e) {
      console.log('upload catch error', e);
    }
  }

  loadProfileImage(fullName, thumbnailImage) {
    const configOptions = {fileCache: false};
    AsyncStorage.getItem('loggedAccountType', (err, loggedAccountType) => {
      // FB
      if (loggedAccountType == '1') {
        AsyncStorage.getItem('fbAccessToken', (err, fbAccessToken) => {
          if (!err) {
            RNFetchBlob.config(configOptions)
              .fetch('GET', thumbnailImage, {
                Authorization: fbAccessToken,
                'Content-Type': 'application/octet-stream', // 'application/octet-stream'
              })
              .then((resp) => {
                return resp.base64();
              })
              .then(async (base64Data) => {
                if (base64Data) {
                  this.setState({
                    userName: fullName,
                    image: {
                      uri: thumbnailImage,
                      base64Uri:
                        `data:application/octet-stream;base64,` + base64Data,
                    },
                  });
                } else {
                  this.setState({
                    userName: fullName,
                    image: {
                      uri: '',
                    },
                  });
                }
                this.hideModal();
              })
              .catch((err) => {
                this.hideModal();
                console.log(err);
              });
          } else {
            this.setState({
              userName: fullName,
              image: {uri: thumbnailImage},
            });
            this.hideModal();
          }
        }).catch((err) => {
          this.setState({
            userName: fullName,
            image: {uri: thumbnailImage},
          });
          this.hideModal();
          console.log(err);
        });
      } else if (loggedAccountType == '2') {
        // Google

        this.setState({
          userName: fullName,
          image: {
            uri: thumbnailImage,
          },
        });
        this.hideModal();
      } else if (loggedAccountType == '3') {
        // Apple

        this.setState({
          userName: fullName,
          image: {uri: ''},
        });
        this.hideModal();
      } else {
        // loggedAccountType is "0" for email/password sign-in.
        this.setState({
          userName: fullName,
          image: {uri: thumbnailImage},
        });
        this.hideModal();
      }
    });
  }
  autoCheckout(vendorId, lat, long) {
    setTimeout(() => {
      setInterval(() => {
        if (this.state.isCheckIn === true) {
          try {
            let url = `${GlobalVariables._URL}/checkin/getdistancefromvendorlocation/${lat}/${long}`;
            fetch(url, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                VendorId: vendorId,
              }),
            })
              .then((response) => response.json())
              .then((response) => {
                distanceFromLocation = response.distance.toFixed(2);
                if (
                  distanceFromLocation >
                  GlobalVariables.DISTANCE_FROM_CHECKED_IN_LOCATION
                ) {
                  this.checkOut();
                }
              })
              .catch((error) => {
                console.log('Some error occurred.');
              });
          } catch (e) {
            console.error('Server Error : ', e);
          }
        } else {
          this.setState({
            isCheckIn: false,
          });
        }
      }, 1000);
    }, GlobalVariables.TIME_INTERVAL_FOR_LOCATION_TIMER);
  }

  checkPermission = () => {
    request(
      Platform.OS == 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    )
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'This feature is not available (on this device / in this context)',
            );
            break;
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            break;
          case RESULTS.GRANTED:
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
        this.checkLocation();
      })
      .catch((error) => {
        console.log(error);
        this.checkLocation();
      });
  };

  componentDidMount() {
    GoogleSignin.configure({
      webClientId:
        '847661413994-fqa448i9p2emfm3a9b3enk3cnhcmkvev.apps.googleusercontent.com',
    });
    this.getOffer();
    this.getBestOffer();
    
    this.checkPermission();
    this.props.navigation.setParams({handleSave: this.showModal.bind(this)});
    AsyncStorage.getItem('checkedInLocationLat')
      .then((value) => {
        this.setState({checkedInLocationLat: value});
      })
      .done();
    AsyncStorage.getItem('checkedInLocationLong')
      .then((value) => {
        this.setState({checkedInLocationLong: value});
      })
      .done();
    AsyncStorage.getItem('savedBarId')
      .then((value) => {
        if (value !== null) {
          this.setState({savedBarId: value});
          GlobalVariables.restId.value = value;
        }
      })
      .done();

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          this._handleReferralUrl(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));

    Linking.addEventListener('url', (e) => this._handleOpenURL(e));
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', (e) => this._handleOpenURL(e));
    Geolocation.clearWatch(this.watchID);
  }

  _handleOpenURL(event) {
    this._handleReferralUrl(event.url);
  }

  _handleReferralUrl(url) {
    const code = url.includes('referrer=') ? url.split('referrer=')[1] : '';
    if (session.value === 'false' || code === '') {
      Alert.alert(
        localeStrings.homeScreenStrings.inOrderTo,
        '',
        [
          {
            text: localeStrings.homeScreenStrings.cancel,
            onPress: () => console.log('Cancel Pressed'),
            style: 'destructive',
          },
          {
            text: localeStrings.homeScreenStrings.ok,
            onPress: () => this.goToLogin(),
          },
        ],

        {cancelable: false},
      );
    } else {
      this.getCurrentLocation(code);
    }
  }

  showModal() {
    this.setState({IsModalVisible: true});
  }

  hideModal() {
    this.setState({IsModalVisible: false});
  }

  goToLogin() {
    const {navigate} = this.props.navigation;
    navigate('FirstPage', {screen: 'FirstPage'});
  }

  enableGPS(fnCallback) {
    //Get the current GPS state
    GPSState.getStatus().then((status) => {
      switch (status) {
        case GPSState.NOT_DETERMINED:
          //alert('Please, allow the location, for us to do amazing things for you!')
          GPSState.requestAuthorization(3);
          break;

        case GPSState.RESTRICTED:
          GPSState.openLocationSettings();
          break;

        case GPSState.DENIED:
          //alert('It`s a shame that you do not allowed us to use location :(')
          break;

        case GPSState.AUTHORIZED_ALWAYS:
          if (fnCallback) {
            fnCallback();
          }
          break;

        case GPSState.AUTHORIZED_WHENINUSE:
          if (fnCallback) {
            fnCallback();
          }
          break;
      }
    });
  }

  handleNavigation(route, params) {
    this.endLocationTimer();
    this.props.navigation.navigate(route, params);
  }

  _onCheckInButtonClick() {
    if (session.value === 'false') {
      this._showSignInAlert();
    } else {
      const {isLocation, orders, ORDER_TYPE} = GlobalVariables;
      if (!isLocation() && orders.length > 0) {
        this._switchOrderTypeAlert(() => {
          GlobalVariables.selectedOrderType = ORDER_TYPE.LOCATION;
          this.setState({
            IsModalVisibleScan: true,
          });
        });
      } else {
        GlobalVariables.selectedOrderType = ORDER_TYPE.LOCATION;
        this.setState({
          IsModalVisibleScan: true,
        });
      }
    }
  }

  _onTakeAwayButtonClick() {
    if (session.value === 'false') {
      this._showSignInAlert();
    } else {
      const {isTA, orders, ORDER_TYPE} = GlobalVariables;
      if (!isTA() && orders.length > 0) {
        this._switchOrderTypeAlert(() =>
          this._switchOrderType(ORDER_TYPE.TAKE_AWAY),
        );
      } else {
        this._switchOrderType(ORDER_TYPE.TAKE_AWAY);
      }
    }
  }

  _onDeliveryButtonClick() {
    if (session.value === 'false') {
      this._showSignInAlert();
    } else {
      const {isDelivery, orders, ORDER_TYPE} = GlobalVariables;
      if (!isDelivery() && orders.length > 0) {
        this._switchOrderTypeAlert(() =>
          this._switchOrderType(ORDER_TYPE.DELIVERY),
        );
      } else {
        this._switchOrderType(ORDER_TYPE.DELIVERY);
      }
    }
  }

  _switchOrderType(type) {
    this._checkOutIfCheckedIn();
    GlobalVariables.selectedOrderType = type;
    this._gotoLocationPage();
  }

  _checkOutIfCheckedIn() {
    AsyncStorage.getItem('checkIn').then((checkIn) => {
      if (checkIn === 'true') {
        this.checkOut();
      }
    });
  }

  _switchOrderTypeAlert(callBack) {
    Alert.alert(
      localeStrings.homeScreenStrings.switchOrderTypeTitle,
      localeStrings.homeScreenStrings.switchOrderTypeMessage,
      [
        {
          text: localeStrings.homeScreenStrings.cancel,
          onPress: () => console.log('_switchOrderTypeAlert: Cancel Pressed'),
          style: 'destructive',
        },
        {
          text: localeStrings.homeScreenStrings.ok,
          onPress: () => {
            GlobalVariables.orders = [];
            callBack();
          },
        },
      ],
      {cancelable: false},
    );
  }

  _showSignInAlert() {
    Alert.alert(
      localeStrings.homeScreenStrings.inOrderTo,
      '',
      [
        {
          text: localeStrings.homeScreenStrings.cancel,
          onPress: () => console.log('Cancel Pressed'),
          style: 'destructive',
        },
        {
          text: localeStrings.homeScreenStrings.ok,
          onPress: () => this.goToLogin(),
        },
      ],
      {cancelable: false},
    );
  }

  _gotoLocationPage() {
    this.enableGPS();
    this.props.navigation.setParams({showCheckInModal: false});
    this.handleNavigation('BobLocationsAll', {
      screen: 'BobLocationsAll',
    });
  }

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View
        style={{
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        {Platform.OS === 'ios' ? <PushNotification /> : <Text />}
        {deviceLocale === 'he-IL' &&
        GlobalVariables.userLanguage.value === 'en-US' ? (
          <View
            style={{
              flexDirection: 'column',
              marginTop: '-5%',
              marginLeft: 8,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <Text
              style={{
                fontFamily: 'Helvetica-Bold',
                fontSize: 17,
                //textAlign: "right",
              }}>
              {localeStrings.homeScreenStrings.specialOffers}
            </Text>
            <Text
              style={{
                fontSize: 14,
                marginTop: 3,
                fontFamily: 'Helvetica',
                // textAlign: "right",
              }}>
              {localeStrings.homeScreenStrings.reviewOurSpecial}
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'column',
              marginTop: '-5%',
              marginLeft: 8,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <Text
              style={{
                fontFamily: 'Helvetica-Bold',
                fontSize: 17,
              }}>
              {localeStrings.homeScreenStrings.specialOffers}
            </Text>
            <Text
              style={{
                fontSize: 14,
                marginTop: 3,
                fontFamily: 'Helvetica',
              }}>
              {localeStrings.homeScreenStrings.reviewOurSpecial}
            </Text>
          </View>
        )}

      

        <View style={{flexDirection: 'row', width: '100%'}}>
          <ScrollView horizontal={true} style={{marginTop: 5}}>
        

            {this.state.offerAll.map((offer, idx) => (
              <TouchableOpacity key={idx} style={styles.cardTouchableOpacity}>
                <View style={styles.imageShadowView}>
                  <View style={styles.couponMainImgShadow}>
                    <View>
                      <Image
                        source={{uri: offer.thumbnailImageUrl}}
                        style={styles.couponMainImg}
                      />
                    </View>
                    <View style={styles.cardTextView}>
                      <View style={styles.cardTextColumn}>
                        <Text
                          style={styles.cardTitleTop}
                          onPress={() => {
                            console.log('Title  Clicked');
                          }}>
                          {I18nManager.isRTL
                            ? `₪ ${offer.discountAmount.toFixed(2)}`
                            : `${offer.discountAmount.toFixed(2)} ILS`}
                        </Text>
                        <Text
                          style={[
                            styles.cardTitleBottom,
                            {textTransform: 'capitalize'},
                          ]}
                          onPress={() => {
                            console.log('Title  Clicked');
                          }}>
                          {offer.name}
                        </Text>
                      </View>
                      <Image
                        style={styles.footerImage}
                        source={require('../res/images/coupon-side-img.png')}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/*// ))}*/}
          </ScrollView>
        </View>

        <View style={{margin: 7}}>
          <Text style={{color: 'gray', fontWeight: 'bold'}}>
            {localeStrings.homeScreenStrings.bestOffer}
          </Text>
        </View>
        {/*For Second Scroll */}
        <View style={{flexDirection: 'row', width: '100%'}}>
          <ScrollView horizontal={true}>
          {this.state.bestofferAll.map((offer, idx) => (
              <TouchableOpacity key={idx} style={styles.cardTouchableOpacity}>
                <View style={styles.imageShadowView}>
                  <View style={styles.couponMainImgShadow}>
                    <View>
                      <Image
                        source={{uri: offer.thumbnailImageUrl}}
                        style={styles.couponMainImg}
                      />
                    </View>
                    <View style={styles.cardTextView}>
                      <View style={styles.cardTextColumn}>
                        <Text
                          style={styles.cardTitleTop}
                          onPress={() => {
                            console.log('Title  Clicked');
                          }}>
                          {I18nManager.isRTL
                            ? `₪ ${offer.discountAmount.toFixed(2)}`
                            : `${offer.discountAmount.toFixed(2)} ILS`}
                        </Text>
                        <Text
                          style={[
                            styles.cardTitleBottom,
                            {textTransform: 'capitalize'},
                          ]}
                          onPress={() => {
                            console.log('Title  Clicked');
                          }}>
                          {offer.name}
                        </Text>
                      </View>
                      <Image
                        style={styles.footerImage}
                        source={require('../res/images/coupon-side-img.png')}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {this.state.isCheckIn ? (
          <View>
            <View style={styles.container}>
              <TouchableOpacity
                style={styles.QuickMenuButton}
                onPress={() => {
                  AsyncStorage.getItem('savedBarId').then((value) => {
                    if (value !== null) {
                      this.setState({savedBarId: value});
                    }
                    if (GlobalVariables.restId.value == null) {
                      GlobalVariables.restId.value = value;
                    }
                  });
                  this.handleNavigation('MenuSlider', {
                    screen: 'MenuSlider',
                    barId: this.state.savedBarId
                      ? this.state.savedBarId
                      : GlobalVariables.restId.value,
                    nameBar: GlobalVariables.restName.value,
                    tableNumber: GlobalVariables.tableNumber.value
                      ? GlobalVariables.tableNumber.value
                      : this.state.tableNumber,
                    showWelcome: false,
                  });
                }}>
                <Text style={styles.QuickBtnTextStyle}>
                  {localeStrings.homeScreenStrings.quickMenu}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View />
        )}
        <View
          style={{
            marginTop: -15, //(this.state.isCheckIn) ? "1%" : "-22%",
            //marginBottom: (this.state.isCheckIn) ? "-2%" : 8,
            marginRight: 8,
            marginLeft: 15,
            width: width - 30,
            height: this.state.isCheckIn ? height / 3.3 : height / 3,
            flexDirection: 'row',
            justifyContent: 'space-between',
            //alignItems: "center",,
          }}>
          <View
            style={{
              flex: 1,
              marginRight: 0,
              marginLeft: 0,
              width: width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {this.state.isCheckIn ? (
              <TouchableOpacity
                onPress={() => {
                  this.enableGPS(() => {
                    GlobalVariables.CheckIn = this.state.isCheckIn;
                    GlobalVariables.orders = this.state.savedOrder;
                    GlobalVariables.totalOrders.value = this.state.savedOrder.length;
                    GlobalVariables.restId.value = this.state.savedBarId;
                    this.handleNavigation('BarLocation', {
                      screen: 'BarLocation',
                      barId: this.state.savedBarId,
                      barName: this.state.savedBarName,
                    });
                  });
                }}
                hitSlop={{top: 0, bottom: 40, left: 60, right: 60}}
                style={{
                  //backgroundColor: "#8DC055",
                  width: '92%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  height: 25,
                  borderRadius: 4,
                  zIndex: 5,
                  position: 'absolute',
                  marginTop: 2,
                }}>
                <ImageBackground
                  style={styles.currentLocationPopUp}
                  source={
                    I18nManager.isRTL
                      ? require('../res/images/pop-bg1.png')
                      : require('../res/images/pop-bg.png')
                  }>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 7,
                      marginTop: 12,
                      flex: 1,
                      flexWrap: 'wrap',
                    }}>
                    {localeStrings.homeScreenStrings.currentLocation}{' '}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => {
                GlobalVariables.selectedOrderType =
                  GlobalVariables.ORDER_TYPE.LOCATION;
                this.enableGPS();
                this.props.navigation.setParams({showCheckInModal: false});
                this.handleNavigation('BobLocationsAll', {
                  screen: 'BobLocationsAll',
                });
              }}
              style={{flex: 1, justifyContent: 'center'}}>
              {this.state.isCheckIn ? (
                <ImageBackground
                  style={styles.ImgBackgroundCheckin}
                  source={require('../res/images/locations-bg.png')}>
                  <Text style={styles.TextImgCheckin}>
                    {localeStrings.homeScreenStrings.locations}
                  </Text>
                </ImageBackground>
              ) : (
                <ImageBackground
                  style={styles.ImgBackground}
                  source={require('../res/images/locations-bg.png')}>
                  <Text style={styles.TextImg}>
                    {localeStrings.homeScreenStrings.locations}
                  </Text>
                </ImageBackground>
              )}
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              marginRight: 0,
              marginLeft: 0,
              width: width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => this._onCheckInButtonClick()}
              style={{flex: 1, justifyContent: 'center'}}>
              {this.state.isCheckIn ? (
                <ImageBackground
                  style={styles.ImgBackgroundCheckin}
                  source={require('../res/images/scan-bg.png')}>
                  <Text style={styles.TextImgCheckin}>
                    {localeStrings.homeScreenStrings.checkIn}
                  </Text>
                </ImageBackground>
              ) : (
                <ImageBackground
                  style={styles.ImgBackground}
                  source={require('../res/images/scan-bg.png')}>
                  <Text style={styles.TextImg}>
                    {localeStrings.homeScreenStrings.checkIn}
                  </Text>
                </ImageBackground>
              )}
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              marginRight: 0,
              marginLeft: 0,
              width: width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center'}}
              onPress={() => this._onTakeAwayButtonClick()}>
              <ImageBackground
                style={
                  this.state.isCheckIn
                    ? styles.ImgBackgroundCheckin
                    : styles.ImgBackground
                }
                source={require('../res/images/takeaway.png')}>
                <Text
                  style={
                    this.state.isCheckIn
                      ? styles.TextImgCheckin
                      : styles.TextImg
                  }>
                  {localeStrings.homeScreenStrings.takeAway}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              marginRight: 0,
              marginLeft: 0,
              width: width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center'}}
              onPress={() => this._onDeliveryButtonClick()}>
              <ImageBackground
                style={
                  this.state.isCheckIn
                    ? styles.ImgBackgroundCheckin
                    : styles.ImgBackground
                }
                source={require('../res/images/delivery.png')}>
                <Text
                  style={
                    this.state.isCheckIn
                      ? styles.TextImgCheckin
                      : styles.TextImg
                  }>
                  {localeStrings.homeScreenStrings.delivery}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              marginRight: 0,
              marginLeft: 0,
              width: width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {this.state.gotOrder && this.state.isCheckIn ? (
              <TouchableOpacity
                onPress={() => {
                  GlobalVariables.orders = this.state.savedOrder;
                  GlobalVariables.totalOrders.value = this.state.savedOrder.length;
                  GlobalVariables.restId.value = this.state.savedBarId;
                  if (this.state.isCheckIn) {
                    this.handleNavigation('MenuSlider', {
                      screen: 'MenuSlider',
                      barId: this.state.savedBarId
                        ? this.state.savedBarId
                        : GlobalVariables.restId.value,
                      nameBar: this.state.savedBarName,
                      tableNumber: GlobalVariables.tableNumber.value,
                      showWelcome: false,
                    });
                  } else {
                    this.setState({IsLoggedinModalVisible: true});
                  }
                }}
                hitSlop={{top: 0, bottom: 40, left: 60, right: 60}}
                style={{
                  //backgroundColor: "#8DC055",
                  // width: '85%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  height: 25,
                  borderRadius: 5,
                  zIndex: 5,
                  position: 'absolute',
                  marginTop: 2,
                  right: 8,
                }}>
                <ImageBackground
                  style={styles.OpenOrderPopUp}
                  source={
                    I18nManager.isRTL
                      ? require('../res/images/pop-bg1.png')
                      : require('../res/images/pop-bg.png')
                  }>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 8,
                      marginTop: 12,
                    }}>
                    {localeStrings.homeScreenStrings.openOrder}{' '}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => {
                this.props.navigation.setParams({showCheckInModal: false});
                this.handleNavigation('Orders', {screen: 'Orders'});
              }}
              style={{flex: 1, justifyContent: 'center'}}>
              {this.state.isCheckIn ? (
                <ImageBackground
                  style={styles.ImgBackgroundCheckin}
                  source={require('../res/images/orders-bg.png')}>
                  <Text style={styles.TextImgCheckin}>
                    {localeStrings.homeScreenStrings.orders}
                  </Text>
                </ImageBackground>
              ) : (
                <ImageBackground
                  style={styles.ImgBackground}
                  source={require('../res/images/orders-bg.png')}>
                  <Text style={styles.TextImg}>
                    {localeStrings.homeScreenStrings.orders}
                  </Text>
                </ImageBackground>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          isVisible={this.state.IsModalVisible}
          onBackButtonPress={() => this.hideModal()}
          onBackdropPress={() => this.hideModal()}
          style={{marginLeft: 0, marginBottom: 0, marginTop: 0}}
          animationIn={I18nManager.isRTL ? 'slideInRight' : 'slideInLeft'}
          animationOut={I18nManager.isRTL ? 'slideOutRight' : 'slideOutLeft'}>
          <View
            style={{
              flex: 1,
              marginTop: 10,
              width: 250,
              backgroundColor: 'white',
              flexDirection: 'column',
              paddingTop: getStatusBarHeight(),
            }}>
            {session.value === 'true' ? (
              <TouchableOpacity
                onPress={() => {
                  this.setState({IsModalVisible: false});
                  this.handleNavigation('Profile', {screen: 'Profile'});
                }}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  height: 60,
                  borderColor: 'black',
                  borderBottomWidth: 0.5,
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    marginLeft: 15,
                    height: 60,
                    flexDirection: 'row',
                    width: 120,
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  {this.state.image.base64Uri ? (
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        resizeMode: 'cover',
                      }}
                      source={{uri: this.state.image.base64Uri}}
                    />
                  ) : this.state.image.uri ? (
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        resizeMode: 'cover',
                      }}
                      source={this.state.image}
                    />
                  ) : (
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        resizeMode: 'cover',
                      }}
                      source={require('../res/images/default_profile_image.png')}
                    />
                  )}

                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'space-around',
                      height: 60,
                    }}>
                    <Text
                      style={{
                        marginLeft: 20,
                        fontFamily: 'Helvetica',
                        fontSize: 15,
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {this.state.userName}
                    </Text>

                    {/* <TouchableOpacity style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "row",
                                            height: 45
                                        }}
                                            onPress={() => {
                                                if (this.state.isOn === true) {
                                                    this.setState({
                                                        isOn: false
                                                    })
                                                } else {
                                                    this.setState({
                                                        isOn: true
                                                    })
                                                }
                                            }}>
                                            <Image style={this.state.isOn ? {
                                                resizeMode: "contain",
                                                width: 20,
                                                height: 20,
                                                tintColor: "blue"
                                            } : { resizeMode: "contain", width: 20, height: 20, tintColor: "black" }}
                                                source={require("../res/images/visible.png")} />
                                            <Text style={this.state.isOn ? {
                                                marginLeft: 5,

                                                fontFamily: 'Helvetica',
                                                fontSize: 10,
                                                color: "blue",
                                                textAlign: "center",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }
                                                :
                                                {
                                                    marginLeft: 5,

                                                    fontFamily: 'Helvetica',
                                                    fontSize: 10,
                                                    color: "black",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textAlign: "center"
                                                }}>{this.state.isOn ? "Visible" : "Invisible"}</Text>
                                        </TouchableOpacity> */}
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}

            {session.value === 'true' ? (
              <View style={styles.ViewOptions}>
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.setItem('UserLogged', 'false');
                    AsyncStorage.setItem('email', '');
                    AsyncStorage.setItem('checkIn', 'false');
                    AsyncStorage.setItem('savedBarId', '');
                    AsyncStorage.setItem('savedBarName', '');
                    GlobalVariables.userId.value = '';
                    session.value = 'false';
                    AsyncStorage.removeItem('role');
                    // AsyncStorage.getItem('role').then((value) => {
                    //     if (value !== null) {
                    //         AsyncStorage.setItem('role', null);
                    //     }
                    // }).done();
                    try {
                      GoogleSignin.revokeAccess();
                      console.log('deleted');
                    } catch (error) {
                      console.error(error);
                    }
                    GoogleSignin.signOut();
                    this.hideModal();
                    this.handleNavigation('FirstPage', {screen: 'FirstPage'});
                  }}>
                  <View style={styles.ViewTextImg}>
                    <Text style={styles.TextModal}>
                      {localeStrings.homeScreenStrings.logOut}
                    </Text>
                    <Image
                      style={styles.ImgArrow}
                      source={require('../res/images/arrowRight.png')}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ViewOptions}>
                <TouchableOpacity
                  onPress={() => {
                    this.hideModal();
                    this.handleNavigation('FirstPage', {screen: 'FirstPage'});
                  }}>
                  <View style={styles.ViewTextImg}>
                    <View style={{flexDirection: 'row'}}>
                      <Image
                        style={styles.imgLeft}
                        source={require('../res/images/userPlaceholder.png')}
                      />
                      {/*<Text style={styles.TextModal}>{localeStrings.homeScreenStrings.signIn}</Text>*/}
                      <Text style={styles.homeScreenSignInText}>
                        {localeStrings.homeScreenStrings.signIn}
                      </Text>
                      <Image
                        style={{opacity: 0}}
                        source={require('../res/images/arrowRight.png')}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/*<View style={styles.ViewOptions}>*/}
            {/*    <TouchableOpacity onPress={() => {*/}
            {/*        this.hideModal();*/}
            {/*        if(session.value != "true" ){*/}
            {/*            this.setState({IsLoggedinModalVisible:true});*/}
            {/*        }*/}
            {/*    }}>*/}
            {/*        <View style={styles.ViewTextImg}>*/}
            {/*            <Text*/}
            {/*                style={styles.TextModalBtn}>{localeStrings.homeScreenStrings.chat}</Text>*/}
            {/*            <Button*/}
            {/*                buttonStyle={styles.BtnRight}*/}
            {/*                // onPress={this._onPressButton}*/}
            {/*                title="45"*/}
            {/*                color="#6cdb40"*/}

            {/*            />*/}

            {/*            /!*<Text style={{marginRight: 15}}>{VersionNumber.appVersion}</Text>*!/*/}

            {/*            <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>*/}
            {/*        </View>*/}
            {/*    </TouchableOpacity>*/}
            {/*</View>*/}

            {/*<View style={styles.ViewOptions}>*/}
            {/*    <TouchableOpacity onPress={() => {*/}
            {/*        this.hideModal();*/}
            {/*        if(session.value != "true" ){*/}
            {/*            this.setState({IsLoggedinModalVisible:true});*/}
            {/*        }*/}
            {/*        //this.handleNavigation("TermsWebView", {screen: "TermsWebView"})*/}
            {/*    }}>*/}
            {/*        <View style={styles.ViewTextImg}>*/}
            {/*            <Text*/}
            {/*                style={styles.TextModal}>{localeStrings.homeScreenStrings.myWallet}</Text>*/}
            {/*            <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")}/>*/}
            {/*        </View>*/}
            {/*    </TouchableOpacity>*/}

            {/*</View>*/}

            {/*{session.value === "true" ?*/}

            <View style={styles.ViewOptions}>
              <TouchableOpacity
                onPress={() => {
                  this.hideModal();
                  if (session.value != 'true') {
                    this.setState({IsLoggedinModalVisible: true});
                  } else {
                    this.handleNavigation('Orders', {screen: 'Orders'});
                  }
                }}>
                <View style={styles.ViewTextImg}>
                  <Text style={styles.TextModal}>
                    {localeStrings.homeScreenStrings.ordersHistory}
                  </Text>
                  <Image
                    style={styles.ImgArrow}
                    source={require('../res/images/arrowRight.png')}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* todo: Removed as per request */}
            {/* <View style={styles.ViewOptions}>
                            <TouchableOpacity onPress={() => {
                                this.setState({ IsModalVisible: false });
                                this.handleNavigation("Coupons", { screen: "Coupons" })
                            }}>
                                <View style={styles.ViewTextImg}>
                                    <Text style={styles.TextModal}>{localeStrings.homeScreenStrings.coupons}</Text>
                                    <Image style={styles.ImgArrow} source={require("../res/images/arrowRight.png")} />
                                </View>
                            </TouchableOpacity>


                        </View> */}

            <View style={styles.ViewOptions}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({IsModalVisible: false});
                  setTimeout(() => {
                    this.changeNewLanguage();
                  }, 1000);
                }}>
                <View style={styles.ViewTextImg}>
                  <Text style={styles.TextModal}>
                    {localeStrings.homeScreenStrings.changeLanguage}
                  </Text>
                  <Image
                    style={styles.ImgArrow}
                    source={require('../res/images/arrowRight.png')}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.ViewOptions}>
              <TouchableOpacity
                onPress={() => {
                  this.onShare();
                }}>
                <View style={styles.ViewTextImg}>
                  <Text style={styles.TextModal}>
                    {localeStrings.homeScreenStrings.shareWithFriend}
                  </Text>
                  <Image
                    style={styles.ImgArrow}
                    source={require('../res/images/arrowRight.png')}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/*:*/}
            {/*null}*/}

            <View style={styles.ViewOptions}>
              <TouchableOpacity
                onPress={() => {
                  this.hideModal();
                  this.handleNavigation('PrivacyWebView', {
                    screen: 'PrivacyWebView',
                  });
                }}>
                <View style={styles.ViewTextImg}>
                  <Text style={styles.TextModal}>
                    {localeStrings.homeScreenStrings.privacyPolicy}
                  </Text>
                  <Image
                    style={styles.ImgArrow}
                    source={require('../res/images/arrowRight.png')}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.ViewOptions}>
              <TouchableOpacity
                onPress={() => {
                  this.hideModal();
                  this.handleNavigation('TermsWebView', {
                    screen: 'TermsWebView',
                  });
                }}>
                <View style={styles.ViewTextImg}>
                  <Text style={styles.TextModal}>
                    {localeStrings.homeScreenStrings.termsAndConditions}
                  </Text>
                  <Image
                    style={styles.ImgArrow}
                    source={require('../res/images/arrowRight.png')}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.ViewOptions}>
              <View style={styles.ViewTextImg}>
                <Text style={styles.TextModal}>
                  {localeStrings.homeScreenStrings.versionNo}
                </Text>
                <Text style={{marginRight: 15}}>
                  {VersionNumber.appVersion}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
        <Modal transparent={true} isVisible={this.state.IsModalVisibleScan}>
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
                      this.enableGPS();
                      this.setState({IsModalVisibleScan: false});
                      this.handleNavigation('ScanScreen', {
                        screen: 'ScanScreen',
                        comeFrom: 'homeScreen',
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
                        source={require('../res/images/scan.png')}
                      />
                      <Text
                        style={{
                          fontFamily: 'Helvetica',
                          fontSize: 16,
                          marginLeft: 10,
                          color: '#444444',
                        }}>
                        {localeStrings.homeScreenStrings.scanCode}
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
                      this.setState({IsModalVisibleScan: false});
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
                        source={require('../res/images/circledot.png')}
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
                    this.setState({IsModalVisibleScan: false});
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
                    {localeStrings.homeScreenStrings.cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
                    this.getCurrentLocation(restaurantNumber);
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
          visible={this.state.IsLoggedinModalVisible}
          style={styles.modal}>
          <View style={styles.modalFirstView}>
            <View style={styles.modalSecondView}>
              <Image
                source={require('../res/images/popuplogo.png')}
                resizeMode="cover"
                style={styles.modalImage}></Image>
              <View style={styles.modalCenterText}>
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
                  {session.value !== 'true'
                    ? localeStrings.barLocationStrings.toContinue
                    : localeStrings.barLocationStrings.checkInMsg}
                </Text>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: 'black',
                  borderStyle: 'solid',
                  top: '-4%',
                }}
              />
              <View style={styles.container}>
                <TouchableOpacity
                  style={styles.CenterText}
                  onPress={() =>
                    this.setState({IsLoggedinModalVisible: false})
                  }>
                  <Text style={styles.textStyle}>
                    {localeStrings.barLocationStrings.later}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderLeftColor: 'black',
                    borderStyle: 'solid',
                    height: width > 400 ? '300%' : '215%',
                    margin: 0,
                    top: '-4%',
                  }}
                />
                <TouchableOpacity
                  style={styles.CenterText}
                  onPress={() => {
                    if (session.value !== 'true') {
                      this.setState({IsLoggedinModalVisible: false});
                      this.goToLogin();
                    } else {
                      this.setState({IsLoggedinModalVisible: false});
                      this.showCheckIn();
                    }
                  }}>
                  <Text style={styles.textStyle}>
                    {/*{ localeStrings.barLocationStrings.login}*/}

                    {session.value !== 'true'
                      ? localeStrings.barLocationStrings.login
                      : localeStrings.barLocationStrings.checkIn}
                  </Text>
                </TouchableOpacity>
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
                  {localeStrings.homeScreenStrings.tableCodeConfirm}
                </Text>
                <Image
                  style={{
                    resizeMode: 'contain',
                    width: 75,
                    height: 75,
                    alignSelf: 'center',
                    marginTop: 10,
                  }}
                  source={require('../res/images/confirm.png')}
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
                    AsyncStorage.getItem('savedBarName')
                      .then((savedBarName) => {
                        if (savedBarName != '') {
                          this.setState({savedBarName: savedBarName});
                        }
                      })
                      .done();
                    AsyncStorage.getItem('savedBarId')
                      .then((savedBarId) => {
                        if (savedBarId != '') {
                          this.setState({savedBarId: savedBarId});
                        }
                      })
                      .done();
                    AsyncStorage.getItem('tableNumber')
                      .then((tableNumber) => {
                        if (tableNumber != '') {
                          this.setState({tableNumber: tableNumber});
                        }
                      })
                      .done();

                    this.handleNavigation('MenuSlider', {
                      screen: 'MenuSlider',
                      barId: GlobalVariables.restId.value
                        ? GlobalVariables.restId.value
                        : this.state.savedBarId,
                      nameBar: GlobalVariables.restName.value
                        ? GlobalVariables.restName.value
                        : this.state.savedBarName,
                      tableNumber: GlobalVariables.tableNumber.value
                        ? GlobalVariables.tableNumber.value
                        : this.state.tableNumber,
                      showWelcome: true,
                    });
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
                    {localeStrings.homeScreenStrings.done}
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

export default withNavigationFocus(HomeScreen);
