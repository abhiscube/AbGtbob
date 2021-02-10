import {I18nManager} from 'react-native';

export const screenStyle = {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  backgroundColor: 'white',
};

export const backStyle = {
  height: 45,
  width: 45,
  justifyContent: 'center',
  alignItems: 'center',
};

export const headerStyle = {
  textAlign: 'center',
  flex: 1,
  marginHorizontal: 10,
  marginRight: 15,
  color: '#fefefe',
  fontFamily: 'Helvetica',
  fontSize: 17,
};

export const headerBackImageStyle = {
  resizeMode: 'contain',
  width: 15,
  height: 15,
  marginBottom: 5,
  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
};

export const titleWrapStyle = {
  height: 45,
  backgroundColor: 'white',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  borderColor: '#9B9B9B',
  borderWidth: 0.5,
  marginTop: 10,
  width: '90%',
  marginLeft: '5%',
  marginRight: '5%',
  borderRadius: 30,
  shadowRadius: 5,
};

export const titleTextStyle = {
  justifyContent: 'center',
  color: 'black',
  fontSize: 15,
  fontFamily: 'Helvetica',
};

export const subTitleTextStyle = {
  marginLeft: 15,
  fontSize: 13,
  fontStyle: 'italic',
  marginTop: 25,
  textAlign: 'center',
  textAlign: 'left',
};

export const addressWrapStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
  width: '100%',
  margin:5,
  alignItems: 'center',
  borderColor: '#9B9B9B',
  borderWidth: 0.5,
};

export const addressContainerStyle = {
  flex: 1,
  flexDirection: 'row',
  height: 60,
  width: '100%',
  alignItems: 'center',
};

export const addressInputContainerStyle = {
  flex: 1,
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
};

export const radioStyle = {
  justifyContent: 'center',  
  alignItems: 'center',
  marginRight: 8,
  height: 60,
};

export const radioImageStyle = {marginLeft: 10, width: 15, height: 15};

export const addressInnerContainerStyle = (width = '75%') => ({
  flexDirection: 'column',
  justifyContent: 'center',
  width: width,
});

export const addressTitleStyle = {
  fontSize: 15,
  fontStyle: 'bold',  
  marginLeft:10,

};

export const addressTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: 11,
  color: '#9B9B9B',
  textAlign: 'left',
  marginLeft:10,
};

export const deleteImageStyle = {
  height: 30,
  width: 30,
  resizeMode: 'contain',
  marginRight: 5,
  marginTop: -9,
};

export const optionTextStyle = {
  marginLeft: 15,
  fontSize: 13,
  fontStyle: 'italic',
  marginTop: 5,
  textAlign: 'center',
};

export const textInputWrapStyle = {
  backgroundColor: '#D8D8D8',
  width: '100%',
  marginBottom: 5,
};

export const textInputStyle = {
  color: 'black',
  marginLeft: 15,
  marginRight: 20,
  height: 80,
  textAlign: I18nManager.isRTL ? 'right' : 'left',
};

export const footerStyle = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  alignContent: 'center',
  alignSelf: 'center',
  backgroundColor: '#004C6C',
  height: 50,
  bottom: 0,
};

export const footerButtonStyle = {
  alignSelf: 'center',
  justifyContent: 'center',
  height: 65,
  width: '100%',
};

export const footerButtonTextStyle = {
  color: 'white',
  alignSelf: 'center',
  justifyContent: 'center',
  fontFamily: 'Helvetica',
  fontSize: 16,
};
