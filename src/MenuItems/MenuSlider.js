import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  I18nManager,
  AsyncStorage,
  KeyboardAvoidingView,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {GlobalVariables} from '../GlobalVariables';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import GPSState from 'react-native-gps-state';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
const {height} = Dimensions.get('window');
const {width} = Dimensions.get('window');
let distfromBottomAndroid,
  BarId = '';
console.log(height);
if (height <= 640) {
  distfromBottomAndroid = 200;
} else if (height > 640 && height <= 732) {
  distfromBottomAndroid = 150;
} else if (height > 732 && height <= 740) {
  distfromBottomAndroid = 145;
} else if (height > 740 && height < 760) {
  distfromBottomAndroid = 160;
} else if (height > 760) {
  distfromBottomAndroid = 150;
}
var discountAmount,
  discountPercent,
  taxAmount,
  taxPercent = '';
let allInfo = [];
let startPrice,
  amountWithTax = null;
let ImageWidth = width * 0.2;
let ImageHeight = width * 0.2;
let LenghtObj = [];
let AllProducts = [],
  MainCategory = [],
  SubCategory = [],
  SubSubCategory = [];
var total = 0,
  savedIDBar = 0,
  thisBarID = '',
  userCheckedIn = 0,
  subTotal = 0;

import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from '../../res/styles/LocaleStyles';
import DeviceInfo from 'react-native-device-info';
import {Button} from 'react-native-vector-icons/Zocial';
import {locales} from 'moment';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
const deviceLocale = DeviceInfo.getDeviceLocale();
export default class MenuSlider extends React.Component {
  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      payClick: 0,
      isCheckIn: false,
      Title: localeStrings.menuSliderStrings.all,
      savedBarId: '',
      TitleBehind: localeStrings.menuSliderStrings.addItems,
      totalOrders: localeStrings.menuSliderStrings.addItems,
      IsCheckinModalVisible: false,
      modalVisible: false,

      enterActivity: true,
      itemsSearching: [],
      mainCategoryItems: [],
      subCategoryItems: [],
      subsubCategoryItems: [],

      indexMainCategory: 0,
      indexSubCategory: null,
      indexSubSubCategory: null,

      menuSliderVisible: true,
      textVisibleArea: true,
      imageArrow: require('../../res/images/downArrow.png'),
      searchTerm: '',
      isActiveSearchInput: true,

