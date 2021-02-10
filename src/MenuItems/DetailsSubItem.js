import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  I18nManager,
  AsyncStorage,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {ScrollView} from 'react-native-gesture-handler';
import {GlobalVariables} from '../GlobalVariables';

let allInfo = [];
let startPrice = null;

import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from '../../res/styles/LocaleStyles';
import Modal from 'react-native-modal';
import {GoogleSignin} from 'react-native-google-signin';
import Spinner from 'react-native-loading-spinner-overlay';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class DetailsSubItem extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
        
      headerTitle: navigation.state.params.productType,
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
          onPress={() => {
            GlobalVariables.resetPropertiesAndAddOns();
            GlobalVariables.dressings.id = null;
            GlobalVariables.extraDressings.id = null;
            navigation.goBack(null);
          }}
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
      quantity: 1,
      detailsItem: [],
      itemPrice: 0,
      itemQuantity: 0,
      statusInstructions: false,
      inputOn: false,
      text: '',
      IsCheckinModalVisible: false,
      isCheckIn: false,
      toScroll: false,
      scrollMarginTop: '0%',
      specialInstructions: null,
      enterActivity: true,
      details: {
        lpp: [],
        lpa: [],
      },
    };
    allInfo = this.params.productData;
  }

  showInstructions() {
    return (
      <View
        style={{
          height: 45,
          width: '100%',
          marginLeft: 15,
          borderColor: 'red',
          borderWidth: 2,
        }}>
        <TextInput
          style={{fontFamily: 'Helvetica', fontSize: 14}}
          placeholder="Instructions"
          placeholderTextColor="#9b9b9b"
        />
      </View>
    );
  }

  UNSAFE_componentWillMount() {
    startPrice = allInfo.price;
    this.setState({
      detailsItem1: allInfo,
      itemQuantity: 1,
      itemPrice: allInfo.price,
      restCurrencyCode: allInfo.restCurrencyCode,
      statusInstructions: false,
    });
  }

  componentDidMount() {
    this.showCheckIn();
    let that = this;
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        that.setState({
          toScroll: true,
          scrollMarginTop: -e.endCoordinates.height + 100,
        });
      },
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        that.setState({toScroll: false, scrollMarginTop: '0%'});
      },
    );

    this._fetchPropertiesAndAddons();
    this._addOnsQuantityUpdate(this.state.itemQuantity);
  }

  _fetchPropertiesAndAddons() {
    const {id} =  this.params.productData;
    const {_URL, userLanguage} = GlobalVariables;
    const url = `${_URL}/categories/ProductPropsAndAddons/${id}/${userLanguage.value}`;
    fetch(url, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((details) => {
        this.setState({enterActivity: false, details});
      })
      .catch((error) => {
        console.log('error', error);
        this.setState({enterActivity: false});
      });
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

  quantityAdd() {
    let numberAdd = this.state.itemQuantity + 1;
    this._addOnsQuantityUpdate(numberAdd);
    this.setState({
      itemQuantity: numberAdd,
      itemPrice: startPrice * numberAdd,
    });
  }

  quantityMinus() {
    if (this.state.itemQuantity === 1) {
      this._addOnsQuantityUpdate(1);
      this.setState({
        itemQuantity: 1,
        itemPrice: startPrice,
      });
    } else {
      let numberMinus = this.state.itemQuantity - 1;
      this._addOnsQuantityUpdate(numberMinus);

      this.setState({
        itemQuantity: numberMinus,
        itemPrice: startPrice * numberMinus,
      });
    }
  }

  _addOnsQuantityUpdate(qty) {
    const {selectedAddOns} = GlobalVariables;
    for (const prop in selectedAddOns) {
      if (selectedAddOns.hasOwnProperty(prop)) {
        const curr = selectedAddOns[prop];
        const newQty = curr.isFree ? 0 : qty;
        const cost = curr.pr * newQty;
        GlobalVariables.selectedAddOns[prop].quantity = qty;
        GlobalVariables.selectedAddOns[prop].cost = cost > 0 ? cost : 0;
      }
    }
  }

  addItemInMenu() {
    const {selectedProperties, selectedAddOns} = GlobalVariables;

    GlobalVariables.orders.push({
      info: this.state.detailsItem,
      quantity: this.state.itemQuantity,
      rawPrice: Number(allInfo.price),
      price: Number(this.state.itemPrice),
      dressing: false,
      extraDressing: false,
      specialInstructions: this.state.specialInstructions,
      selectedProperties,
      selectedAddOns,
    });

    if (GlobalVariables.dressings.id !== null) {
      GlobalVariables.orders.push({
        info: {
          id: GlobalVariables.dressings.id,
          name: GlobalVariables.dressings.name,
          image: GlobalVariables.dressings.image,
          description: 'Dressing',
        },
        quantity: 1,
        rawPrice: Number(0),
        price: Number(0),
        dressing: true,
        extraDressing: false,
      });
      GlobalVariables.totalOrders.value += 1;
    }

    if (GlobalVariables.extraDressings.id !== null) {
      GlobalVariables.orders.push({
        info: {
          id: GlobalVariables.extraDressings.id,
          name: GlobalVariables.extraDressings.name,
          image: GlobalVariables.extraDressings.image,
          description: 'Extra dressing',
        },
        quantity: 1,
        rawPrice: Number(GlobalVariables.extraDressings.price),
        price: Number(GlobalVariables.extraDressings.price),
        dressing: false,
        extraDressing: true,
      });
      GlobalVariables.totalOrders.value += 1;
    }

    GlobalVariables.totalOrders.value += 1;
    GlobalVariables.dressings.id = null;
    GlobalVariables.extraDressings.id = null;

    GlobalVariables.resetPropertiesAndAddOns();

    AsyncStorage.setItem('savedOrders', JSON.stringify(GlobalVariables.orders));

    this.props.navigation.navigate('MenuSlider', {name: 'MenuSlider'});
  }

  _isTAandDeliveryValid() {
    const {selectedOrderType, ORDER_TYPE} = GlobalVariables;
    return (
      selectedOrderType === ORDER_TYPE.TAKE_AWAY ||
      selectedOrderType === ORDER_TYPE.DELIVERY
    );
  }

  render() {
    const {lpp, lpa} = this.state.details;
    const {selectedAddOns, selectedProperties} = GlobalVariables;
    const properties = Object.values(selectedProperties);
    const addons = Object.values(selectedAddOns);
        return (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
            }}>
            <Spinner color="#000" visible={this.state.enterActivity} />
            <ScrollView
              style={{width: '100%', height: '100%'}}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled">
              <View
                style={{
                  flex: 1,
                  marginBottom: 10,
                  marginTop: this.state.scrollMarginTop,
                }}>
               
               
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}>
                     
             </View>
  
                {!this.state.toScroll && lpp.length ? (
                  <View>
                    <View style={styles.BorderView} />
                    <TouchableOpacity
                      style={styles.TouchableCriteria}
                      onPress={() => {
                        this.props.navigation.navigate('Properties', {
                          name: 'Properties',
                          headerText:
                          localeStrings.detailItemsStrings.choiceOfDressing,
                          data: this.state.details,
                        });
                      }}>
                      <View style={styles.ViewCriteria}>
                        <Text style={styles.TextCriteria}>
                          {localeStrings.detailItemsStrings.choiceOfDressing}
                        </Text>
                        <Image
                          style={[
                            styles.ImgViewCriteria,
                            {transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]},
                          ]}
                          source={require('../../res/images/rightArrow.png')}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : null}
  
                {!this.state.toScroll && lpa.length ? (
                  <View>
                    <View style={styles.BorderView} />
                    <TouchableOpacity
                      style={styles.TouchableCriteria}
                      onPress={() => {
                        this.props.navigation.navigate('AddOns', {
                          name: 'AddOns',
                          headerText:localeStrings.detailItemsStrings.extraDressing,
                          data: this.state.details,
                          qty: this.state.itemQuantity,
                        });
                      }}>
                      <View style={styles.ViewCriteria}>
                        <Text style={styles.TextCriteria}>
                          {localeStrings.detailItemsStrings.extraDressing}
                        </Text>
                        <Image
                          style={[
                            styles.ImgViewCriteria,
                            {transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]},
                          ]}
                          source={require('../../res/images/rightArrow.png')}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : null}
  
                <View style={styles.BorderView} /> 
              </View>
            </ScrollView>
  
            <View
              style={{
                marginBottom: 0,
                height: 45,
                width: '100%',
                backgroundColor: '#004C6C',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (this._isTAandDeliveryValid()) {
                    this.addItemInMenu();
                  } else {
                    AsyncStorage.getItem('savedBarId')
                      .then((savedBarId) => {
                        if (savedBarId == this.params.barId) {
                          this.addItemInMenu();
                        } else {
                          this.setState({IsCheckinModalVisible: true});
                        }
                      })
                      .done();
                    /*if(this.params.barId == GlobalVariables.checkedInLocation.value && this.state.isCheckIn){
                                      this.addItemInMenu()
                                  }else{
                                      this.setState({IsCheckinModalVisible: true});
                                  }*/
                  }
                }}
                style={{
                  height: 45,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white'}}>
                  {localeStrings.detailItemsStrings.add}
                </Text>
              </TouchableOpacity>
            </View>
            <Modal
              transparent={true}
              animationType="fade"
              visible={this.state.IsCheckinModalVisible}
              style={styles.modal}>
              <View style={styles.modalFirstView}>
                <View style={styles.modalSecondDetailsView}>
                  <Image
                    source={require('../../res/images/popuplogo.png')}
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
                      {localeStrings.barLocationStrings.checkInToAdd}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: 'black',
                      borderStyle: 'solid',
                      //top: "-4%",
                    }}
                  />
                  <View style={styles.container}>
                    <TouchableOpacity
                      style={styles.CenterText}
                      onPress={() =>
                        this.setState({IsCheckinModalVisible: false})
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
                        height: 55,
                        margin: 0,
                      }}
                    />
                    <TouchableOpacity
                      style={styles.CenterText}
                      onPress={() => {
                        this.props.navigation.navigate('HomeScreen', {
                          screen: 'HomeScreen',
                          showCheckInModal: true,
                        });
                      }}>
                      <Text style={styles.textStyle}>
                        {localeStrings.barLocationStrings.checkIn}
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
  