import {I18nManager} from 'react-native';

export const headerStyle = {
  backgroundColor: '#26466c',
  borderBottomWidth: 0,
  shadowColor: 'transparent',
  elevation: 0,
  shadowOpacity: 0,
};

export const backButtonStyle = {
  resizeMode: 'contain',
  width: 15,
  height: 15,
  marginBottom: 5,
  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
};

export const headerTitleStyle = {
  textAlign: 'center',
  flex: 1,
  alignSelf: 'center',
  color: 'white',
  fontSize: 17,
};

export const pageContainerStyle = {flex: 1, marginTop: 15};

export const footerStyle = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  alignContent: 'center',
  alignSelf: 'center',
  backgroundColor: '#004C6C',
  bottom: 0,
};

export const footerButtonStyle = {
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#004C6C',
  height: 45,
};

export const footerButtonTextStyle = {
  fontSize: 16,
  color: 'white',
  textAlign: 'center',
};

export const itemWrapStyle = {
  flexDirection: 'column',
  // height: 45,
  width: '100%',
};

export const itemStyle = {
  // height: 45,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: 5,
  marginRight: 5,
};

export const buttonsWrapStyle = {
  flexDirection: 'row',
  height: 45,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
};

export const buttonStyle = {
  height: 45,
  width: 45,
  justifyContent: 'center',
  alignItems: 'center',
};

export const buttonTextStyle = {
  height: 35,
  width: 45,
  borderColor: 'black',
  borderWidth: 0.5,
  borderRadius: 7,
  justifyContent: 'center',
  alignItems: 'center',
};

export const quantityTextStyle = {marginLeft: 8, marginRight: 8};

export const checkboxWrapStyle = {marginRight: 15, justifyContent: 'center'};

export const checkboxStyle = {
  height: 25,
  width: 25,
  borderColor: 'black',
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

export const checkboxTickStyle = {height: 15, width: 15};
