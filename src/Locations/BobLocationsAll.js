import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Alert,
  I18nManager,
  AsyncStorage,
  RefreshControl,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {ScrollView} from 'react-native-gesture-handler';
import Rating from 'react-native-rating';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
//let DataLocations = require("../JSON/Locations.js");
const ratingPoint = {
  starFilled: require('../../res/images/starFull.png'),
  startUnfilled: require('../../res/images/starSemi.png'),
};
import StyleSheetFactory from '../../res/styles/LocaleStyles';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
import localeStrings from '../../res/strings/LocaleStrings';
import {GlobalVariables} from '../GlobalVariables';
import DeviceInfo from 'react-native-device-info';

const deviceLocale = DeviceInfo.getDeviceLocale();
let distanceFromLocation = 0,
  FullData = [];
import {withNavigationFocus} from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import {BaseComponent} from '../Core/Components/BaseComponent';
import Spinner from 'react-native-loading-spinner-overlay';

class BobLocationsAll extends BaseComponent {
  cacheId() {
    return 'cddc4051-9940-4e56-b2d0-992a8c438668';
  }
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
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('HomeScreen', {screen: 'HomeScreen'});
            }}>
            <Image
              style={{
                resizeMode: 'contain',
                width: 65,
                height: 65,
                marginBottom: 5,
              }}
              source={require('../../res/images/logo.png')}
            />
          </TouchableOpacity>
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
          onPress={() =>
            AsyncStorage.getItem('role')
              .then((value) => {
                if (value === 'waiter') {
                  navigation.navigate('HomeScreenWaiters', {
                    screen: 'HomeScreenWaiters',
                  });
                } else {
                  navigation.navigate('HomeScreen', {screen: 'HomeScreen'});
                }
              })
              .done()
          }
          style={styles.headerBackButton}>
          <Image
            style={{
              resizeMode: 'contain',
              width: 15,
              height: 15,
              marginBottom: 5,
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
        fontSize: 17,
      },
    };
  };

  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      needRender: true,
      latitude: null,
      longitude: null,
      locations: FullData,
      searchTerm: '',
      isActiveSearchInput: true,
      enterActivity: false,
      allKm: true,
      eightHundred: false,
      twoKm: false,
      fiveKm: false,
      tenKm: false,
      selectedDistance: 0,
      refreshing: false,
      loadingMsg: '',
    };
  }

  //Removed for faster state update
  // componentDidUpdate(prevProps) {
  //     if (prevProps.isFocused !== this.props.isFocused) {
  //         if (this.props.isFocused) {

  //             this.getCurrentLocation();
  //         }
  //     }
  // }

  getBarLocations(lat, long) {
    GlobalVariables.lat = lat;
    GlobalVariables.lng = long;

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
          this.setState({enterActivity: false});
          if (response !== '') {
            FullData = [];
            for (let i = 0; i < response.length; i++) {
              let DataItem = {};
              DataItem = {
                id: response[i].i,
                name: response[i].n,
                address: response[i].a,
                distance: response[i].dst,
                image: {uri: GlobalVariables._URL + '/' + response[i].t},
                noStars: response[i].ra,
                noRecenzii: response[i].re,
                restCurrencyCode: response[i].c.c,
              };
              FullData.push(DataItem);
            }
            this.putCache(FullData);
            this.setState({
              locations: FullData,
              needRender: false,
            });
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

  componentDidMount() {
    this.getCurrentLocation();
    AsyncStorage.getItem('restCurrCode')
      .then((value) => {
        GlobalVariables.restCurrencyCode.value = value;
      })
      .done();
    if (GlobalVariables.restId.value != '') {
      this.getCurrentLocationOfUser(GlobalVariables.restId.value);
    }
  }

  UNSAFE_componentWillMount() {
    this.readCache().then((data) => {
      if (data && FullData.length == 0) {
        FullData = data;
        this.setState({locations: FullData, loadingMsg: ''});
      }
    });
    // this.setState({enterActivity: true});
  }

  getCurrentLocationOfUser(vendorId) {
    this.setState({enterActivity: true});
    this.setState({
      loadingMsg: 'Finding your current location. This may take some time.',
    });
    Geolocation.getCurrentPosition(
      (position) => {
        this.getCheckedInDistance(
          vendorId,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        this.setState({enterActivity: false});
        console.log('Error getCurrentLocationOfUser :', error);
      },
    );
  }

  getCheckedInDistance(vendorId, lat, long) {
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
          this.setState({enterActivity: false});
          distanceFromLocation = response.distance.toFixed(2);
        })
        .catch((error) => {
          this.setState({enterActivity: false});
          console.log('Some error occurred getCheckedInDistance: ', error);
        });
    } catch (e) {
      this.setState({enterActivity: false});
      console.error('Server Error : ', e);
    }
  }

  getCurrentLocation() {
    this.setState({enterActivity: true});
    this.setState({
      loadingMsg: 'Finding your current location. This may take some time.',
    });
    if (this.params.long != undefined) {
      Geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            loadingMsg: '',
          });
          this.getBarLocations(this.params.lat, this.params.long);
        },
        (error) => {
          this.setState({enterActivity: false});
          console.log('Error getCurrentLocation1: ', error);
        },
      );
    } else {
      Geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            loadingMsg: '',
          });
          this.getBarLocations(
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          this.setState({enterActivity: false});
          console.log('Error getCurrentLocation2: ', error);
        },
      );
    }
  }

  getBarLocationsAsPerMenu(menuitem){

    try {
      fetch(
        GlobalVariables._URL +
          '/vendors/searchNearby/' +
          menuitem +
          '/' +
          GlobalVariables.lat +
          '/' +
          GlobalVariables.lng  +
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
          this.setState({enterActivity: false});
          if (response !== '') {
            FullData = [];
            for (let i = 0; i < response.length; i++) {
              let DataItem = {};
              DataItem = {
                id: response[i].i,
                name: response[i].n,
                address: response[i].a,
                distance: response[i].dst,
                image: {uri: GlobalVariables._URL + '/' + response[i].t},
                noStars: response[i].ra,
                noRecenzii: response[i].re,
                restCurrencyCode: response[i].c.c,
              };
              FullData.push(DataItem);
            }
            this.putCache(FullData);
            this.setState({
              locations: FullData,
              needRender: false,
            });
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

  onRefresh() {
    // this.setState({enterActivity: true});
    this.getCurrentLocation();
  }

  renderBarLocations(distanceFilter) {
    let filteredObj = this.state.locations;

    if (distanceFilter !== 0) {
      let newFilterObj = [];

      for (let i = 0; i < filteredObj.length; i++) {
        if (
          parseFloat(distanceFilter) >
          parseFloat(filteredObj[i].distance.replace(',', ''))
        ) {
          newFilterObj.push(filteredObj[i]);
        }
      }
      filteredObj = newFilterObj;
    }
    return filteredObj.map((items, index) => (
      <View
        key={index}
        style={{
          flexDirection: 'column',
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: 'white',
          borderRadius: 15,
          overflow: 'hidden',
          height: 235,
          marginTop: 10,
        }}>
        <TouchableOpacity
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'flex-start',
          }}
          onPress={() => {
            console.log('items.id', items.id);
            GlobalVariables.restCurrencyCode.value = items.restCurrencyCode;
            GlobalVariables.selectedLocation.id = items.id;
            GlobalVariables.selectedLocation.name = items.name;
            this.props.navigation.navigate('BarLocation', {
              screen: 'BarLocation',
              barName: items.name,
              barId: items.id,
              barDistance: items.distance,
              restCurrencyCode: items.restCurrencyCode,
            });
          }}>
          <ImageBackground
            style={styles.ImgBackgroundBarAll}
            source={items.image}
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'column', margin:2}}>
              {GlobalVariables.userLanguage.value === 'he-IL' ? (
                <Text
                  style={{
                    marginLeft: 10,
                    marginTop: 10,
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                    textAlign: 'left',
                  }}>
                  {items.name}
                </Text>
              ) : (
                <Text
                  style={{
                    marginLeft: 10,
                    marginTop: 10,
                    fontFamily: 'Helvetica',
                    fontSize: 16,
                  }}>
                  {items.name}
                </Text>
              )}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    marginTop: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10,
                    marginRight: 5,
                    fontFamily: 'Helvetica',
                    fontSize: 10,
                    color: '#4A4A4A',
                  }}>
                  {items.noStars}{' '}
                </Text>
                <Rating
                  initial={Number(items.noStars)}
                  editable={false}
                  selectedStar={ratingPoint.starFilled}
                  unselectedStar={ratingPoint.startUnfilled}
                  stagger={80}
                  maxScale={1.4}
                  starStyle={{
                    width: 15,
                    height: 10,
                    marginLeft: 1.2,
                    marginRight: 1.2,
                    marginTop: 3,
                  }}
                />

                <Text
                  style={{
                    marginTop: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 5,
                    fontFamily: 'Helvetica',
                    fontSize: 10,
                    color: '#4A4A4A',
                  }}>
                  ({items.noRecenzii})
                </Text>
              </View>
            </View>
            <Image
              style={{
                resizeMode: 'contain',
                width: 100,
                height: 55,
                marginRight: 15,

                alignSelf: 'flex-end',
              }}
              source={require('../../res/images/logo2.png')}
            />
          </View>

          {GlobalVariables.userLanguage.value === 'he-IL' ? (
            <Text numberOfLines={1}
              style={{
                marginLeft: 10,
                fontFamily: 'Helvetica',
                fontSize: 12,
                marginTop: 3,
                color: '#4A4A4A',
                textAlign: 'left',
              }}>
              {items.address}
            </Text>
          ) : (
            <Text numberOfLines={1}
              style={{
                marginLeft: 10,
                fontFamily: 'Helvetica',
                fontSize: 12,
                marginTop: 3,
                color: '#4A4A4A',
                textAlign: 'left',
              }}>
              {items.address}
            </Text>
          )}

          {deviceLocale === 'he-IL' &&
          GlobalVariables.userLanguage.value === 'en-US' ? (
            <Text
              style={{
                marginLeft: 10,
                fontFamily: 'Helvetica',
                fontSize: 12,
                marginTop: 3,
                marginBottom : 3,
                color: '#4A4A4A',
                textAlign: 'right',
              }}>
              {localeStrings.bobLocationAllStrings.distance}
              {GlobalVariables.restId.value == items.id &&
              distanceFromLocation != 0
                ? distanceFromLocation
                : items.distance}{' '}
              {localeStrings.bobLocationAllStrings.km}
            </Text>
          ) : (
            <Text
              style={{
                marginLeft: 10,
                fontFamily: 'Helvetica',
                fontSize: 12,
                marginTop: 3,
                marginBottom : 3,
                color: '#4A4A4A',
              }}>
              {localeStrings.bobLocationAllStrings.distance}
              {GlobalVariables.restId.value == items.id &&
              distanceFromLocation != 0
                ? distanceFromLocation
                : items.distance}{' '}
              {localeStrings.bobLocationAllStrings.km}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    ));
  }

  render() {
    const GooglePlacesInput = () => {
      return (
        <GooglePlacesAutocomplete
          placeholder={localeStrings.bobLocationAllStrings.searchFor}
          minLength={2} // minimum length of text to search
          autoFocus={false}
          returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails={true}
          renderDescription={(row) => row.description} // custom description render
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            //alert(data.description);
           
            
            this.getBarLocations(
              details.geometry.location.lat,
              details.geometry.location.lng,
            );
          }}
          getDefaultValue={() => ''}
          query={{
            key: 'AIzaSyC_IedemRBZumEPDgTPLFEffui4Nz9VigU',
            language: I18nManager.isRTL ? 'he' : 'en', // language of the results
            types: 'establishment', // 'cities'geocode
          }}
          textInputProps={{
            onChangeText: (menuitem) => { 
             // alert(menuitem);
              if(menuitem != ''){
              this.getBarLocationsAsPerMenu(menuitem);
            }
          }
          }}
          styles={{
            textInputContainer: {
              width: '100%',
            },
            textInput: {
              textAlign: 'left',
            },
            description: {
              textAlign: 'left',
              justifyContent: 'flex-start',
              fontWeight: 'bold',
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            
          }}
         
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          //currentLocationLabel="Current location"
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GoogleReverseGeocodingQuery={
            {
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }
          }
          GooglePlacesSearchQuery={{
            rankby: 'distance',
            types:
              'food,street_adddress,colloquial_area,locality,sublocality,neighborhood,subpremise,park,point_of_interest,restaurant,cafe',
          }}
          filterReverseGeocodingByTypes={[
            'locality',
            'administrative_area_level_3',
          ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          //  predefinedPlaces={[homePlace, workPlace]}

          debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        />
      );
    };
    return (
      <View
        style={{
          backgroundColor: '#ebebeb',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
        }}>
        <Spinner
          color="#000"
          textContent={this.state.loadingMsg}
          visible={this.state.enterActivity}
          textStyle={{
            color: '#000',
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: -60,
          }}
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh.bind(this)}
            />
          }>
       {/* <GooglePlacesInput/> */}
          <View style={{width: '100%', height: 50, backgroundColor: 'white'}}>

          <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => this.textInput.focus()}>
                      <KeyboardAvoidingView>
                        <View
                          style={{
                            height: '100%',
                            marginTop:5,
                            marginLeft:10,
                            marginRight:10,
                          }}>
                          <TextInput
                            ref={(input) => {
                              this.textInput = input;
                            }}
                            style={{
                              color: '#4A4A4A',
                              padding:5,
                              borderBottomWidth :1.5,
                              borderLeftWidth: 1.5,
                              borderRightWidth: 1.5,
                              borderTopWidth: 1.5,
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              alignItems: 'flex-start',
                              textAlign: I18nManager.isRTL ? 'right' : 'left',
                            }}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.bobLocationAllStrings.searchFor}
                            onChangeText={(term) => {
                              this.getBarLocationsAsPerMenu(term, false);
                            }}
                          />
                        </View>
                      </KeyboardAvoidingView>
                    </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', height: 90, backgroundColor: 'white'}}>
            <View style={{justifyContent: 'flex-start'}}>
              {deviceLocale === 'he-IL' &&
              GlobalVariables.userLanguage.value === 'en-US' ? (
                <Text
                  style={{
                    color: '#4A4A4A',
                    marginLeft: 20,
                    marginTop: 10,
                    textAlign: 'right',
                    fontWeight: 'bold',
                  }}>
                  {localeStrings.bobLocationAllStrings.filterBy}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#4A4A4A',
                    marginLeft: 20,
                    marginTop: 10,
                    fontWeight: 'bold',
                  }}>
                  {localeStrings.bobLocationAllStrings.filterBy}
                </Text>
              )}
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 15,
              }}>
              <View
                style={
                  this.state.allKm ? styles.selectedKM : styles.unSelectedKm
                }>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 45,
                    width: 50,
                  }}
                  onPress={() =>
                    this.setState({
                      allKm: true,
                      eightHundred: false,
                      twoKm: false,
                      fiveKm: false,
                      tenKm: false,
                      selectedDistance: 0,
                    })
                  }>
                  <Text
                    style={
                      this.state.allKm
                        ? styles.textSelected
                        : styles.textUnselected
                    }>
                    {localeStrings.bobLocationAllStrings.any}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={
                  this.state.eightHundred
                    ? styles.selectedKM
                    : styles.unSelectedKm
                }>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 45,
                    width: 50,
                  }}
                  onPress={() =>
                    this.setState({
                      allKm: false,
                      eightHundred: true,
                      twoKm: false,
                      fiveKm: false,
                      tenKm: false,
                      selectedDistance: 0.8,
                    })
                  }>
                  <Text
                    style={
                      this.state.eightHundred
                        ? styles.textSelected
                        : styles.textUnselected
                    }>
                    {localeStrings.bobLocationAllStrings.eightHundred}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={
                  this.state.twoKm ? styles.selectedKM : styles.unSelectedKm
                }>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    height: 45,
                    width: 50,
                  }}
                  onPress={() =>
                    this.setState({
                      allKm: false,
                      eightHundred: false,
                      twoKm: true,
                      fiveKm: false,
                      tenKm: false,
                      selectedDistance: 2.0,
                    })
                  }>
                  <Text
                    style={
                      this.state.twoKm
                        ? styles.textSelected
                        : styles.textUnselected
                    }>
                    {localeStrings.bobLocationAllStrings.twoKm}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={
                  this.state.fiveKm ? styles.selectedKM : styles.unSelectedKm
                }>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 45,
                    width: 50,
                  }}
                  onPress={() =>
                    this.setState({
                      allKm: false,
                      eightHundred: false,
                      twoKm: false,
                      fiveKm: true,
                      tenKm: false,
                      selectedDistance: 5.0,
                    })
                  }>
                  <Text
                    style={
                      this.state.fiveKm
                        ? styles.textSelected
                        : styles.textUnselected
                    }>
                    {localeStrings.bobLocationAllStrings.fiveKm}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={
                  this.state.tenKm ? styles.selectedKM : styles.unSelectedKm
                }>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 45,
                    width: 50,
                  }}
                  onPress={() =>
                    this.setState({
                      allKm: false,
                      eightHundred: false,
                      twoKm: false,
                      fiveKm: false,
                      tenKm: true,
                      selectedDistance: 10.0,
                    })
                  }>
                  <Text
                    style={
                      this.state.tenKm
                        ? styles.textSelected
                        : styles.textUnselected
                    }>
                    {localeStrings.bobLocationAllStrings.tenKm}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{flex: 1, marginBottom: 10}}>
            {this.renderBarLocations(this.state.selectedDistance)}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default withNavigationFocus(BobLocationsAll);
