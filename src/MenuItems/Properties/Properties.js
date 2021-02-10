import React,{Fragment} from 'react';
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
  footerButtonStyle,
  footerButtonTextStyle,
  footerStyle,
  headerStyle,
  headerTitleStyle,
  itemStyle,
  itemStyleExc,
  itemStyleExc1,
  itemWrapStyle,
  pageContainerStyle,
  checkboxStyle,
  checkboxTickStyle,
  checkboxWrapStyle,
  radioImageStyle,
} from './PropertiesStyle';
import { objectOf } from 'prop-types';
GlobalVariables.lppname = 0;
GlobalVariables.flagforselection = false;
GlobalVariables.proplength = 0;
GlobalVariables.addonlength = 0;
let replalength;


const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);

export default class Properties extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.state.params.headerText,
     headerStyle: headerStyle,
     headerRight: <View />,
    headerLeft: (
        <TouchableOpacity
        onPress={navigation.getParam('handleBackButton')}
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

    const {mx, lpp} = this.params.data;
    const sortedByPriceAsc = [...lpp].sort((a, b) => a.pr - b.pr);
    let qtyGroupByPrice = {};
    let remaining = mx;
     sortedByPriceAsc.forEach((a) => {
       if (remaining > 0) {
         qtyGroupByPrice[a.pr] = qtyGroupByPrice[a.pr]
           ? qtyGroupByPrice[a.pr] + 1
           : 1;
         remaining--;
       }
     });
    this.state = {
      selectedProp: GlobalVariables.selectedProperties,
      details: {
        lpp: [],
      },
      selectedAddOn: GlobalVariables.selectedAddOns,
      qtyGroupByPrice,
      
    };
    
    
  }

  componentDidMount() {
    this.props.navigation.setParams({handleBackButton: this._handleBackButton});
  }



  _handleBackButton = () => {
    GlobalVariables.selectedProperties = this.state.selectedProp;
    GlobalVariables.selectedAddOns = this.state.selectedAddOn;
   

    if(GlobalVariables.lppname > 0){
      GlobalVariables.lppname--;
      this.props.navigation.navigate('Properties', {
        name: 'Properties',
         headerText:GlobalVariables.prodName,
         data: this.params.data,
         qty: this.state.itemQuantity,
       });
    }else{
      this.props.navigation.navigate('DetailsItem', {
        name: 'DetailsItem',
      });
    }    
};  

  _onSelect(property, option) {  

    if(GlobalVariables.replaceable == true){
      replalength = GlobalVariables.proplength + GlobalVariables.addonlength;
      const oldSelectedProps = this.state.selectedProp;
      const selectedPropArray = oldSelectedProps[property.i] || [];
      const idx = selectedPropArray.findIndex(s => s.option.i === option.i);
  
      if (idx > -1) {
        selectedPropArray.splice(idx, 1);
      } else {
          if(replalength >= GlobalVariables.maxIncluded){
            alert("Max "+ GlobalVariables.maxIncluded +" item you can add")
          }else{
            selectedPropArray.push({option, property});
          }
      }
  
      const selectedProp = {
        ...this.state.selectedProp,
        [property.i]: [...selectedPropArray],
      };
      this.setState({selectedProp});

      GlobalVariables.proplength = selectedPropArray.length;

    }else{   

    const oldSelectedProps = this.state.selectedProp;
    const selectedPropArray = oldSelectedProps[property.i] || [];
    const idx = selectedPropArray.findIndex(s => s.option.i === option.i);

    if (idx > -1) {
      selectedPropArray.splice(idx, 1);
    } else {
      if(selectedPropArray.length == 0){
      selectedPropArray.push({option, property});
      }else{
        if(selectedPropArray.length >= GlobalVariables.maxIncluded){
          alert("Max "+ GlobalVariables.maxIncluded +" item you can add")
        }else{
          selectedPropArray.push({option, property});
        }
      }
    }
    const selectedProp = {
      ...this.state.selectedProp,
      [property.i]: [...selectedPropArray],
    };
    this.setState({selectedProp});

    }
}

  _onToggle(option) {

    if(GlobalVariables.replaceable == true){    
        const {qty} = this.params;
        const selected = this.state.selectedAddOn;
        const quantity = selected[option.i] ? 0 : qty;
        if (selected[option.i] && quantity <= 0) delete selected[option.i];
        const isFree = this._isFree(option);
        const newQty = isFree ? 0 : quantity;
        const calc = newQty * option.pr;
        const cost = calc >= 0 ? calc : 0;
        const newObj = quantity <= 0 ? {} : {[option.i]: {...option, quantity, cost, isFree}};
        const selectedAddOn = {...selected, ...newObj};   
        
        const asArr = Object.values(selectedAddOn);
        const cat1 = asArr.filter(a => a.ppi === option.ppi).length
        GlobalVariables.addonlength = cat1;


        replalength = GlobalVariables.proplength + GlobalVariables.addonlength;
        
        if(replalength > GlobalVariables.maxIncluded){   
          alert("Max "+ GlobalVariables.maxIncluded +" item you can add")
        }else{
          this.setState({selectedAddOn});
        }
     

    }else{
  
    const {qty} = this.params;
    const selected = this.state.selectedAddOn;
    //alert(option.ppi);

    const quantity = selected[option.i] ? 0 : qty;
    if (selected[option.i] && quantity <= 0) delete selected[option.i];
    const isFree = this._isFree(option);
    const newQty = isFree ? 0 : quantity;
    const calc = newQty * option.pr;
    const cost = calc >= 0 ? calc : 0;
    const newObj = quantity <= 0 ? {} : {[option.i]: {...option, quantity, cost, isFree}};
    const selectedAddOn = {...selected, ...newObj};   
    
    const asArr = Object.values(selectedAddOn);
    const cat1 = asArr.filter(a => a.ppi === option.ppi).length

    
    if(cat1 > GlobalVariables.maxExcluded){   
      alert("Max "+ GlobalVariables.maxExcluded +" item you can add")
    }else{
      this.setState({selectedAddOn});
    }
    //console.log(cat1);
    //GlobalVariables.addonlength = cat1;

    //console.log("Addons");
   // console.log(Object.values(selectedAddOn));

  }
  }

  _isFree(option) {
    const {qtyGroupByPrice, selectedAddOn} = this.state;
    if (!qtyGroupByPrice[option.pr]) return false;
    const samePriceAddonsCount = Object.values(selectedAddOn).filter(
      (a) => a.isFree && a.pr === option.pr,
    ).length;
    return samePriceAddonsCount < qtyGroupByPrice[option.pr];
  }

  _onApply() {

    console.log("FLAGGGGGGGGGGGGGGGGGGGGGGG ",GlobalVariables.replaceable);       
    GlobalVariables.selectedProperties = this.state.selectedProp;
    GlobalVariables.selectedAddOns = this.state.selectedAddOn;    
    GlobalVariables.lppname++;  

    if(GlobalVariables.lpplength != GlobalVariables.lppname){
     this.props.navigation.navigate('Properties', {
       name: 'Properties',
        headerText:GlobalVariables.prodName,
        data: this.params.data,
        qty: this.state.itemQuantity,
      });
    }else{
      GlobalVariables.lppname = 0;
      this.props.navigation.navigate('DetailsItem', {
        name: 'DetailsItem',
      });
    }  
    GlobalVariables.proplength = 0;
    GlobalVariables.addonlength = 0;
}


  renderInclude(){
    if(GlobalVariables.maxIncluded > 0)
       return   <View style={[styles.MainContainer]} >
       <Text style={[styles.textnewhead]}>Include</Text>
       </View>;
    return null;
 }

 renderExclude(){
  if(GlobalVariables.maxExcluded > 0)
     return   <View style={[styles.MainContainer]}>
     <Text style={[styles.textnewhead]}>Exclude</Text>
     </View>;
     
  return null;
}

      renderReplace(){
        if(GlobalVariables.maxIncluded > 10) {
          return <View>
          <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Selection : No Limit`}</Text> 
          </View>;   
        }else{
          return <View>
          <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Selection : ${GlobalVariables.maxIncluded}`}</Text> 
          </View>;   
        }
      }

      renderReplaceElse(){

        if(GlobalVariables.maxIncluded > 10) {
          return <View>
          <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Include : No Limit`}</Text> 
          </View>;   
        }else{
          return <View>
            <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Include : ${GlobalVariables.maxIncluded}`}</Text>
          </View>;  
        }
      }


      renderReplaceElseExc(){
        if(GlobalVariables.maxExcluded > 10) {
          return <View>
          <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Exclude : No Limit`}</Text> 
          </View>;   
        }else{
          return <View>
            <Text style={[styles.textlabelexc, {fontStyle: 'italic'}]}>{`Max Exclude : ${GlobalVariables.maxExcluded}`}</Text>
          </View>;  
        }
      }


forGetLength(selectedAddOn,prope){

  const asArr1 = Object.values(selectedAddOn);
  const cat1 = asArr1.filter(a => a.ppi === prope).length
  GlobalVariables.addonlength = cat1;
  console.log("Add Nothing "+GlobalVariables.addonlength);
  

}

 



  renderSubMenuItemslpp() {
    const {selectedProp,selectedAddOn} = this.state;
    const {data} = this.params; 
    console.log("In renderSubMenuItemslpp");
    //console.log("Props "+GlobalVariables.proplength);
    //console.log("Add ons "+GlobalVariables.addonlength);
   // console.log("Add ons "+Object.values(selectedAddOn));
  //  console.log("Add Prop "+Object.values(selectedProp));
    //const selectedIds = selectedAddOn.map(s => s); 
  //  console.log("Add ons "+selectedIds);
    //var data = {"i":33660,"lpp":[{"i":63,"n":"Doneness","pi":33660,"mx":0,"mi":1,"lppo":[{"i":158,"n":"well","ppi":63,"pr":0.00,"ty":"Inc"},{"i":159,"n":"rare","ppi":63,"pr":0.00,"ty":"Inc"},{"i":160,"n":"medium","ppi":63,"pr":0.00,"ty":"Inc"}]},{"i":64,"n":"Vegetables","pi":33660,"mx":1,"mi":1,"lppo":[{"i":161,"n":"Tomato","ppi":64,"pr":0.00,"ty":"Inc"},{"i":162,"n":"capsicum","ppi":64,"pr":4.00,"ty":"Exc"}]},{"i":65,"n":"Sweet","pi":33660,"mx":1,"mi":0,"lppo":[{"i":163,"n":"gulabjamun","ppi":65,"pr":5.00,"ty":"Exc"},{"i":164,"n":"Halwa","ppi":65,"pr":7.00,"ty":"Exc"}]}]}
    
    let newlppObj = [];
    
    GlobalVariables.lpplength = data.lpp.length;
    GlobalVariables.lppnamestep = GlobalVariables.lppname + 1;
    newlppObj.push(data.lpp[GlobalVariables.lppname]);
   GlobalVariables.maxExcluded = data.lpp[GlobalVariables.lppname].mx;
   GlobalVariables.maxIncluded = data.lpp[GlobalVariables.lppname].mi;
   GlobalVariables.replaceable = data.lpp[GlobalVariables.lppname].ir;

  
     return newlppObj.map((property, index) => (
      
    <View style={itemWrapStyle} key={index}>
    <Text style={styles.textheader}>{"Step "+ GlobalVariables.lppnamestep +" Out of "+GlobalVariables.lpplength+""}</Text>       
    <View style={itemStyle}>
          <Text style={styles.textnew}>{property.n}</Text>
        </View>

        {GlobalVariables.replaceable == true ? 
          (
            <View>
            { this.renderReplace() }             
           </View>
          ):
          <View>
            {this.renderReplaceElse()}         
            {this.renderReplaceElseExc()}             
           </View>
          }

          {/* <Text style={[styles.text, {fontStyle: 'italic'}]}>{`Replacable : ${GlobalVariables.replaceable}`}</Text> */}
{/* 
            <View>
             { this.renderInclude() }             
            </View> */}
            

            <View>
             { this.forGetLength(selectedAddOn,property.i) }             
            </View>
           

        {/* //For Inclusive */}
        {property.lppo.map((option, idx) => {
          const selectedProps = selectedProp[property.i] || [];
          const selectedIds = selectedProps.map(s => s.option.i); 
        //  console.log("renderSubMenuItemslpp ",selectedIds.length);  
          GlobalVariables.proplength = selectedIds.length;
          console.log("renderSubMenuItemslpp ",GlobalVariables.proplength);  
          return(
          <View style={itemWrapStyle} key={idx}>       
         
              {option.ty == 'Inc' ? ( 
                 <Fragment>
                <View style={itemStyleExc}>
                <Text style={[styles.textexc,{width: '40%'}]}>{option.n }</Text>
               
                <TouchableOpacity
                style={checkboxWrapStyle}
                onPress={() => 
                this._onSelect(property, option)
                }>
                <View style={checkboxStyle}>
                  {selectedIds.includes(option.i) ? (
                    <Image
                      source={require('../../../res/images/confirmed.png')}
                      style={checkboxTickStyle}
                    />
                  ) : null}
                </View>
                </TouchableOpacity>
                </View>
                </Fragment>
              ) : (
                <View style={itemStyle}>
                </View>
              )}    
                       
          </View>
           );
           
          })}   
           {/* <View>
             { this.renderExclude() }
            </View> */}


     {property.lppo.map((option, idx) => {
          const selected = selectedAddOn[option.i]
          ? selectedAddOn[option.i]
          : {};
         
            
          return(
          <View style={itemWrapStyle} key={idx}>
                      
              {option.ty == 'Exc' ? ( 
                 <Fragment>
                <View style={itemStyleExc}>
                <Text style={[styles.textexc,{width: '40%'}]}>{option.n}</Text>
               
                
                 <Text style={[styles.textexc, {width: '30%'}]}>
                 {I18nManager.isRTL
                   ? `₪ ${option.pr.toFixed(2)}+`
                   : `${option.pr.toFixed(2)} ILS`}
               </Text> 
               <Text style={[styles.textexc, {width: '18%'}]}>
                     {selected.cost >= 0
                       ? I18nManager.isRTL
                         ? `₪ ${selected.cost.toFixed(2)}`
                         : `${selected.cost.toFixed(2)} ILS`
                       : ''}
                   </Text>
                   <TouchableOpacity
                     style={checkboxWrapStyle}
                     onPress={() => 
                     this._onToggle(option)
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
                </Fragment>
              ) : (
                <View style={itemStyle}>
                </View>
              )}    
                     
          </View>
           );
          })}      
      </View>
    ))
        }
 

  render() {
    return (     
      <View style={pageContainerStyle}>
        <ScrollView style={{width: '100%', height: '100%'}}>
        {this.renderSubMenuItemslpp()}
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
