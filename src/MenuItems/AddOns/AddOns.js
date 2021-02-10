import React from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import {GlobalVariables} from '../../GlobalVariables';
import localeStrings from '../../../res/strings/LocaleStrings';
import StyleSheetFactory from '../../../res/styles/LocaleStyles';
import {
  backButtonStyle,
  buttonStyle,
  buttonsWrapStyle,
  buttonTextStyle,
  checkboxStyle,
  checkboxTickStyle,
  checkboxWrapStyle,
  footerButtonStyle,
  footerButtonTextStyle,
  footerStyle,
  headerStyle,
  headerTitleStyle,
  itemStyle,
  itemWrapStyle,
  pageContainerStyle,
  quantityTextStyle,
} from './AddOnsStyle';

const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class AddOns extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.state.params.headerText,
      headerStyle: headerStyle,
      headerRight: <View />,
      headerLeft: (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('DetailsItem', {screen: 'DetailsItem'})
          }
          style={styles.headerBackButton}>
          <Image
            style={backButtonStyle}
            source={require('../../../res/images/back.png')}
          />
        </TouchableOpacity>
      ),
      headerTintColor: '#fff',
      headerTitleStyle: headerTitleStyle,
    };
  };

  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    const {ma, lpa} = this.params.data;
    //alert(this.params.data.lpa);
    const sortedByPriceAsc = [...lpa].sort((a, b) => a.pr - b.pr);
    let qtyGroupByPrice = {};
    let remaining = ma;
    sortedByPriceAsc.forEach((a) => {
      if (remaining > 0) {
        qtyGroupByPrice[a.pr] = qtyGroupByPrice[a.pr]
          ? qtyGroupByPrice[a.pr] + 1
          : 1;
        remaining--;
      }
    });
    this.state = {
      selectedAddOn: GlobalVariables.selectedAddOns,
      qtyGroupByPrice,
    };
  }

  // _onAdd(addon) {
  //   const {data} = this.params;
  //   const selected = this.state.selectedAddOn;
  //   const quantity = selected[addon.i] ? selected[addon.i].quantity + 1 : 1;
  //   const newQty =
  //     this.state.freeItemId === addon.i ? quantity - data.ma : quantity;
  //   const calc = newQty * addon.pr;
  //   const cost = calc >= 0 ? calc : 0;
  //   const selectedAddOn = {...selected, [addon.i]: {...addon, quantity, cost}};
  //   this.setState({selectedAddOn});
  // }

  // _onSubtract(addon) {
  //   const {data} = this.params;
  //   const selected = this.state.selectedAddOn;
  //   const quantity = selected[addon.i] ? selected[addon.i].quantity - 1 : 0;
  //   if (selected[addon.i] && quantity <= 0) delete selected[addon.i];
  //   const newQty =
  //     this.state.freeItemId === addon.i ? quantity - data.ma : quantity;
  //   const calc = newQty * addon.pr;
  //   const cost = calc >= 0 ? calc : 0;
  //   const newObj = quantity <= 0 ? {} : {[addon.i]: {...addon, quantity, cost}};
  //   const selectedAddOn = {...selected, ...newObj};
  //   this.setState({selectedAddOn});
  // }

  _onToggle(addon) {
    const {qty} = this.params;
    const selected = this.state.selectedAddOn;
    const quantity = selected[addon.i] ? 0 : qty;
    if (selected[addon.i] && quantity <= 0) delete selected[addon.i];
    const isFree = this._isFree(addon);
    const newQty = isFree ? 0 : quantity;
    const calc = newQty * addon.pr;
    const cost = calc >= 0 ? calc : 0;
    const newObj = quantity <= 0 ? {} : {[addon.i]: {...addon, quantity, cost, isFree}};
    const selectedAddOn = {...selected, ...newObj};
    this.setState({selectedAddOn});
  }

  _isFree(addon) {
    const {qtyGroupByPrice, selectedAddOn} = this.state;
    if (!qtyGroupByPrice[addon.pr]) return false;
    const samePriceAddonsCount = Object.values(selectedAddOn).filter(
      (a) => a.isFree && a.pr === addon.pr,
    ).length;
    return samePriceAddonsCount < qtyGroupByPrice[addon.pr];
  }

  _onApply() {
    GlobalVariables.selectedAddOns = this.state.selectedAddOn;
    this.props.navigation.push('DetailsItem', {
      screen: 'DetailsItem',
    });
    
  }

  render() {
    const {data} = this.params;
    const {selectedAddOn} = this.state;
    return (
      <View style={pageContainerStyle}>
        <View style={itemStyle}>
          <Text style={[styles.text, {fontStyle: 'italic'}]}>{`Note: ${
            data.mx
          } extra${data.mx > 1 ? 's' : ''} of minimum cost ${
            data.mx > 1 ? 'are' : 'is'
          } free.`}</Text>
        </View>
        <ScrollView style={{width: '100%', height: '100%'}}>

        {data.lpa.map((property, index) => (
            <View style={itemWrapStyle} key={index}>
              <View style={itemStyle}>
                <Text style={styles.textnew}>{property.n}</Text>
              </View>
          {property.lpao.map((addon, idx) => {
            const selected = selectedAddOn[addon.i]
              ? selectedAddOn[addon.i]
              : {};
            return (
              <View style={itemWrapStyle} key={idx}>
                <View style={itemStyle}>
                  <Text style={[styles.text, {width: '40%'}]}>{addon.n}</Text>
                  <Text style={[styles.text, {width: '20%'}]}>
                    {I18nManager.isRTL
                      ? `₪ ${addon.pr.toFixed(2)}+`
                      : `+${addon.pr.toFixed(2)} ILS`}
                  </Text>
                  <Text style={[styles.text, {width: '20%'}]}>
                    {selected.cost >= 0
                      ? I18nManager.isRTL
                        ? `₪ ${selected.cost.toFixed(2)}`
                        : `${selected.cost.toFixed(2)} ILS`
                      : ''}
                  </Text>
                  <TouchableOpacity
                    style={checkboxWrapStyle}
                    onPress={() => 
                    this._onToggle(addon)
                    }>
                    <View style={checkboxStyle}>
                      {selected.quantity ? (
                        <Image
                          source={require('../../../res/images/confirmed.png')}
                          style={checkboxTickStyle}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.BorderView} />
              </View>
            );
          })}
          </View>
          ))}
        </ScrollView>
        <View style={footerStyle}>
          <TouchableOpacity
            onPress={() => this._onApply()}
            style={footerButtonStyle}>
            <Text style={footerButtonTextStyle}>
              {localeStrings.detailItemsStrings.apply}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
