export class GlobalVariables {
  static orders = [];
  static cards = [];
  static slides = [];
  static orderServer = [];
  static dressings = {id: null, name: '', image: null};
  static extraDressings = {id: null, name: '', image: null, price: 0};
  static totalOrders = {value: 0};
  static userId = {value: ''};
  static userLanguage = {value: 'en-US'};
  static restId = {value: ''};
  static restCurrencyCode = {value: ''};
  static restName = {value: ''};
  static tableNumber = {value: ''};
  static checkedInLocation = {value: ''};
  static email = {value: ''};
  static clickedOrder = {value: 0};
  static CheckIn = [];
  static loggedAccountType = {value: ''}; //0-Normal Login, 1-FB Login,2-Google Login
  static shareUrl = 'https://gtbob.com/';
  // static _URL = "http://192.168.5.49:81";
  // static _URL = "https://app-api.gtbob.com"; // EU server
// static _URL = 'https://app-api2.gtbob.com'; // US server

//New Server
  static _URL = "https://appapitesting.gtbob.com:8083"
//New Server

 //  static _URL = "http://192.168.0.225:88";
  // static _URL = "http://192.168.5.49:44344";
  // static _URL = "http://192.168.0.102:8080/http://localhost:54167";
  static TEST_CHECK_IN_ENABLED = false;
  static SHOW_ADD_ICON = false; // false for pilot
  static locationDiscount = {value: ''};
  static taxRate = {value: ''};
  static checkedInLocation = {lat: '', long: ''};
  static NO_PREV_CHECK_IN = 'NO_PREV_CHECK_IN';
  static DISTANCE_FROM_CHECKED_IN_LOCATION = 0.1; // If User moves 100 metres away from the location
  static TIME_INTERVAL_FOR_LOCATION_TIMER = 60000; //One minute as requested by client in SOW

  // TA and Delivery
  static ORDER_TYPE = {
    LOCATION: 1,
    DELIVERY: 2,
    TAKE_AWAY: 3,
  };
  static selectedOrderType = this.ORDER_TYPE.LOCATION; // Default order type is Location
  static selectedAddressId = null;
  static addresses = [];
  static isLocation = () => this.selectedOrderType === this.ORDER_TYPE.LOCATION;
  static isDelivery = () => this.selectedOrderType === this.ORDER_TYPE.DELIVERY;
  static isTA = () => this.selectedOrderType === this.ORDER_TYPE.TAKE_AWAY;
  static isDeliveryAndTA = () => this.isDelivery() || this.isTA();
  static selectedLocation = {id: null, name: null};
  static isSelectedLocation = (id) => GlobalVariables.selectedLocation.id == id;
  static resetSelectedLocation = () => {
    this.selectedLocation = {id: null, name: null};
  };

  static prodName = null;
  // Properties and addons
  static selectedProperties = {};
  static selectedAddOns = {};
  static resetPropertiesAndAddOns = () => {
    this.selectedProperties = {};
    this.selectedAddOns = {};
  };
  static labelchange = 0;

  // Distance
  static isValidLocation = (curr) =>
    curr <= this.DISTANCE_FROM_CHECKED_IN_LOCATION;

  // Language helpers
  static isHe = () => this.userLanguage.value === 'he-IL';
  static isEn = () => !this.isHe();
}
