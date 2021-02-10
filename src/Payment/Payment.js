import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  I18nManager,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {TextInput} from 'react-native-gesture-handler';
import {GlobalVariables} from '../GlobalVariables';
import Modal from 'react-native-modal';
import localeStrings from '../../res/strings/LocaleStrings';
import CountryPicker from 'react-native-country-picker-modal';
import ImageLoad from 'react-native-image-placeholder';
import session from '../session';
import Spinner from 'react-native-loading-spinner-overlay';

const {height} = Dimensions.get('window');
const {width} = Dimensions.get('window');
let ImageWidth = width * 0.2;
let ImageHeight = width * 0.2;
import {Button} from 'react-native-elements';

let selectedRadioButton = require('../../res/images/selectedRadioButton.png');
let unselectedRadioButton = require('../../res/images/unselectedRadioButton.png');

export default class Payment extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: localeStrings.paymentStrings.screenName,
      headerStyle: {
        backgroundColor: '#26466c',
        //paddingTop: getStatusBarHeight(),
      },

      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={{
            height: 45,
            width: 45,

            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            style={{resizeMode: 'contain', width: 15, height: 15}}
            source={require('../../res/images/back.png')}
          />
        </TouchableOpacity>
      ),
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
      orderDetailsModal: false,
      paymentMethod: 'Isracard',
      isTermsOfUse: false,
      isTips10: false,
      isTips15: false,
      remember: 1,
      sum: this.params.sum.toFixed(2),
      subTotal: this.params.subTotal,
      taxAmount: this.params.taxAmount,
      taxPercent: this.params.taxPercent,
      discountPercent: this.params.discountPercent,
      discountAmount: this.params.discountAmount,
      tip: 0,
      isCard: false,
      savedCard: false,
      isIsracardSelected: false,
      isPayPalSelected: false,
      cardSelected: '',
      totalTip: 0,
      SavedCards: '',
      removeModalVisible: false,
      selectedBuyerKey: '',
      selectedBuyerCardMask: '',
      savedBuyerCardMask: '',
      enterActivity: false,
      removeCardId: null,
    };
    AsyncStorage.getItem('LocationDiscountPercent')
      .then((value) => {
        GlobalVariables.locationDiscount.value = value;
      })
      .done();
    AsyncStorage.getItem('BuyerCardMask')
      .then((value) => {
        this.setState({savedBuyerCardMask: value});
      })
      .done();
  }
  showModal() {
    this.setState({orderDetailsModal: true});
  }

  hideModal() {
    this.setState({orderDetailsModal: false});
  }

  componentDidMount() {
    try {
      this.setState({enterActivity: true});
      var buyerKey = '';
      fetch(GlobalVariables._URL + '/Isracard/Cards/' + this.params.User, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((response) => {
          this.setState({enterActivity: false});
          if (response !== '') {
            if (response.length != 0) {
              //var len = response.length - 1;
              GlobalVariables.cards = [];
              for (let i = 0; i < response.length; i++) {
                const id = i + 1;
                buyerKey = 'aaaaaa';
                //if (i == len) {
                //if (this.state.savedBuyerCardMask == response[i].buyer_card_mask)
                GlobalVariables.cards.push({
                  id,
                  isCard: true,
                  cardMask: response[i].buyer_card_mask,
                  buyerExp: response[i].buyer_card_exp,
                  buyerName: response[i].buyer_name,
                  buyer_key: buyerKey,
                });
                //}
              }
              const firstCard = GlobalVariables.cards[0];
              if (firstCard) {
                this.setState({
                  isCard: true,
                  cardMask: firstCard.buyer_card_mask,
                  buyerExp: firstCard.buyer_card_exp,
                  buyerName: firstCard.buyer_name,
                  SavedCards: GlobalVariables.cards,
                  savedCard: true,
                  cardSelected: firstCard.id,
                });
              }
            }
          } else {
            this.setState({
              isCard: false,
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

  removeCard() {
    this.setState({isCard: false, removeModalVisible: false});
    // try {
    //     AsyncStorage.setItem("BuyerCardMask", this.state.selectedBuyerCardMask);
    //     fetch(GlobalVariables._URL + "/Isracard/Cards/Remove/" + this.params.User, {
    //         method: "POST",
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             Card: {
    //                 "buyer_key": this.state.selectedBuyerKey
    //             }
    //         })
    //     })
    //         .then(response => response.json())
    //         .then(response => {
    //             if (response === true) {
    //                 alert('Success');
    //             } else {
    //                 alert(localeStrings.forgotPasswordStrings.somethingWentWrong)
    //             }
    //             this.setState({ removeModalVisible: false });
    //         })
    //         .catch(error => {
    //             console.log("upload error", error);
    //         });
    // } catch (e) {
    //     console.error("upload catch error", e);
    // }
  }

  _deleteCard() {
    this.setState({removeModalVisible: false, enterActivity: true});
    const {removeCardId, cardSelected} = this.state;
    const {_URL, cards} = GlobalVariables;
    const {User} = this.params;
    const card = cards.find((c) => c.id === removeCardId);

    if (card) {
      const url = `${_URL}/Isracard/delete/${User}`;

      var formdata = new FormData();
      formdata.append('buyer_card_mask', card.cardMask);
      formdata.append('buyer_card_exp', card.buyerExp);
      formdata.append('buyer_name', card.buyerName);

      var requestOptions = {
        method: 'DELETE',
        body: formdata,
        redirect: 'follow',
      };

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log('result', result);
          GlobalVariables.cards = cards.filter((c) => c.id != removeCardId);
          if (removeCardId === cardSelected) {
            this.setState({cardSelected: null});
          }
          this.setState({removeCardId: null, enterActivity: false});
        })
        .catch((error) => {
          console.log('error', error);
          this.setState({enterActivity: false});
        });
    } else {
      this.setState({enterActivity: false});
    }
  }

  SendRequest(userId, requestData, type, remember) {
   // alert(remember);
    console.log("One Request Data  "+requestData);
    console.log("One Request Data  "+JSON.stringify(requestData));
    
    const {cardSelected} = this.state;
    const {
      _URL,
      selectedAddressId,
      selectedOrderType,
      isDelivery,
      cards,
    } = GlobalVariables;
    const addressId = isDelivery() ? selectedAddressId : null;
    const url = `${_URL}/customers/${userId}/add-cart-items/${selectedOrderType}/${addressId}`;
    console.log("Payment "+url)
    let totalTip = 0;
    if (this.state.isTips10) {
      totalTip = (this.state.subTotal * 10) / 100;
    } else if (this.state.isTips15) {
      totalTip = (this.state.subTotal * 15) / 100;
    } else if (this.state.tip !== 0) {
      totalTip = Number(this.state.tip);
    }
    totalTip = totalTip.toFixed(2);
    try {
      fetch(url, {
        method: 'POST',
        headers: {
          //Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response !== '') {
            // if (response[0].success) {
            if (this.state.isPayPalSelected) {
              console.log("isPayPalSelected "+remember);
              this.props.navigation.navigate('Paypal', {
                screen: 'Paypal',
                item: remember,
                tips: totalTip,
                coupon: this.params.coupon,
              });
            } else if (this.state.isIsracardSelected) {
              console.log("isIsracardSelected"+remember);
              this.props.navigation.navigate('Isracard', {
                screen: 'Isracard',
                item: remember,
                tips: totalTip,
                coupon: this.params.coupon,
              });
            } else {
              const card = cards.find((c) => c.id === cardSelected);
              console.log("Isracard"+remember);
              this.props.navigation.navigate('Isracard', {
                screen: 'Isracard',
                item: remember,
                tips: totalTip,
                coupon: this.params.coupon,
                item1: card ? card.cardMask : null,
                item2: card ? card.buyerExp : null,
                item3: card ? card.buyerName : null,
              });
            }
            // }
          }
        })
        .catch((error) => {
          console.log('upload error', error);
        });
    } catch (e) {
      console.error('upload catch error', e);
    }
  }

  UpdateRadioButtons(value) {
    if (value === 'Paypal') {
      this.setState({
        isPayPalSelected: true,
        isIsracardSelected: false,
        savedCard: false,
        paymentMethod: 'Paypal',
      });
    } else if (value === 'Isracard') {
      this.setState({
        isPayPalSelected: false,
        isIsracardSelected: true,
        savedCard: false,
        paymentMethod: 'Isracard',
      });
    } else {
      this.setState({
        isPayPalSelected: false,
        isIsracardSelected: false,
        savedCard: true,
        paymentMethod: 'SaveCard',
        cardSelected: value,
      });
    }
  }

  updateTips(value) {
    let totalTip = 0;
    let sum = Number(this.params.sum.toFixed(2));
    if (value === '10') {
      totalTip = (this.state.subTotal * 10) / 100;
      sum = Number(sum + Number(totalTip.toFixed(2))).toFixed(2);
      this.setState({
        isTips10: true,
        isTips15: false,
        tip: 0,
        totalTip: totalTip.toFixed(2),
        sum: sum,
      });
    }
    if (value === '15') {
      totalTip = (this.state.subTotal * 15) / 100;
      sum = Number(sum + Number(totalTip.toFixed(2))).toFixed(2);
      this.setState({
        isTips10: false,
        isTips15: true,
        tip: 0,
        totalTip: totalTip.toFixed(2),
        sum: sum,
      });
    }
  }

  render() {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}>
        <Spinner color="#000" visible={this.state.enterActivity} />
        <ScrollView>
          <View style={{flex: 1}}>
            <View
              style={{
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
              }}>
              <Text
                style={{
                  justifyContent: 'center',
                  color: 'black',

                  fontSize: 15,
                  fontFamily: 'Helvetica',
                }}>
                {this.state.isCard
                  ? localeStrings.paymentStrings.chooseOption
                  : localeStrings.paymentStrings.addMethod}
              </Text>
            </View>
            {this.state.isCard ? (
              <View>
                <Text
                  style={{
                    marginLeft: 15,
                    fontSize: 13,
                    fontStyle: 'italic',
                    marginTop: 25,
                    textAlign: 'center',
                    textAlign: 'left',
                  }}>
                  {localeStrings.paymentStrings.useAgain}
                </Text>
                {GlobalVariables.cards.map((items, index) => (
                  <View key={index} style={{marginHorizontal: 8}}>
                    {/* <View style={this.state.savedCard ? styles.selected : styles.unselected}>   Used for Grouping the saved cards with same css on hover*/}
                    <View
                      style={
                        this.state.savedCard &&
                        this.state.cardSelected == items.id
                          ? styles.selected
                          : styles.unselected
                      }>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          height: 60,
                          width: '100%',
                          alignItems: 'center',
                          borderColor: '#9B9B9B',
                          borderWidth: 0.5,
                        }}>
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '12%',
                            height: 60,
                          }}
                          onPress={() => {
                            this.UpdateRadioButtons(items.id);
                          }}>
                          <Image
                            style={{marginLeft: 10, width: 15, height: 15}}
                            resizeMode="contain"
                            source={
                              this.state.savedCard &&
                              this.state.cardSelected == items.id
                                ? selectedRadioButton
                                : unselectedRadioButton
                            }
                          />
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: I18nManager.isRTL ? '49%' : '45%',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              textAlign: 'left',
                            }}>
                            {localeStrings.paymentStrings.israCard}*
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 11,
                              color: '#9B9B9B',
                              textAlign: 'left',
                            }}>
                            {localeStrings.paymentStrings.transactionFee}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 11,
                              marginTop: 18,
                              marginRight: 5,
                            }}>
                            {items.cardMask.replace(/.(?=.{4})/g, '*')}
                          </Text>
                          <Image
                            style={styles.imageCard}
                            source={require('../../res/images/cc.png')}
                          />
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}>
                      <TouchableOpacity
                        style={{flexDirection: 'row'}}
                        onPress={() => {
                          if (this.state.cardSelected) {
                            this.setState({
                              removeModalVisible: true,
                              selectedBuyerKey: items.buyer_key,
                              selectedBuyerCardMask: items.buyer_card_mask,
                              removeCardId: items.id,
                            });
                          } else {
                            Alert.alert(
                              localeStrings.paymentStrings.alertHeading,
                              localeStrings.paymentStrings.warningText,
                              [
                                {
                                  text: localeStrings.paymentStrings.textOk,
                                },
                              ],
                              {cancelable: false},
                            );
                          }
                        }}>
                        <Text style={{marginRight: 5}}>
                          {localeStrings.paymentStrings.forgetCard}
                        </Text>
                        <Image
                          style={styles.imageDelete}
                          source={require('../../res/images/delete.png')}
                        />
                      </TouchableOpacity>
                    </View>

                    {index + 1 != GlobalVariables.cards.length ? (
                      <Text
                        style={{
                          marginLeft: 15,
                          fontSize: 13,
                          fontStyle: 'italic',
                          marginTop: 5,
                          textAlign: 'center',
                        }}>
                        {localeStrings.paymentStrings.chooseAnother}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          marginLeft: 15,
                          fontSize: 13,
                          fontStyle: 'italic',
                          marginTop: 5,
                          textAlign: 'center',
                        }}>
                        {localeStrings.paymentStrings.textOr}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text />
            )}
            {/* Modal for confirmation to delete the card */}
            <Modal
              transparent={true}
              animationType="fade"
              visible={this.state.removeModalVisible}
              style={styles.modal}>
              <View style={[styles.modalFirstView, {justifyContent: 'center'}]}>
                <View style={[styles.modalSecondView, {width: '80%'}]}>
                  <Image
                    source={require('../../res/images/popuplogo.png')}
                    resizeMode="cover"
                    style={styles.modalImage}></Image>
                  <View
                    style={[styles.modalCenterText, {marginHorizontal: 20}]}>
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
                      {localeStrings.paymentStrings.deleteMessage}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: 'black',
                      borderStyle: 'solid',
                    }}
                  />
                  <View style={styles.container}>
                    <TouchableOpacity
                      style={styles.CenterText}
                      onPress={() =>
                        this.setState({removeModalVisible: false})
                      }>
                      <Text style={styles.textStyle}>
                        {localeStrings.paymentStrings.textNo}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        borderLeftWidth: 1,
                        borderLeftColor: 'black',
                        borderStyle: 'solid',
                        height: 50,
                        margin: 0,
                      }}
                    />
                    <TouchableOpacity
                      style={styles.CenterText}
                      onPress={() => {
                        this._deleteCard();
                      }}>
                      <Text style={styles.textStyle}>
                        {localeStrings.paymentStrings.textYes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <View style={{marginTop: 10, marginHorizontal: 8}}>
              <Text
                style={{
                  justifyContent: 'center',
                  color: 'black',
                  fontSize: 15,
                  fontFamily: 'Helvetica',
                  textAlign: 'left',
                }}>
                {localeStrings.paymentStrings.addNewCard}
              </Text>
              <View
                style={
                  this.state.isIsracardSelected
                    ? styles.selected
                    : styles.unselected
                }>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    height: 60,
                    width: '100%',
                    alignItems: 'center',
                    borderColor: '#9B9B9B',
                    borderWidth: 0.5,
                  }}>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '12%',
                      height: 60,
                    }}
                    onPress={() => {
                      this.UpdateRadioButtons('Isracard');
                    }}>
                    <Image
                      style={{marginLeft: 10, width: 15, height: 15}}
                      resizeMode="contain"
                      source={
                        this.state.isIsracardSelected
                          ? selectedRadioButton
                          : unselectedRadioButton
                      }
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      width: '70%',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Helvetica',
                        fontSize: 15,
                        textAlign: 'left',
                      }}>
                      {localeStrings.paymentStrings.israCard}*
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Helvetica',
                        fontSize: 11,
                        color: '#9B9B9B',
                        textAlign: 'left',
                      }}>
                      {localeStrings.paymentStrings.transactionFee}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      height: 55,
                    }}>
                    <Text></Text>
                    <Image
                      style={styles.imageCard}
                      source={require('../../res/images/cc.png')}
                    />
                  </View>
                </View>
              </View>

              {/* <View
                                style={
                                    this.state.isPayPalSelected ? styles.selected : styles.unselected
                                }
                            >
                                <View style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    borderColor: "#9B9B9B",
                                    borderWidth: 0.5,
                                    height: 60,
                                    width: "90%",
                                    alignItems: "center"
                                }}>
                                    <TouchableOpacity style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "15%",
                                        height: 60
                                    }}
                                        onPress={() => {
                                            this.UpdateRadioButtons("Paypal");
                                        }}
                                    >
                                        <Image
                                            style={{
                                                marginLeft: 10,
                                                width: 15,
                                                height: 15,
                                                justifyContent: "center",
                                                alignSelf: "center"
                                            }}
                                            resizeMode="contain"
                                            source={
                                                this.state.isPayPalSelected
                                                    ? selectedRadioButton
                                                    : unselectedRadioButton
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={{
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: 8,
                                        width: "65%"
                                    }}>
                                        <Text style={{ fontFamily: "Helvetica", fontSize: 15, textAlign: 'left' }}>{localeStrings.paymentStrings.payPal}*</Text>
                                        <Text style={{ fontFamily: "Helvetica", fontSize: 12, color: "#9B9B9B", textAlign: 'left' }}>{localeStrings.paymentStrings.transactionFee}</Text>
                                    </View>
                                    <Image
                                        style={styles.imageCard}
                                        source={require("../../res/images/payPal.png")}
                                    />
                                </View>

                            </View>
 */}

              <View
                style={{
                  marginLeft: 50,
                }}>
                <Text
                  style={{
                    fontFamily: 'Helvetica',
                    fontSize: 17,
                    fontWeight: 'bold',
                    marginTop: 50,
                    textAlign: 'left',
                  }}>
                  {localeStrings.paymentStrings.waitressTip}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 45,
                    width: '100%',
                    marginBottom: 20,
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 45,
                      height: 45,
                      flexDirection: 'row',
                    }}
                    onPress={() => {
                      this.updateTips('10');
                    }}>
                    <Image
                      style={{marginLeft: 10, width: 15, height: 15}}
                      resizeMode="contain"
                      source={
                        this.state.isTips10
                          ? selectedRadioButton
                          : unselectedRadioButton
                      }
                    />
                    <Text
                      style={{
                        fontFamily: 'Helvetica',
                        fontSize: 13,
                        marginLeft: 8,
                      }}>
                      10%
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 45,
                      height: 45,
                      flexDirection: 'row',
                      marginLeft: 20,
                    }}
                    onPress={() => {
                      this.updateTips('15');
                    }}>
                    <Image
                      style={{marginLeft: 10, width: 15, height: 15}}
                      resizeMode="contain"
                      source={
                        this.state.isTips15
                          ? selectedRadioButton
                          : unselectedRadioButton
                      }
                    />
                    <Text
                      style={{
                        fontFamily: 'Helvetica',
                        fontSize: 13,
                        marginLeft: 8,
                      }}>
                      15%
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 45,
                      marginLeft: 20,
                      marginRight: 20,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Helvetica',
                        fontSize: 12,
                        color: '#9B9B9B',
                      }}>
                      {localeStrings.paymentStrings.textOr}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: '#9B9B9B',
                      borderWidth: 0.5,
                      height: 45,
                      borderRadius: 5,
                      overflow: 'hidden',
                      width: 48,
                    }}>
                    <TextInput
                      style={styles.TextInput}
                      placeholder="0"
                      placeholderTextColor="#9b9b9b"
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        let sum = Number(this.params.sum.toFixed(2));
                        if (text.length > 0) {
                          this.setState({
                            isTips10: false,
                            isTips15: false,
                            tip: text,
                            totalTip: Number(text),
                            sum: Number(sum + Number(text)).toFixed(2),
                          });
                        } else {
                          this.setState({
                            tip: text,
                            totalTip: 0,
                          });
                        }
                      }}
                      value={this.state.tip}
                    />
                  </View>
                  <View
                    style={{
                      justifyContent: 'center',
                      marginLeft: 8,
                      height: 45,
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text>{GlobalVariables.restCurrencyCode.value}</Text>
                    {this.state.totalTip !== 0 ? (
                      GlobalVariables.userLanguage.value === 'he-IL' ? (
                        <Text> {this.state.totalTip} =</Text>
                      ) : (
                        <Text>= {this.state.totalTip}</Text>
                      )
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        {/* Modal to show Order Summary  */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={this.state.orderDetailsModal}
          style={styles.modal}
          onRequestClose={() => console.log('closed')}>
          <View style={styles.modalFirstView}>
            <TouchableOpacity
              onPress={() => {
                this.hideModal();
              }}
              style={[styles.modalCloseButton, {width: '10%'}]}>
              <Text style={{fontSize: 22, color: 'gray', fontWeight: 'bold'}}>
                X
              </Text>
            </TouchableOpacity>
            <View style={styles.modalSecondView}>
              <ScrollView>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View
                    style={{
                      height: 40,
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#d8d8d8',
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#a3a3a3',
                        //marginTop:10,
                        fontWeight: 'bold',
                        width: '90%',
                        textAlign: 'center',
                      }}>
                      {localeStrings.orderDetailsStrings.yourOrderSummary}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalCenterText}>
                  {GlobalVariables.orders.map((items, index) => {
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
                          alignItems: 'center',
                          borderBottomWidth: 0.5,
                          borderBottomColor: '#4A4A4A',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'center',
                            marginBottom: 10,
                            flex: 1,
                          }}>
                          <Image
                            style={{
                              resizeMode: 'contain',
                              width: 80,
                              height: 350,
                              marginBottom: -80,
                              marginTop: -90,
                            }}
                            source={{uri: items.info.image}}
                          />

                          <View
                            style={{
                              marginRight: 15,
                              marginLeft: 15,
                              width: '65%',
                              flexDirection: 'column',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                width: '100%',
                                justifyContent: 'space-between',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={[{
                                    color: 'black',
                                    marginTop: 15,
                                    fontWeight: 'bold',
                                    fontSize: 15,
                                  }]}>
                                  {items.info.name}
                                </Text>
                                <Text style={{}}>
                                  {localeStrings.orderDetailsStrings.quantity}{' = '}
                                  {items.quantity}
                                </Text>
                                {I18nManager.isRTL ? (
                                  <Text
                                    style={{
                                      color: 'black',
                                      fontWeight: 'bold',
                                      //  textAlign: "left",
                                      marginRight: 15,
                                    }}>
                                    ₪ {items.price}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      color: 'black',
                                      // textAlign: "left",
                                      fontWeight: 'bold',
                                      marginRight: 15,
                                    }}>
                                    {items.price}{' '}
                                    {GlobalVariables.restCurrencyCode.value}
                                  </Text>
                                )}
                              </View>

                              
                            </View>
                            <Text
                              style={{
                                color: '#4A4A4A',
                                marginTop: 5,
                                fontSize: 14,
                              }}>
                              {properties.length
                                ? localeStrings.detailItemsStrings
                                    .choiceOfDressing
                                : ''}
                            </Text>
                            {properties.map((p, idx) => (
                              <View
                                style={{
                                  flexDirection: 'column',
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
                                      o.property ? o.property.lppo.find((op) => op.i === o.option.i).n : ''
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
                                fontSize: 14,
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
                                    fontSize: 10,
                                    fontFamily: 'Helvetica',
                                    width: '50%',
                                  }}>
                                  {a.n}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontFamily: 'Helvetica',
                                  }}>
                                  {a.quantity}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 10,
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
                            <View
                              style={{
                                flexDirection: 'row',
                                width: '100%',
                                justifyContent: 'flex-start',
                                marginTop: 5,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center',
                                  textAlign: 'left',
                                }}>
                                <Text numberOfLines={5}>
                                  {items.specialInstructions}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '50%',
                        marginBottom: 50,
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
                            marginTop: 8,
                            //textAlign:I18nManager.isRTL? "left":"left"
                          }}>
                          {localeStrings.orderDetailsStrings.subTotal}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Helvetica',
                            fontSize: 15,
                            marginTop: 8,
                            //textAlign:I18nManager.isRTL? "left":"left"
                          }}>
                          {localeStrings.orderDetailsStrings.tips}
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
                            marginTop: 8,
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
                        marginBottom: 50,
                        justifyContent: 'flex-end',
                      }}>
                      <View
                        style={{
                          flexDirection: 'column',
                          marginRight: 35,
                        }}>
                        {I18nManager.isRTL ? (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            ₪ {this.state.subTotal.toFixed(2)}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
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
                            }}>
                            {' '}
                            ₪ {this.state.totalTip}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            {this.state.totalTip}{' '}
                            {GlobalVariables.restCurrencyCode.value}
                          </Text>
                        )}

                        {I18nManager.isRTL ? (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            ₪ {this.state.taxAmount.toFixed(2)}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            {this.state.taxAmount.toFixed(2)}{' '}
                            {GlobalVariables.restCurrencyCode.value}
                          </Text>
                        )}

                        {I18nManager.isRTL ? (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            ₪ {this.state.discountAmount}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            {this.state.discountAmount}{' '}
                            {GlobalVariables.restCurrencyCode.value}
                          </Text>
                        )}

                        {I18nManager.isRTL ? (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            ₪ {this.state.sum}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Helvetica',
                              fontSize: 15,
                              marginTop: 8,
                            }}>
                            {' '}
                            {this.state.sum}{' '}
                            {GlobalVariables.restCurrencyCode.value}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      height: 60,
                      marginTop: -30,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '40%',
                        marginLeft: 30,
                        justifyContent: 'flex-start',
                      }}>
                      <Button
                        title={localeStrings.ordersStrings.goBack}
                        type="outline"
                        titleStyle={{color: 'white'}}
                        buttonStyle={{
                          justifyContent: 'flex-start',
                          backgroundColor: '#386aa6',
                        }}
                        onPress={() => {
                          this.hideModal();
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '40%',
                        marginRight: 30,
                        justifyContent: 'flex-end',
                      }}>
                      <Button
                        title={localeStrings.ordersStrings.proceedBtn}
                        type="outline"
                        titleStyle={{color: 'white'}}
                        buttonStyle={{
                          justifyContent: 'center',
                          backgroundColor: '#386aa6',
                        }}
                        onPress={() => {
                          this.hideModal();
                          if (this.state.paymentMethod === 'SaveCard') {
                            this.SendRequest(
                              this.params.User,
                              this.params.orderFull,
                              this.state.paymentMethod,
                              '1',
                            );
                          } else {
                            Alert.alert(
                              localeStrings.paymentStrings.alertHeading,
                              localeStrings.paymentStrings.alertText +
                                ' ' +
                                this.state.paymentMethod +
                                '?',
                              [
                                {
                                  text: localeStrings.paymentStrings.textYes,
                                  onPress: () => {
                                    this.setState({
                                      remember: 1,
                                    });
                                    this.SendRequest(
                                      this.params.User,
                                      this.params.orderFull,
                                      this.state.paymentMethod,
                                      this.state.remember,
                                    );
                                  },
                                },
                                {
                                  text: localeStrings.paymentStrings.textNo,
                                  onPress: () => {
                                    this.setState({
                                      remember: 0,
                                    });
                                    this.SendRequest(
                                      this.params.User,
                                      this.params.orderFull,
                                      this.state.paymentMethod,
                                      this.state.remember,
                                    );
                                  },
                                },
                              ],

                              {cancelable: false},
                            );
                          }
                        }}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
          }}>
          <TouchableOpacity
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              height: 65,
              width: '100%',
            }}
            onPress={() => {
              if (this.state.savedCard) {
                this.setState({enterActivity: true});
                this.UpdateRadioButtons(this.state.cardSelected);
                this.setState({enterActivity: false});
              }
              setTimeout(() => {
                if (
                  this.state.isPayPalSelected ||
                  this.state.isIsracardSelected ||
                  (this.state.savedCard && this.state.cardSelected)
                ) {
                  this.showModal();
                } else {
                  Alert.alert(
                    localeStrings.paymentStrings.alertHeading,
                    localeStrings.paymentStrings.warningText,
                    [
                      {
                        text: localeStrings.paymentStrings.textOk,
                        onPress: () => {
                          console.log('Choose');
                        },
                      },
                    ],
                    {cancelable: false},
                  );
                }
              }, 300);
            }}>
            <Text
              style={{
                color: 'white',
                alignSelf: 'center',
                justifyContent: 'center',
                fontFamily: 'Helvetica',
                fontSize: 16,
              }}>
              {localeStrings.paymentStrings.btnText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selected: {
    height: 65,
    backgroundColor: '#F2F8FF',
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },

  unselected: {
    height: 65,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },

  imageCard: {
    height: 55,
    width: 50,
    resizeMode: 'contain',
    marginRight: 5,
  },
  imageSavedCard: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    marginRight: 5,
  },
  imageDelete: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    marginRight: 5,
    marginTop: -9,
  },
  TextTitle: {
    marginTop: 10,
    fontFamily: 'Helvetica',
    fontSize: 15,
    marginLeft: 25,
  },
  TextInput: {
    fontFamily: 'Helvetica',
    fontSize: 14,
    height: 45,
    textAlign: 'center',
    justifyContent: 'center',
  },
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
    marginTop: '5%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  modalCloseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    //width: 25,
    //height: 25,
    //marginTop:20
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
    //width: "80%",
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
  homeModalView: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barModalView: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  modal: {
    margin: 0, // This is the important style you need to set
    alignItems: undefined,
    justifyContent: undefined,
  },
  textStyle: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CenterText: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  padCenterText: {
    marginBottom: 15,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
