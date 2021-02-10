//import Chat from "./src/ChatPages/Chat"
import {AsyncStorage} from 'react-native';
import FirstPage from './src/Firstpages/FirstPage';
import SignUp from './src/Firstpages/SignUp';
import LogIn from './src/Firstpages/LogIn';
import ForgotPassword from './src/Firstpages/ForgotPassword';
import HomeScreen from './src/HomeScreen';
import Coupons from './src/OrdersBonus/Coupons';
import BobLocationsAll from './src/Locations/BobLocationsAll';
import BarLocation from './src/Locations/BarLocation';
import ScanScreen from './src/Scanner/Scan';
import MenuSlider from './src/MenuItems/MenuSlider';
import DetailsItem from './src/MenuItems/DetailsItem';
import BarCodeScannerComponent from './src/Scanner/ScanBarCode';
import Dressing from './src/MenuItems/Dressing';
import Payment from './src/Payment/Payment';
import MenuSliderClone from './src/MenuItems/MenuSliderClone';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import OrderCompleted from './src/Payment/OrderCompleted';
import PeopleCheckIn from './src/Locations/PeopleCheckIn';
import React, {useEffect} from 'react';
import TermsWebView from './src/TermsWebView';
import PrivacyWebView from './src/PrivacyWebView';
//import  TermsWebView from 'react-native-webview';
import Orders from './src/OrdersBonus/Orders';
import OrderDetails from './src/OrdersBonus/OrderDetails';
import Paypal from './src/Paypal';
import Profile from './src/ProfileInfo/Profile';
import ChangePassword from './src/ProfileInfo/ChangePassword';
import RatingPlace from './src/Locations/RatingPlace';
import Isracard from './src/Isracard';
import HomeScreenWaiters from './src/HomeScreenWaiters';
import PushNotification from './src/PushNotification';
import SplashScreen from 'react-native-splash-screen';
import AlertDetails from './src/AlertDetails';
import WaiterAlert from './src/WaiterAlert';
import BarLocationScan from './src/Locations/BarLocationScan';
import DeliveryAddress from './src/DeliveryAddress/DeliveryAddress';
import Properties from './src/MenuItems/Properties/Properties';
import AddOns from './src/MenuItems/AddOns/AddOns';
import DetailsSubItem from './src/MenuItems/DetailsSubItem';
const RootStack = createStackNavigator(
  {
    //   Chat: {screen: Chat},
    FirstPage: {screen: FirstPage},
    SignUp: {screen: SignUp},
    LogIn: {screen: LogIn},
    ForgotPassword: {screen: ForgotPassword},
    HomeScreen: {screen: HomeScreen},
    Profile: {screen: Profile},
    ChangePassword: {screen: ChangePassword},
    Coupons: {screen: Coupons},
    Orders: {screen: Orders},
    OrderDetails: {screen: OrderDetails},
    BobLocationsAll: {screen: BobLocationsAll},
    BarLocation: {screen: BarLocation},
    PeopleCheckIn: {screen: PeopleCheckIn},
    ScanScreen: {screen: ScanScreen},
    MenuSlider: {screen: MenuSlider},
    MenuSliderClone: {screen: MenuSliderClone},
    DetailsItem: {screen: DetailsItem},
    BarCodeScannerComponent: {screen: BarCodeScannerComponent},
    Dressing: {screen: Dressing},
    Properties: {screen: Properties},
    AddOns: {screen: AddOns},
    Payment: {screen: Payment},
    DeliveryAddress: {screen: DeliveryAddress},
    OrderCompleted: {screen: OrderCompleted},
    Paypal: {screen: Paypal},
    RatingPlace: {screen: RatingPlace},
    Isracard: {screen: Isracard},
    HomeScreenWaiters: {screen: HomeScreenWaiters},
    PushNotification: {screen: PushNotification},
    TermsWebView: {screen: TermsWebView},
    PrivacyWebView: {screen: PrivacyWebView},
    BarLocationScan: {screen: BarLocationScan},
    DetailsSubItem: {screen: DetailsSubItem},
  },
  {
    initialRouteName: 'HomeScreen',

    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  },
);

const RootStackWaiter = createStackNavigator(
  {
    //   Chat: {screen: Chat},
    FirstPage: {screen: FirstPage},
    SignUp: {screen: SignUp},
    LogIn: {screen: LogIn},
    ForgotPassword: {screen: ForgotPassword},
    HomeScreen: {screen: HomeScreen},
    Profile: {screen: Profile},
    ChangePassword: {screen: ChangePassword},
    Coupons: {screen: Coupons},
    Orders: {screen: Orders},
    OrderDetails: {screen: OrderDetails},
    BobLocationsAll: {screen: BobLocationsAll},
    BarLocation: {screen: BarLocation},
    PeopleCheckIn: {screen: PeopleCheckIn},
    ScanScreen: {screen: ScanScreen},
    MenuSlider: {screen: MenuSlider},
    MenuSliderClone: {screen: MenuSliderClone},
    DetailsItem: {screen: DetailsItem},
    BarCodeScannerComponent: {screen: BarCodeScannerComponent},
    Dressing: {screen: Dressing},
    Properties: {screen: Properties},
    AddOns: {screen: AddOns},
    Payment: {screen: Payment},
    DeliveryAddress: {screen: DeliveryAddress},
    OrderCompleted: {screen: OrderCompleted},
    Paypal: {screen: Paypal},
    RatingPlace: {screen: RatingPlace},
    Isracard: {screen: Isracard},
    HomeScreenWaiters: {screen: HomeScreenWaiters},
    PushNotification: {screen: PushNotification},
    AlertDetails: {screen: AlertDetails},
    WaiterAlert: {screen: WaiterAlert},
    TermsWebView: {screen: TermsWebView},
    PrivacyWebView: {screen: PrivacyWebView},
    BarLocationScan: {screen: BarLocationScan},
    DetailsSubItem: {screen: DetailsSubItem},
  },
  {
    initialRouteName: 'HomeScreenWaiters',

    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  },
);
const Route = createAppContainer(RootStack);
const RouteWaiter = createAppContainer(RootStackWaiter);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userType: true,
    };
  }

  UNSAFE_componentWillMount() {
    AsyncStorage.getItem('role')
      .then((value) => {
        console.log(value);
        if (value !== null) {
          if (value === 'customer') {
            this.setState({userType: true});
          } else {
            this.setState({userType: false});
          }
        } else {
          this.setState({userType: true});
        }
      })
      .done();
  }

  componentDidMount() {
    this.timeoutHandle = setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }

  renderApp() {
    if (!this.state.userType) {
      return <RouteWaiter />;
    } else {
      return <Route />;
    }
  }

  render() {
    return this.renderApp();
  }
}