      subCategBool: false,
      subsubCategBool: false,
      toScroll: true,
      scrollMarginTop: '0%',
    };
    this.setState({IsCheckinModalVisible: false});

    this.handler = this.handler.bind(this);
    AsyncStorage.getItem('LocationDiscountPercent')
      .then((value) => {
        GlobalVariables.locationDiscount.value = value;
      })
      .done();
  }

  UNSAFE_componentWillMount() {
    let that = this;
    const {top, bottom} = this.props.draggableRange;
    this._draggedValue = new Animated.Value(top, bottom);

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        that.setState({
          toScroll: false,
          scrollMarginTop: e.endCoordinates.height,
        });
      },
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        that.setState({toScroll: true, scrollMarginTop: '0%'});
      },
    );
  }

  componentDidMount() {
    GlobalVariables.clickedOrder.value = 0;
    let resName = this.params.nameBar;
    AsyncStorage.getItem('savedBarId')
      .then((value) => {
        thisBarID = value;
      })
      .done();
    this.props.navigation.addListener('didFocus', (payload) => {
      thisBarID = this.params.barId;
      this.getAllProducts(this.params.barId);
      this.getMainCategories();
    });
    if (this.params.nameBar === undefined) {
      resName = localeStrings.menuSliderStrings.ourRestaurant;
    }
    if (this.params.showWelcome) {
      setTimeout(() => {
        Alert.alert(
          localeStrings.menuSliderStrings.welcomeTo + resName,
          localeStrings.menuSliderStrings.weHope,
          [
            {
              text: localeStrings.menuSliderStrings.thankYou,
              onPress: () => console.log('Ok'),
            },
          ],
          {cancelable: false},
        );
      }, 1300);
    }
    this.props.navigation.setParams({handleSave: this.payOrder.bind(this)});
    this.props.navigation.setParams({handleSave1: this.goBack.bind(this)});
    this.getRestID();
    this.showCheckIn();
  }

  componentDidUpdate(prevProps) {
    this.params = this.props.navigation.state.params;
    // Removed for better performance
    // if (prevProps.isFocused !== this.props.isFocused) {
    //     if (this.props.isFocused) {
    //         this.getAllProducts(this.params.barId);
    //         this.getMainCategories();
    //         this.setState({
    //             enterActivity: false
    //         });
    //     }
    // }
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: localeStrings.menuSliderStrings.menu,
      headerStyle: {
        backgroundColor: '#26466c',
        borderBottomWidth: 0,
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
      },

      headerRight: (
        <TouchableOpacity
          onPress={() => {
            AsyncStorage.getItem('checkIn')
              .then((checkedIn) => {
                if (
                  (checkedIn === 'true' && savedIDBar == thisBarID) ||
                  GlobalVariables.isDeliveryAndTA()
                ) {
                  // To prevent pay for not checked in restaurants
                  //if(this.params.barId.toString() == GlobalVariables.checkedInLocation.value){
                  if (1) {
                    GlobalVariables.clickedOrder.value += 1;
                    navigation.state.params.handleSave();
                  } else {
                    alert(localeStrings.barLocationStrings.youAreTooFar);
                  }
                } else {
                  alert(localeStrings.barLocationStrings.checkInToPay);
                }
              })
              .done();
          }}
          style={{
            width: 100,
            height: 45,
            justifyContent: 'center',
            alignItems: 'flex-end',
            alignSelf: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Helvetica',
              fontSize: 16,
              color: 'white',
              marginRight: 5,
            }}>
            {localeStrings.menuSliderStrings.pay}
          </Text>
        </TouchableOpacity>
      ),
      headerLeft: (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => {
              navigation.state.params.handleSave1();
            }}
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
        </View>
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

  // _incrementCount() {
  //     this.setState({
  //         payClick: this.state.payClick + 1
  //     });
  // }

  handler() {
    this.state.TitleBehind =
      localeStrings.menuSliderStrings.youHave +
      GlobalVariables.orders.length +
      localeStrings.menuSliderStrings.itemInList;
    this.updateTotalOrders(this.state.TitleBehind);
  }

  showCheckIn() {
    AsyncStorage.getItem('checkIn')
      .then((value) => {
        if (value == 'true') {
          userCheckedIn = value;
          this.setState({isCheckIn: true});
        } else {
          userCheckedIn = 'false';
          this.setState({isCheckIn: false});
        }
        AsyncStorage.getItem('locationDiscount')
          .then((lDiscount) => {
            GlobalVariables.locationDiscount.value = Number(lDiscount);
          })
          .done();
        AsyncStorage.getItem('restCurrCode')
          .then((value) => {
            GlobalVariables.restCurrencyCode.value = value;
          })
          .done();
      })
      .done();
  }

  getRestID() {
    AsyncStorage.getItem('savedBarId')
      .then((savedBarId) => {
        savedIDBar = savedBarId;
      })
      .done();
  }

  updateTotalOrders(orders) {
    this.setState({totalOrders: orders});
  }

  payOrder() {
    if (GlobalVariables.orders.length === 0) {
      alert(localeStrings.menuSliderStrings.youDontHaveItems);
    } else {
      // console.log(this.state.payClick);
      if (GlobalVariables.clickedOrder.value === 1) {
        if (this.state.textVisibleArea == true) {
          this.setState({textVisibleArea: false});
        } else {
          this.setState({textVisibleArea: true});
        }
        this.menuVisible();
      } else {
        // this.setState({
        //     modalVisible: true
        // });
        this.addCoupon('none');
      }
    }
  }

  addCoupon(coupon) {
    const {orders, userId, selectedOrderType, ORDER_TYPE} = GlobalVariables;
    this.setState({
      modalVisible: false,
    });
    let OrderRequest = [];
    for (let i = 0; i < orders.length; i++) {
      let orderItem = {
        productId: orders[i].info.id,
        variationName: null,
        quantity: orders[i].quantity,
        dressing: orders[i].dressing,
        extraDressing: orders[i].extraDressing,
        specialInstructions: orders[i].specialInstructions,
        prodPropOptions: this._getProductPropertyIds(
          orders[i].selectedProperties,
        ),
        prodAddons: this._getProductAddOnsIds(orders[i].selectedAddOns),
      };
      OrderRequest.push(orderItem);
    }
    let nextScreen = 'Payment';
    if (selectedOrderType === ORDER_TYPE.DELIVERY) {
      nextScreen = 'DeliveryAddress';
    }
    this.props.navigation.navigate(nextScreen, {
      screen: nextScreen,
      User: userId.value,
      orderFull: OrderRequest,
      sum: total,
      subTotal: subTotal,
      coupon: coupon,
      taxAmount: taxAmount,
      taxPercent: taxPercent,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
    });
  }

  _getProductPropertyIds(properties) {
    return Object.values(properties)
      .map((p) => p.selected)
      .join(',');
  }

  _getProductAddOnsIds(addons) {
    let ids = [];
    const arr = Object.values(addons);
    for (let i = 0; i < arr.length; i++) {
      const addon = arr[i];
      for (let j = 0; j < addon.quantity; j++) {
        ids.push(addon.i);
      }
    }
    return ids.join(',');
  }

  goBack() {
    this._panel.show();

    setTimeout(() => {
      //    if(this.params.isFromScan === "true")
      //    {
      //     this.props.navigation.navigate("BarLocationScan", {
      //         screen: "BarLocationScan",
      //         barId: this.params.barId.toString(),
      //         barName: this.params.nameBar,
      //         lat: this.params.itemslat,
      //         long:this.params.itemslong
      //         })
      //    }

      this.enableGPS(() => {
        this.props.navigation.navigate('BarLocation', {
          screen: 'BarLocation',
          barId: this.params.barId.toString(),
          tableNumber: this.params.tableNumber.toString(),
          barName: this.params.nameBar,
        });
      });
    }, 750);

    // }
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
        case GPSState.AUTHORIZED_WHENINUSE:
          if (fnCallback) {
            fnCallback();
          }
          break;
      }
    });
  }

  menuVisible() {
    if (this.state.menuSliderVisible) {
      this.setState({
        imageArrow: require('../../res/images/upArrow.png'),
        menuSliderVisible: false,
      });
      this._panel.hide();
    } else {
      this.setState({
        imageArrow: require('../../res/images/downArrow.png'),
        menuSliderVisible: true,
      });

      this._panel.show();
    }
  }

  renderMainCategories() {
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingLeft: 5,
          paddingRight: 5,
          flex: 1,
        }}>
        {this.state.mainCategoryItems.map((items, index) => (
          <View key={index} style={{flex: 1}}>
            <View
              style={{
                borderRadius: ImageWidth / 2,
                width: ImageWidth,
                height: ImageHeight,
                borderColor: items.color,
                borderWidth: 1,
                flexWrap: 'wrap',
                marginTop: 15,
                marginLeft: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={
                  this.state.indexMainCategory === index
                    ? {
                        backgroundColor: items.color,
                        borderColor: 'white',
                        borderRadius: (ImageWidth - 2) / 2,
                        width: ImageWidth - 2,
                        height: ImageHeight - 2,
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    : {
                        backgroundColor: items.color,
                        borderColor: items.color,
                        borderRadius: ImageWidth / 2,
                        width: ImageWidth,
                        height: ImageHeight,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                }
                onPress={() => {
                  this.setState({
                    isActiveSearchInput: false,
                    indexMainCategory: index,
                    indexSubCategory: null,
                    indexSubSubCategory: null,
                    Title: items.name,
                    subCategoryID: items.id,
                    subCategBool: false,
                  });
                  this.searchUpdated(items.name, true);
                }}>
                <Image
                  style={{
                    resizeMode: 'contain',
                    width: 45,
                    height: 45,
                    alignSelf: 'center',
                  }}
                  source={{uri: items.image}}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                marginTop: 5,
                marginLeft: 5,
                marginRight: 5,
                fontFamily: 'Helvetica',
                fontSize: 11,
                maxWidth: ImageWidth,
              }}>
              {items.name}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  renderSubCategory() {
    if (this.state.indexMainCategory === 0) {
      return <View />;
    } else {
      if (!this.state.subCategBool) {
        this.getSubCategories(this.state.subCategoryID);
      }

      return (
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: 5,
            paddingRight: 5,
            flex: 1,
            width: height > width ? height : width,
          }}>
          {this.state.subCategoryItems.map((items, index) => (
            <View
              key={index}
              style={{marginLeft: 15, justifyContent: 'flex-end'}}>
              <TouchableOpacity
                style={
                  this.state.indexSubCategory === index
                    ? PageStyles.roundCircleCategory
                    : PageStyles.roundCircleCategorySelected
                }
                onPress={() => {
                  this.setState({
                    indexSubCategory: index,
                    indexSubSubCategory: null,
                    SubSubSubCategoryID: items.id,
                    isActiveSearchInput: false,
                    Title: items.name,
                    subsubCategBool: false,
                  });
                  this.searchUpdated(items.name, true);
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    marginTop: 5,
                    marginLeft: 5,
                    marginRight: 5,
                    fontFamily: 'Helvetica',
                    fontSize: 13,
                  }}>
                  {items.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }
  }

  renderSubSubCategory() {
    if (this.state.indexSubCategory === null) {
      return <View style={{height: 0}} />;
    } else {
      if (!this.state.subsubCategBool) {
        this.getSubSubCategories(this.state.SubSubSubCategoryID);
      }

      return (
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: 5,
            paddingRight: 5,
            flex: 1,
            marginTop: 8,
          }}>
          {this.state.subsubCategoryItems.map((items, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                this.setState({
                  Title: items.name,
                  indexSubSubCategory: index,
                  isActiveSearchInput: false,
                });
                this.searchUpdated(items.name, true);
              }}
              style={
                this.state.indexSubSubCategory === index
                  ? PageStyles.selectedSubSubSubCategory
                  : PageStyles.UnselectedSubSubSubCategory
              }>
              <Text>{items.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  }

  checkAndAdd(arr, name) {
    const {_URL} = GlobalVariables;
    const {length} = arr;
    const id = length + 1;
    const found = arr.some((el) => el.name === name);
    if (!found)
      arr.push({
        ca: [],
        color: '#FF8D36',
        id: 12767,
        image: `${_URL}/user-content/1458b710-7b0f-4f52-9ee2-276efbb7943c.png`,
        name: name,
      });
    return arr;
  }

  handleOnPress() {
    setTimeout(() => {
      if (this.state.textVisibleArea == true) {
        this.setState({textVisibleArea: false});
      } else {
        this.setState({textVisibleArea: true});
      }
      this.menuVisible();
    }, 300);
  }

  getAllProducts(barId) {
    const {_URL, selectedOrderType, userLanguage} = GlobalVariables;
    // const url = `${_URL}/categories/${barId}/products/${userLanguage.value}`;
    const url = `${_URL}/categories/${barId}/products/${selectedOrderType}/${userLanguage.value}`;

    // this.setState({
    //     enterActivity: true
    // });
    try {
      fetch(url, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response !== '') {
            AllProducts = [];
            GlobalVariables.taxRate.value = response[0].r;
            for (let i = 0; i < response.length; i++) {
              let dataItem = {
                id: response[i].i,
                name: response[i].n,
                description: response[i].d,
                image: `${_URL}/${response[i].t}`,
                price: response[i].p + response[i].x,
                taxAmount: response[i].x,
                taxPercent: response[i].r,
                skanCode: response[i].sku,
                categories: response[i].c,
                extras: response[i].e,
                restCurrencyCode: this.params.restCurrencyCode,
              };
              AllProducts.push(dataItem);
            }

            this.setState({
              imageArrow: require('../../res/images/downArrow.png'),
              menuSliderVisible: true,
              itemsSearching: AllProducts,
              enterActivity: false,
            });
            this._panel.show();
          }
        })
        .catch((error) => {
          this.setState({enterActivity: false});
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
      this.setState({enterActivity: false});
    }
  }

  getMainCategories() {
    try {
      fetch(
        GlobalVariables._URL +
          '/categories/main/' +
          (this.params.barId
            ? this.params.barId
            : GlobalVariables.restId.value) +
          '/' +
          GlobalVariables.userLanguage.value,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        },
      )
        .then((response) => response.json())
        .then((response) => {
          MainCategory = [];
          if (response !== '') {
            for (let i = 0; i < response.length; i++) {
              let dataItem = {
                id: response[i].i,
                name: response[i].n,
                image: GlobalVariables._URL + '/' + response[i].t,
                color: response[i].co,
                ca: response[i].ca,
              };
              MainCategory.push(dataItem);
            }
            this.checkAndAdd(MainCategory, localeStrings.menuSliderStrings.all);

            for (let i = 0; i < MainCategory.length; i++) {
              if (
                MainCategory[i].name === localeStrings.menuSliderStrings.all
              ) {
                let movingItem = MainCategory[i];
                MainCategory.splice(i, 1);
                MainCategory.splice(0, 0, movingItem);
              }
            }

            this.setState({
              mainCategoryItems: MainCategory,
              enterActivity: false,
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

  getSubCategories(idSubCategory) {
    try {
      if (GlobalVariables.restId.value != '') {
        BarId = GlobalVariables.restId.value;
      }
      fetch(
        GlobalVariables._URL +
          '/categories/subcateg/' +
          idSubCategory +
          '/' +
          BarId +
          '/' +
          GlobalVariables.userLanguage.value,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        },
      )
        .then((response) => response.json())
        .then((response) => {
          SubCategory = [];
          if (response !== '') {
            for (let i = 0; i < response.length; i++) {
              let dataItem = {
                id: response[i].i,
                name: response[i].n,
                ca: response[i].ca,
              };
              SubCategory.push(dataItem);
            }

            this.setState({subCategoryItems: SubCategory, subCategBool: true});
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  getSubSubCategories(idSubSubCategory) {
    try {
      fetch(
        GlobalVariables._URL +
          '/categories/subcateg/' +
          idSubSubCategory +
          '/' +
          GlobalVariables.userLanguage.value,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        },
      )
        .then((response) => response.json())
        .then((response) => {
          SubSubCategory = [];

          if (response !== '') {
            for (let i = 0; i < response.length; i++) {
              let dataItem = {
                id: response[i].i,
                name: response[i].n,
                ca: response[i].ca,
              };
              SubSubCategory.push(dataItem);
            }

            this.setState({
              subsubCategoryItems: SubSubCategory,
              subsubCategBool: true,
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

  CancelBtn() {
    this.setState({
      searchTerm: '',
      isActiveSearchInput: false,
    });
    this.textInput.clear();
    this.searchUpdated('', false);
    Keyboard.dismiss();
    this.setState({toScroll: true, scrollMarginTop: '0%'});
  }

  searchUpdated(term, inputBool) {
    this.setState({
      searchTerm: term,
      isActiveSearchInput: true,
    });

    if (term === '' || term === localeStrings.menuSliderStrings.all) {
      this.setState({itemsSearching: AllProducts});
    } else if (inputBool) {
      let filterItem = AllProducts.filter(function (itemsSearch) {
        for (let i = 0; i < itemsSearch.categories.length; i++) {
          if (
            itemsSearch.categories[i].n
              .toLowerCase()
              .indexOf(term.toLowerCase()) > -1
          ) {
            return (
              itemsSearch.categories[i].n
                .toLowerCase()
                .indexOf(term.toLowerCase()) > -1
            );
          }
        }
      });
      this.setState({itemsSearching: filterItem});
    } else {
      this.state.indexMainCategory = 0;
      this.state.indexSubCategory = null;
      this.state.indexSubSubCategory = null;
      this.state.Title = localeStrings.menuSliderStrings.all;
      let filterItem = AllProducts.filter(function (itemsSearch) {
        return itemsSearch.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
      });
      this.setState({itemsSearching: filterItem});
    }
  }

  _keyExtractor = (item, index) => index.toString();

  _renderItem = ({item}) => (
    <MyListItem
      navigation={this.props.navigation}
      itemFullData={item}
      itemId={item.id}
      itemName={item.name}
      itemDescription={item.description}
      itemPrice={item.price}
      itemImage={item.image}
      itemSkanCode={item.skanCode}
      itemCategories={item.categories}
      itemExtras={item.extras}
      itemrestCurrencyCode={item.restCurrencyCode}
    />
  );

  static defaultProps = {
    draggableRange: {
      top: height / 1.08,
      bottom: distfromBottomAndroid,
    },
  };

  render() {
    if (GlobalVariables.orders.length > 0) {
      this.state.totalOrders =
        localeStrings.menuSliderStrings.youHave +
        ' ' +
        GlobalVariables.orders.length +
        ' ' +
        localeStrings.menuSliderStrings.itemInList;
    }

    return (
      <View style={{height: '100%'}}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            flexDirection: 'column',
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
            }}>
            <Text style={{color: 'black'}}>{this.state.totalOrders}</Text>
          </View>

          <ScrollView>
            <BackMenu handler={this.handler} />
          </ScrollView>
        </View>
        <Modal
          animationType="fade"
          visible={this.state.modalVisible}
          transparent={true}
          style={styles.modal}>
          <View style={PageStyles.modalFirstView}>
            <View style={PageStyles.modalSecondView}>
              <TouchableOpacity
                onPress={() => {
                  this.addCoupon('none');
                }}
                style={PageStyles.modalCloseButton}>
                <Text style={{fontSize: 22, color: 'gray', fontWeight: 'bold'}}>
                  X
                </Text>
              </TouchableOpacity>

              <Image
                source={require('../../res/images/coupon1.png')}
                resizeMode="cover"
                style={PageStyles.modalImage}></Image>

              <View style={PageStyles.modalCenterText}>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'gray',
                    fontWeight: 'bold',
                  }}>
                  Happy hour!
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'black',
                    marginTop: '15%',
                    textAlign: 'center',
                  }}>
                  Use coupon for 15% discount on your every order!
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'black',
                    marginTop: '15%',
                    textAlign: 'center',
                  }}>
                  Coupon No.#213675
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.addCoupon('test1');
                  }}
                  style={PageStyles.modalInviteButton}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 17,
                      color: 'white',
                    }}>
                    Add coupon
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <SafeAreaView>
          <SlidingUpPanel
            ref={(c) => (this._panel = c)}
            animatedValue={this._draggedValue}
            draggableRange={this.props.draggableRange}
            showBackdrop={false}
            allowDragging={false}
            allowMomentum={true}>
            {/* <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-550}> */}
            {/* <ScrollView scrollEnabled={this.state.toScroll} style={{ width: "100%", height: "100%" }} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled"> */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                marginTop: this.state.scrollMarginTop,
              }}>
              {this.state.textVisibleArea ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  <Text style={{color: 'black'}}>{this.state.totalOrders}</Text>
                </View>
              ) : (
                <Text />
              )}

              <Spinner color="#000" visible={this.state.enterActivity} />

              <View style={{flexDirection: 'column', flex: 1}}>
                <View
                  style={{
                    height: 1,
                    borderBottomColor: 'black',
                    borderWidth: 0.5,
                    marginTop: 0,
                    width: '100%',
                  }}
                />
                <TouchableOpacity
                  style={{
                    height: 80,
                    width: 65,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this.handleOnPress()}>
                  <Image
                    style={{resizeMode: 'contain', width: 35, height: 40}}
                    source={this.state.imageArrow}
                  />
                </TouchableOpacity>

                {/*//todo: Need to prevent the scrolling of Search bar on click(Bug from before making the changes)*/}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <View
                    style={{
                      width: '75%',
                      height: 45,
                      backgroundColor: '#D8D8D8',
                      borderRadius: 10,
                      marginLeft: 15,
                      flexDirection: 'row',
                    }}>
                    <Image
                      style={styles.searchImg}
                      source={require('../../res/images/searchIcon.png')}
                    />
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{
                        width: '75%',
                        height: '100%',
                      }}
                      onPress={() => this.textInput.focus()}>
                      <KeyboardAvoidingView>
                        <View
                          style={{
                            height: '100%',
                          }}>
                          <TextInput
                            ref={(input) => {
                              this.textInput = input;
                            }}
                            style={{
                              color: '#4A4A4A',
                              fontFamily: 'Helvetica',
                              fontSize: 14,
                              marginLeft: 15,
                              alignItems: 'flex-start',
                              textAlign: I18nManager.isRTL ? 'right' : 'left',
                            }}
                            placeholderTextColor="#4A4A4A"
                            placeholder={localeStrings.menuSliderStrings.search}
                            onChangeText={(term) => {
                              this.searchUpdated(term, false);
                            }}
                          />
                        </View>
                      </KeyboardAvoidingView>
                    </TouchableOpacity>

                    {/*<TouchableOpacity*/}
                    {/*    onPress={() => this.props.navigation.navigate("BarCodeScannerComponent", {screen: "BarCodeScannerComponent"})}*/}
                    {/*    style={{height: 45, justifyContent: "center", alignItems: "center", width: 45}}>*/}
                    {/*    <Image style={{*/}
                    {/*        marginRight: 25,*/}
                    {/*        resizeMode: "contain",*/}
                    {/*        width: 25,*/}
                    {/*        height: 25,*/}
                    {/*        marginLeft: 15,*/}
                    {/*        alignSelf: "center"*/}
                    {/*    }}*/}
                    {/*           source={require('../../res/images/searchPhoto.png')}/>*/}
                    {/*</TouchableOpacity>*/}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      this.CancelBtn();
                    }}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 45,
                      width: '25%',
                    }}>
                    <Text
                      style={{
                        color: '#007AFF',
                        fontFamily: 'Helvetica Bold',
                        fontSize: 17,
                        marginRight: 8,
                      }}>
                      {localeStrings.menuSliderStrings.cancel}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {this.renderMainCategories()}
                  </ScrollView>

                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {this.renderSubCategory()}
                  </ScrollView>

                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {this.renderSubSubCategory()}
                  </ScrollView>
                </View>

                <View
                  style={{
                    backgroundColor: '#D8D8D8',
                    height: 35,
                    marginTop: 12,
                    justifyContent: 'center',
                  }}>
                  {deviceLocale === 'he-IL' &&
                  GlobalVariables.userLanguage.value === 'en-US' ? (
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: 15,
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                        textAlign: 'right',
                      }}>
                      {this.state.Title}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: 15,
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                      }}>
                      {this.state.Title}
                    </Text>
                  )}
                </View>

                <View style={{flex: 1, marginBottom: 30}}>
                  <ScrollView
                    scrollEnabled={this.state.toScroll}
                    style={{width: '100%', height: '100%'}}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled">
                    <FlatList
                      updateCellsBatchingPeriod={100}
                      maxToRenderPerBatch={10}
                      legacyImplementation={true}
                      removeClippedSubviews={true}
                      initialNumToRender={10}
                      keyExtractor={this._keyExtractor}
                      data={this.state.itemsSearching}
                      renderItem={this._renderItem}
                    />
                  </ScrollView>
                </View>
              </View>
            </View>
            {/* </ScrollView> */}

            {/* </KeyboardAvoidingView> */}
          </SlidingUpPanel>
        </SafeAreaView>
      </View>
    );
  }
}

class MyListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      IsCheckinModalVisible: false,
    };
    this.params = this.props.navigation.state.params;
    this.state = this.props.navigation.state;
    this.props = this.props.navigation;
    this.setState({IsCheckinModalVisible: false});
    let ct = 0;
  }

  addItemInMenu() {
    GlobalVariables.orders.push({
      info: this.props.itemFullData,
      quantity: 1,
      taxAmount: this.props.itemFullData.taxAmount,
      taxPercent: this.props.itemFullData.taxPercent,
      rawPrice: Number(this.props.itemFullData.price),
      price: Number(this.props.itemFullData.price),
      dressing: false,
      extraDressing: false,
      specialInstructions: null,
    });
    GlobalVariables.totalOrders.value += 1;
    AsyncStorage.setItem('savedOrders', JSON.stringify(GlobalVariables.orders));
  }

  showCheckIn() {
    AsyncStorage.getItem('checkIn')
      .then((value) => {
        if (value == 'true') {
          userCheckedIn = value;
          this.setState({isCheckIn: true});
          AsyncStorage.getItem('restCurrCode')
            .then((value) => {
              GlobalVariables.restCurrencyCode.value = value;
            })
            .done();
        } else {
          userCheckedIn = 'false';
          this.setState({isCheckIn: false});
        }
      })
      .done();
  }

  getRestID() {
    AsyncStorage.getItem('savedBarId')
      .then((savedBarId) => {
        savedIDBar = savedBarId;
      })
      .done();
  }

  componentDidMount() {
    setTimeout(() => {
      AsyncStorage.getItem('savedBarId')
        .then((value) => {
          BarId = this.params.barId;
        })
        .done();
    }, 1000);
    this.setState({IsCheckinModalVisible: false});
    this.getRestID();
    this.showCheckIn();
    allInfo = this.props.itemFullData;
    this.props.navigation.addListener('didFocus', (payload) => {
      this.params = this.props.navigation.state.params;
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      if (this.props.isFocused) {
        this.params = this.props.navigation.state.params;
      }
    }
  }

  render() {
    let LastIndex = this.props.itemCategories.length - 1;
    let LastCategory = this.props.itemCategories[LastIndex].n;
    AsyncStorage.getItem('checkIn')
      .then((checkedIn) => {
        checkedIn === 'true'
          ? this.setState({isCheckIn: true})
          : this.setState({isCheckIn: false});
      })
      .done();
    return (
      <TouchableOpacity
        onPress={() => {
          //this.ct = 0;
          AsyncStorage.getItem('checkIn')
            .then((checkedIn) => {
              if (checkedIn === 'true' || GlobalVariables.isDeliveryAndTA()) {
                this.props.navigation.navigate('DetailsItem', {
                  name: 'DetailsItem',
                  productData: this.props.itemFullData,
                  productType: LastCategory,
                  barId: this.params.barId,
                  restCurrencyCode: this.props.itemrestCurrencyCode,
                });
              } else {
                this.setState({IsCheckinModalVisible: true});
              }
            })
            .done();
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          marginTop: 5,
          borderBottomColor: '#4A4A4A',
          borderBottomWidth: 0.5,
        }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            marginLeft: 15,
            marginTop: 5,
          }}>
          <View
            style={{flexDirection: 'column', width: '55%', marginBottom: 4}}>
            {deviceLocale === 'he-IL' &&
            GlobalVariables.userLanguage.value === 'en-US' ? (
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                  textAlign: 'right',
                }}>
                {this.props.itemName}
              </Text>
            ) : (
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                }}>
                {this.props.itemName}
              </Text>
            )}

            {deviceLocale === 'he-IL' &&
            GlobalVariables.userLanguage.value === 'en-US' ? (
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                  textAlign: 'right',
                }}>
                {this.props.itemDescription}
              </Text>
            ) : (
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                }}>
                {this.props.itemDescription}
              </Text>
            )}

            {I18nManager.isRTL ? (
              <Text
                style={{
                  color: '#4A4A4A',
                  fontSize: 14,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                  textAlign: 'left',
                }}>
                ₪ {this.props.itemPrice}
              </Text>
            ) : GlobalVariables.userLanguage.value === 'he-IL' ? (
              <Text
                style={{
                  color: '#4A4A4A',
                  fontSize: 14,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                  textAlign: 'left',
                }}>
                {this.props.itemPrice} {GlobalVariables.restCurrencyCode.value}
              </Text>
            ) : (
              <Text
                style={{
                  color: '#4A4A4A',
                  fontSize: 14,
                  fontFamily: 'Helvetica',
                  marginTop: 4,
                }}>
                {this.props.itemPrice} {GlobalVariables.restCurrencyCode.value}
              </Text>
            )}
          </View>

          <View
            style={{
              width: '40%',
              height: 100,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
            <Image
              style={{resizeMode: 'contain', width: 85, height: 87}}
              source={{uri: this.props.itemImage}}
            />

            {this.state.isCheckIn === true &&
            savedIDBar == thisBarID &&
            GlobalVariables.SHOW_ADD_ICON ? (
              <TouchableOpacity
                onPress={() => {
                  this.addItemInMenu();
                  this.props.navigation.navigate('MenuSlider', {
                    screen: 'MenuSlider',
                  });
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 50,
                    marginLeft: 15,
                    marginRight: 4,
                  }}>
                  <Image
                    style={{
                      width: 22,
                      height: 22,
                    }}
                    source={require('../../res/images/plus.png')}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>

          <Modal
            transparent={true}
            animationType="fade"
            style={styles.modal}
            visible={this.state.IsCheckinModalVisible}>
            <View style={styles.modalFirstView}>
              <View
                style={{
                  marginTop: '10%',
                  backgroundColor: 'white',
                  width: 250,
                  height: 255,
                  borderRadius: 3,
                }}>
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
                      height: '205%',
                      margin: 0,
                      top: '-4%',
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
      </TouchableOpacity>
    );
  }
}

class BackMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Order: GlobalVariables.orders,
      minusDelete: '-',
      subTotal: 0,
      Total: 0,
      LocationDiscount: GlobalVariables.locationDiscount.value,
      restCurrencyCode: this.props.restCurrencyCode,
    };
  }

  quantityAdd(index) {
    let numberAdd = this.state.Order[index].quantity + 1;
    this._addOnsQuantityUpdate(index, numberAdd);
    this.state.Order[index].quantity = numberAdd;
    this.state.Order[index].price =
      this.state.Order[index].rawPrice * numberAdd;
    GlobalVariables.orders[index].quantity = numberAdd;
    this.setState({
      newOrder: true,
    });
  }

  quantityMinus(index) {
    AsyncStorage.setItem('savedOrders', '');
    if (this.state.Order[index].quantity !== 1) {
      let numberMinus = this.state.Order[index].quantity - 1;
      this._addOnsQuantityUpdate(index, numberMinus);

      this.state.Order[index].quantity = numberMinus;
      this.state.Order[index].price =
        this.state.Order[index].rawPrice * numberMinus;

      GlobalVariables.orders[index].quantity = numberMinus;

      this.setState({
        newOrder: true,
      });
    } else {
      GlobalVariables.orders.splice(index, 1);

      GlobalVariables.totalOrders.value = GlobalVariables.totalOrders.value - 1;
      this.props.handler();
      this.setState({
        newOrder: true,
      });
    }
    AsyncStorage.setItem('savedOrders', JSON.stringify(GlobalVariables.orders));
  }

  _addOnsQuantityUpdate(idx, qty) {
    const {selectedAddOns} = GlobalVariables.orders[idx];
    for (const prop in selectedAddOns) {
      if (selectedAddOns.hasOwnProperty(prop)) {
        const curr = selectedAddOns[prop];
        const newQty = curr.isFree ? 0 : qty;
        const cost = curr.pr * newQty;
        GlobalVariables.orders[idx].selectedAddOns[prop].quantity = qty;
        GlobalVariables.orders[idx].selectedAddOns[prop].cost =
          cost > 0 ? cost : 0;
      }
    }
  }

  TotalAmount(reset) {
    let calculateSum = reset;
    this.state.subTotal = reset;
    this.state.Total = reset;

    const sumAddons = (addons) => addons.reduce((p, c) => p + c.cost, 0);

    if (this.state.Order.length > 0) {
      for (let i = 0; i < this.state.Order.length; i++) {
        calculateSum += Number(this.state.Order[i].price);
        calculateSum += Number(
          sumAddons(Object.values(this.state.Order[i].selectedAddOns)),
        );
      }
      this.state.subTotal = calculateSum;
      // this.state.vat =
      //   this.state.subTotal * (this.state.Order[0].info.taxPercent / 100); // Quantity * taxAmount
      const vatPercentage = this.state.Order[0].info.taxPercent / 100;
      const vatValue = vatPercentage + 1;
      const actualValue = this.state.subTotal / vatValue;
      this.state.vat = this.state.subTotal - actualValue;
      amountWithTax = this.state.subTotal;
      this.state.LocationDiscount = (
        this.state.subTotal *
        (GlobalVariables.locationDiscount.value / 100)
      ).toFixed(2);
      discountAmount = this.state.LocationDiscount;
      discountPercent = GlobalVariables.locationDiscount.value;
      taxAmount = this.state.vat;
      taxPercent = this.state.Order[0].info.taxPercent;
    }
    //this.state.Total = calculateSum + 6.2;
    this.state.Total = amountWithTax - Number(this.state.LocationDiscount); //+ 1.2;
    total = this.state.Total;
    subTotal = this.state.subTotal;
    return (
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            flexDirection: 'row',
            width: '50%',
            marginBottom: 220,
            justifyContent: 'flex-start',
          }}>
          <View
            style={{
              flexDirection: 'column',
              marginLeft: 15,
            }}>
            <Text
              style={{
                fontFamily: 'Helvetica',
                fontSize: 15,
                //textAlign:I18nManager.isRTL? "left":"left"
              }}>
              {localeStrings.menuSliderStrings.subTotal}
            </Text>
            <Text
              style={{
                fontFamily: 'Helvetica',
                fontSize: 15,
                // textAlign:I18nManager.isRTL? "left":"right",
                marginTop: 8,
              }}>
              {localeStrings.menuSliderStrings.tax} (
              {GlobalVariables.taxRate.value}%)
            </Text>
            {
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  //  textAlign:I18nManager.isRTL? "left":"right",
                  marginTop: 8,
                }}>
                {localeStrings.menuSliderStrings.discount} (
                {GlobalVariables.locationDiscount.value}%)
              </Text>
            }
            <Text
              style={{
                fontFamily: 'Helvetica',
                fontSize: 15,
                marginTop: 15,
                // textAlign:I18nManager.isRTL? "left":"right"
              }}>
              {localeStrings.menuSliderStrings.total}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '50%',
            marginBottom: 220,
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              flexDirection: 'column',
              marginRight: 35,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            {I18nManager.isRTL ? (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginRight: -5,
                }}>
                ₪ {this.state.subTotal.toFixed(2)}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginRight: -5,
                }}>
                {this.state.subTotal.toFixed(2)}{' '}
                {GlobalVariables.restCurrencyCode.value}
              </Text>
            )}
            {I18nManager.isRTL ? (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginTop: 8,
                  marginRight: -5,
                }}>
                ₪ {this.state.vat.toFixed(2)}
              </Text>
            ) : (
              <Text
                style={{fontFamily: 'Helvetica', fontSize: 15, marginTop: 8}}>
                {this.state.vat.toFixed(2)}{' '}
                {GlobalVariables.restCurrencyCode.value}
              </Text>
            )}
            {I18nManager.isRTL ? (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginTop: 8,
                  marginRight: -5,
                }}>
                ₪ -{this.state.LocationDiscount}
              </Text>
            ) : (
              <Text
                style={{fontFamily: 'Helvetica', fontSize: 15, marginTop: 8}}>
                {' '}
                -{this.state.LocationDiscount}{' '}
                {GlobalVariables.restCurrencyCode.value}
              </Text>
            )}
            {I18nManager.isRTL ? (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginTop: 15,
                  fontWeight: 'bold',
                  marginRight: -5,
                }}>
                ₪ {this.state.Total.toFixed(2)}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'Helvetica',
                  fontSize: 15,
                  marginTop: 15,
                  fontWeight: 'bold',
                  marginRight: -5,
                }}>
                {this.state.Total.toFixed(2)}{' '}
                {GlobalVariables.restCurrencyCode.value}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  render() {
    if (GlobalVariables.orders.length > 0) {
      return (
        <View style={{flex: 1, width: '100%', marginTop: 10}}>
          {this.state.Order.map((items, index) => {
            const {selectedAddOns, selectedProperties} = items;
            const properties = Object.values(selectedProperties);
            const addons = Object.values(selectedAddOns);
            return (
              <View
                key={index}
                style={{
                  width: '100%',
                  flex: 1,
                  justifyContent: 'center',
                  marginTop: 15,
                  bottom: 20,
                }}>
                <View style={{flexDirection: 'row', width: '100%'}}>
                  <Image
                    style={{resizeMode: 'contain', width: 80, height: 130}}
                    source={{uri: items.info.image}}
                  />

                  <View
                    style={{
                      flexDirection: 'column',
                      marginRight: 15,
                      marginLeft: 15,
                      width: '65%',
                    }}>
                    <View style={{flexDirection: 'column'}}>
                      <Text
                        style={{
                          color: 'black',
                          marginTop: 5,
                          fontWeight: 'bold',
                          fontSize: 15,
                        }}>
                        {items.info.name}
                      </Text>
                      <Text
                        style={{
                          color: '#4A4A4A',
                          marginTop: 5,
                          fontSize: 14,
                        }}>
                        {items.info.description}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      {!items.dressing && !items.extraDressing ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            height: 45,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() => this.quantityMinus(index)}
                            style={{
                              height: 45,
                              width: 45,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                height: 35,
                                width: 45,
                                borderColor: 'black',
                                borderWidth: 0.5,
                                borderRadius: 7,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text>{this.state.minusDelete}</Text>
                            </View>
                          </TouchableOpacity>

                          <Text style={{marginLeft: 8, marginRight: 8}}>
                            {items.quantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() => this.quantityAdd(index)}
                            style={{
                              height: 45,
                              width: 45,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                marginLeft: 8,
                                marginRight: 8,
                                height: 35,
                                width: 45,
                                borderColor: 'black',
                                borderWidth: 0.5,
                                borderRadius: 7,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text>+</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            height: 45,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              marginLeft: 8,
                              marginRight: 8,
                            }}>
                            Quantity: {items.quantity}
                          </Text>
                        </View>
                      )}
                      {I18nManager.isRTL ? (
                        <Text
                          style={{
                            color: 'black',
                            marginTop: 10,
                          }}>
                          ₪ {items.price.toFixed(2)}{' '}
                          {GlobalVariables.restCurrencyCode.value}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            color: 'black',
                            marginTop: 10,
                          }}>
                          {items.price.toFixed(2)}{' '}
                          {GlobalVariables.restCurrencyCode.value}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        color: '#4A4A4A',
                        marginTop: 5,
                        fontSize: 15,
                        fontWeight: "bold",
                      }}>
                      {properties.length
                        ? localeStrings.detailItemsStrings.choiceOfDressing
                        : ''}
                    </Text>
                    {properties.map((p, idx) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-between',
                          paddingRight: 15,
                        }}
                        key={idx}>                          
                          {p.map((o, id) => (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    paddingRight: 15,
                                  }}
                                  key={id}>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 12,
                                      fontFamily: 'Helvetica',
                                      textAlign: 'left',
                                      width: '50%',
                                    }}>
                                    {o.property ? o.property.n : ''}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 12,
                                      fontFamily: 'Helvetica',
                                      textAlign: 'left',
                                      width: '50%',
                                    }}>
                                    {
                                      o.property ? o.property.lppo.find((op) => op.i === o.option.i)
                                        .n : ''
                                    }
                                  </Text>
                                </View>
                              ))}
                      </View>
                    ))}
                    <Text
                      style={{
                        color: '#4A4A4A',
                        marginTop: 5,
                        fontSize: 15,
                         fontWeight: "bold",
                      }}>
                      {addons.length
                        ? localeStrings.detailItemsStrings.extraDressing
                        : ''}
                    </Text>
                    {addons.map((a, idx) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-between',
                          paddingRight: 15,
                        }}
                        key={idx}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 12,
                            fontFamily: 'Helvetica',
                            width: '50%',
                          }}>
                          {a.n}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Helvetica',
                            textAlign: 'left',
                          }}>
                          {a.quantity}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Helvetica',
                            textAlign: 'right',
                            width: '40%',
                          }}>
                          {I18nManager.isRTL
                            ? `₪ ${a.cost.toFixed(2)}`
                            : `${a.cost.toFixed(2)} ILS`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View
                  style={{borderColor: '#4A4A4A', borderWidth: 0.5, height: 1}}
                />
              </View>
            );
          })}
          <View style={{flex: 1}}>{this.TotalAmount(0)}</View>
        </View>
      );
    } else {
      return <View />;
    }
  }
}

const PageStyles = StyleSheet.create({
  roundCircleCategory: {
    width: ImageWidth,
    height: ImageHeight,
    borderRadius: ImageWidth / 2,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFB300',
    justifyContent: 'center',
  },

  roundCircleCategorySelected: {
    width: ImageWidth,
    height: ImageHeight,
    borderRadius: ImageWidth / 2,
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
  modalFirstView: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalSecondView: {
    marginTop: '10%',
    backgroundColor: 'white',
    width: '75%',
    height: '52%',
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
  modalInviteButton: {
    marginTop: 20,
    width: '100%',
    height: 45,
    backgroundColor: '#004c6c',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
