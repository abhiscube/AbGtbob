import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image, Button, Animated, Dimensions, FlatList, ActivityIndicator, I18nManager

} from "react-native";
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { GlobalVariables } from '../GlobalVariables'
import SlidingUpPanel from 'rn-sliding-up-panel';
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Spinner from 'react-native-loading-spinner-overlay';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

let ImageWidth = width * 0.20;
let ImageHeight = width * 0.20;
let AllProducts = [], MainCategory = [], SubCategory = [], SubSubCategory = [];

import localeStrings from '../../res/strings/LocaleStrings';
import StyleSheetFactory from "../../res/styles/LocaleStyles";
import DeviceInfo from "react-native-device-info";

const deviceLocale = DeviceInfo.getDeviceLocale();
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
export default class MenuSliderClone extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: localeStrings.menuSliderStrings.menu,
            headerStyle: {
                backgroundColor: '#26466c',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
            },

            headerRight: (
                <TouchableOpacity
                    disabled={true}
                    style={{
                        width: 45,
                        height: 45,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center"
                    }}>
                    <Text style={{ fontFamily: "Helvetica", fontSize: 16, color: 'white', marginRight: 0 }} />
                </TouchableOpacity>),
            headerLeft: (
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => {
                        //  GlobalVariables.orders = [];
                        // GlobalVariables.totalOrders.value = 0;
                        navigation.goBack(null)

                    }} style={styles.headerBackButton}>
                        <Image style={{
                            resizeMode: "contain",
                            width: 15,
                            height: 15,
                            transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]
                        }}
                            source={require('../../res/images/back.png')} />
                    </TouchableOpacity>


                </View>
            ),
            headerTintColor: '#fff',
            headerTitleStyle: {
                textAlign: "center",
                flex: 1,
                alignSelf: "center",
                color: 'white',
                fontSize: 19,
                fontFamily: "Helvetica"

            },

        }
    };

    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.state = {
            enterActivity: false,
            itemsSearching: [],
            mainCategoryItems: [],
            subCategoryItems: [],
            subsubCategoryItems: [],


            indexMainCategory: 0,
            indexSubCategory: null,
            indexSubSubCategory: null,


            Title: localeStrings.menuSliderStrings.all,
            menuSliderVisible: true,
            imageArrow: require('../../res/images/downArrow.png'),
            searchTerm: "",
            isActiveSearchInput: true,
            TitleBehind: localeStrings.menuSliderStrings.addItems,

            subCategBool: false,
            subsubCategBool: false,
        };

    }

    componentDidMount() {
        this.setState({ menuSliderVisible: true });
        this._panel.show();

    }

    componentWillMount() {
        //console.log(this.params.barId);
        this.getAllProducts(this.params.barId);
        // this.getAllProducts(10021);
        this.getMainCategories();
    }

    getAllProducts(barId) {
        this.setState({
            enterActivity: true
        });
        try {
            fetch(GlobalVariables._URL + "/categories/" + barId + "/products/" + GlobalVariables.userLanguage.value, {

                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {

                    if (response !== "") {
                        AllProducts = [];

                        for (let i = 0; i < response.length; i++) {
                            let dataItem = {
                                id: response[i].i,
                                name: response[i].n,
                                description: response[i].d,
                                image: GlobalVariables._URL + "/" + response[i].t,
                                price: response[i].p,
                                skanCode: response[i].sku,
                                categories: response[i].c,
                                extras: response[i].e
                            };
                            AllProducts.push(dataItem);
                        }


                        this.setState({
                            imageArrow: require('../../res/images/downArrow.png'),
                            menuSliderVisible: true,
                            itemsSearching: AllProducts,
                            enterActivity: false
                        });
                        this._panel.show();
                    }

                })
                .catch(error => {
                    console.log("upload error", error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }

    getMainCategories() {

        try {
            fetch(GlobalVariables._URL + "/categories/main/" + GlobalVariables.restId.value + "/" + GlobalVariables.userLanguage.value, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {
                    MainCategory = [];
                    if (response !== "") {

                        for (let i = 0; i < response.length; i++) {
                            let dataItem = {
                                id: response[i].i,
                                name: response[i].n,
                                image: GlobalVariables._URL + "/" + response[i].t,
                                color: response[i].co,
                                ca: response[i].ca
                            };
                            MainCategory.push(dataItem);
                        }

                        for (let i = 0; i < MainCategory.length; i++) {
                            if (MainCategory[i].name === localeStrings.menuSliderStrings.all) {
                                let movingItem = MainCategory[i];
                                MainCategory.splice(i, 1);
                                MainCategory.splice(0, 0, movingItem);
                            }
                        }

                        this.setState({ mainCategoryItems: MainCategory, enterActivity: false })
                    }

                })
                .catch(error => {
                    console.log("upload error", error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }

    getSubCategories(idSubCategory) {
        try {
            fetch(GlobalVariables._URL + "/categories/subcateg/" + idSubCategory + "/" + GlobalVariables.restId.value + "/" + GlobalVariables.userLanguage.value, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {

                    SubCategory = [];
                    if (response !== "") {

                        for (let i = 0; i < response.length; i++) {
                            let dataItem = {
                                id: response[i].i,
                                name: response[i].n,
                                ca: response[i].ca
                            };
                            SubCategory.push(dataItem);
                        }

                        this.setState({ subCategoryItems: SubCategory, subCategBool: true })
                    }

                })
                .catch(error => {
                    console.log("upload error", error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }

    getSubSubCategories(idSubSubCategory) {

        try {
            fetch(GlobalVariables._URL + "/categories/subcateg/" + idSubSubCategory + "/" + GlobalVariables.userLanguage.value, {
                method: "GET",
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            })
                .then(response => response.json())
                .then(response => {

                    SubSubCategory = [];

                    if (response !== "") {
                        for (let i = 0; i < response.length; i++) {
                            let dataItem = {
                                id: response[i].i,
                                name: response[i].n,
                                ca: response[i].ca
                            };
                            SubSubCategory.push(dataItem);
                        }

                        this.setState({ subsubCategoryItems: SubSubCategory, subsubCategBool: true })
                    }

                })
                .catch(error => {
                    console.log("upload error", error);

                });
        } catch (e) {
            console.error("upload catch error", e);

        }
    }


    CancelBtn() {
        this.setState({
            searchTerm: "",
            isActiveSearchInput: false
        });
        this.textInput.clear();
        this.searchUpdated("", false)

    }


    searchUpdated(term, inputBool) {

        this.setState({
            searchTerm: term,
            isActiveSearchInput: true,

        });


        if (term === "" || term === localeStrings.menuSliderStrings.all) {
            this.setState({ itemsSearching: AllProducts });

        } else if (inputBool) {
            let filterItem = AllProducts.filter(function (itemsSearch) {
                for (let i = 0; i < itemsSearch.categories.length; i++) {
                    if (itemsSearch.categories[i].n.toLowerCase().indexOf(term.toLowerCase()) > -1) {
                        return itemsSearch.categories[i].n.toLowerCase().indexOf(term.toLowerCase()) > -1
                    }
                }
            });
            this.setState({ itemsSearching: filterItem });

        } else {
            this.state.indexMainCategory = 0;
            this.state.indexSubCategory = null;
            this.state.indexSubSubCategory = null;
            this.state.Title = localeStrings.menuSliderStrings.all;
            let filterItem = AllProducts.filter(function (itemsSearch) {
                return itemsSearch.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
            });
            this.setState({ itemsSearching: filterItem });
        }

    }


    static defaultProps = {
        draggableRange: {
            top: height / 1.05,
            bottom: 125
        }
    };


    menuVisible() {
        if (this.state.menuSliderVisible) {
            this.setState({
                imageArrow: require('../../res/images/upArrow.png'),
                menuSliderVisible: false
            });

            this._panel.hide()
        } else {

            this.setState({
                imageArrow: require('../../res/images/downArrow.png'),
                menuSliderVisible: true
            });

            this._panel.show()
        }

    }


    renderMainCategories() {
        return (
            <View style={{
                flexDirection: "row",
                paddingLeft: 5,
                paddingRight: 5,
                flex: 1,
                justifyContent: "space-between",
                width: "100%"
            }}>
                {this.state.mainCategoryItems.map((items, index) => (
                    <View key={index} style={{ flex: 1 }}>
                        <View style={{
                            borderRadius: ImageWidth / 2,
                            width: ImageWidth,
                            height: ImageHeight,
                            borderColor: items.color,
                            borderWidth: 1,
                            flexWrap: "wrap",
                            marginTop: 15,
                            marginLeft: 8,
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <TouchableOpacity
                                style={this.state.indexMainCategory === index ? {
                                    backgroundColor: items.color,
                                    borderColor: "white",
                                    borderRadius: (ImageWidth - 2) / 2,
                                    width: ImageWidth - 2,
                                    height: ImageHeight - 2,
                                    borderWidth: 2,
                                    alignItems: "center",
                                    justifyContent: "center",
                                } : {
                                        backgroundColor: items.color,
                                        borderColor: items.color,
                                        borderRadius: ImageWidth / 2,
                                        width: ImageWidth,
                                        height: ImageHeight,
                                        borderWidth: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
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
                                <Image style={{ resizeMode: "contain", width: 45, height: 45, alignSelf: "center" }}
                                    source={{ uri: items.image }} />


                            </TouchableOpacity>
                        </View>
                        <Text style={{
                            alignSelf: "center",
                            textAlign: "center",
                            marginTop: 5,
                            marginLeft: 5,
                            marginRight: 5,
                            fontFamily: "Helvetica",
                            fontSize: 11,
                            maxWidth: ImageWidth,
                        }}>{items.name}</Text>

                    </View>
                ))}

            </View>)

    }


    renderSubCategory() {

        if (this.state.indexMainCategory === 0) {

            return (
                <View />
            )
        } else {

            if (!this.state.subCategBool) {
                this.getSubCategories(this.state.subCategoryID);
            }

            return (
                <View style={{ flexDirection: "row", paddingLeft: 5, paddingRight: 5, flex: 1 }}>
                    {this.state.subCategoryItems.map((items, index) => (
                        <View key={index} style={{ marginLeft: 15 }}>

                            <TouchableOpacity
                                style={this.state.indexSubCategory === index ? PageStyles.roundCircleCategory : PageStyles.roundCircleCategorySelected}
                                onPress={() => {
                                    this.setState({
                                        indexSubCategory: index,
                                        indexSubSubCategory: null,
                                        SubSubSubCategoryID: items.id,
                                        isActiveSearchInput: false,
                                        Title: items.name,
                                        subsubCategBool: false,
                                    });
                                    this.searchUpdated(items.name, true)

                                }}>
                                <Text style={{
                                    alignSelf: "center",
                                    textAlign: "center",
                                    justifyContent: "center",
                                    marginTop: 5,
                                    marginLeft: 5,
                                    marginRight: 5,
                                    fontFamily: "Helvetica",
                                    fontSize: 13
                                }}>{items.name}</Text>
                            </TouchableOpacity>


                        </View>
                    ))}

                </View>
            )
        }
    }

    renderSubSubCategory() {

        if (this.state.indexSubCategory === null) {
            return (
                <View style={{ height: 0 }} />
            )
        } else {

            if (!this.state.subsubCategBool) {
                this.getSubSubCategories(this.state.SubSubSubCategoryID);

            }

            return (
                <View style={{ flexDirection: "row", paddingLeft: 5, paddingRight: 5, flex: 1, marginTop: 8 }}>
                    {this.state.subsubCategoryItems.map((items, index) => (
                        <TouchableOpacity key={index}
                            onPress={() => {
                                this.setState({
                                    Title: items.name,
                                    indexSubSubCategory: index,
                                    isActiveSearchInput: false
                                });
                                this.searchUpdated(items.name, true)

                            }}
                            style={this.state.indexSubSubCategory === index ? PageStyles.selectedSubSubSubCategory : PageStyles.UnselectedSubSubSubCategory}>
                            <Text>{items.name}</Text>
                        </TouchableOpacity>

                    ))}

                </View>
            )
        }


    }

    _keyExtractor = (item, index) => index.toString();

    _renderItem = ({ item }) => (
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

        />
    );


    render() {

        const { top, bottom } = this.props.draggableRange;
        this._draggedValue = new Animated.Value(top, bottom);


        // if (GlobalVariables.orders.length > 0) {
        //     this.state.TitleBehind = localeStrings.menuSliderStrings.youHave + GlobalVariables.totalOrders.value + localeStrings.menuSliderStrings.itemInList
        // }

        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                flexDirection: "column"
            }}>
                <Spinner
                    color="#000"
                    visible={this.state.enterActivity}
                />
                <View style={{ justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 10 }}>
                    <Text style={{ color: "black" }}>{this.state.TitleBehind}</Text>
                </View>

                <ScrollView>
                    {/*<BackMenu/>*/}
                </ScrollView>


                <SlidingUpPanel ref={c => this._panel = c}
                    animatedValue={this._draggedValue}
                    draggableRange={this.props.draggableRange}
                    showBackdrop={false}
                    allowDragging={false}
                    allowMomentum={true}

                >
                    <View style={{
                        flex: 1,
                        backgroundColor: "white"
                    }}>
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <View style={{
                                height: 1,
                                borderBottomColor: "black",
                                borderWidth: 0.5,
                                marginTop: 0,
                                width: "100%"
                            }} />
                            <TouchableOpacity style={{
                                height: 45,
                                width: 45,
                                justifyContent: 'center',
                                alignSelf: "center",
                                alignItems: "center"
                            }} onPress={() =>
                                this.menuVisible()


                            }>
                                <Image style={{ resizeMode: "contain", width: 35, height: 40 }}
                                    source={this.state.imageArrow} />

                            </TouchableOpacity>

                            <View style={{ flexDirection: "row", width: "100%", height: 50 }}>

                                <View style={{
                                    width: "75%",
                                    height: 45,
                                    backgroundColor: "#D8D8D8",
                                    borderRadius: 10,
                                    marginLeft: 15,
                                    flexDirection: "row"
                                }}>
                                    <Image style={styles.searchImg}
                                        source={require('../../res/images/searchIcon.png')} />
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{
                                            width: "75%",
                                            justifyContent: "flex-start",
                                            alignSelf: "flex-start",
                                            height: "100%",
                                        }}
                                        onPress={() => this.textInput.focus()}>
                                        <View style={{
                                            justifyContent: "flex-start",
                                            alignSelf: "flex-start",
                                            height: "100%",
                                        }}>
                                            <TextInput
                                                style={{
                                                    color: "#4A4A4A",
                                                    fontFamily: "Helvetica",
                                                    fontSize: 14,
                                                    marginLeft: 15,
                                                    marginTop: 15,
                                                    alignItems: "flex-start",
                                                    textAlign: I18nManager.isRTL ? "right" : "left",
                                                }} placeholderTextColor="#4A4A4A"
                                                placeholder={localeStrings.menuSliderStrings.search}
                                                onChangeText={(term) => {
                                                    this.searchUpdated(term, false)
                                                }} ref={input => {
                                                    this.textInput = input
                                                }} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.navigate("BarCodeScannerComponent", { screen: "BarCodeScannerComponent" })}
                                        style={{ height: 45, justifyContent: "center", alignItems: "center", width: 45 }}>
                                        <Image style={{
                                            marginRight: 25,
                                            resizeMode: "contain",
                                            width: 25,
                                            height: 25,
                                            marginLeft: 15,
                                            alignSelf: "center"
                                        }}
                                            source={require('../../res/images/searchPhoto.png')} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => {
                                    this.CancelBtn()
                                }} style={{ justifyContent: "center", alignItems: "center", height: 45, width: "25%" }}>
                                    <Text style={{
                                        color: "#007AFF",
                                        fontFamily: "Helvetica Bold",
                                        fontSize: 17,
                                        marginRight: 8
                                    }}>{localeStrings.menuSliderStrings.cancel}</Text>
                                </TouchableOpacity>

                            </View>


                            <View style={{
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                alignSelf: 'center',
                                flexDirection: 'row',
                                width: "100%"

                            }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {this.renderMainCategories()}
                                </ScrollView>

                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {this.renderSubCategory()}
                                </ScrollView>

                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {this.renderSubSubCategory()}
                                </ScrollView>


                            </View>

                            <View style={{
                                backgroundColor: "#D8D8D8",
                                height: 35,
                                marginTop: 12,
                                justifyContent: "center",
                                alignItems: "flex-start"
                            }}>
                                {deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ?
                                    <Text style={{
                                        color: "black",
                                        marginLeft: 15,
                                        fontFamily: "Helvetica",
                                        fontSize: 12,
                                        textAlign: "right"
                                    }}>{this.state.Title}</Text> : <Text style={{
                                        color: "black",
                                        marginLeft: 15,
                                        fontFamily: "Helvetica",
                                        fontSize: 12
                                    }}>{this.state.Title}</Text>
                                }

                            </View>
                            <View style={{ flex: 1, marginBottom: 105 }}>
                                <FlatList
                                    style={{ flex: 1 }}
                                    updateCellsBatchingPeriod={100}
                                    maxToRenderPerBatch={10}
                                    legacyImplementation={true}
                                    removeClippedSubviews={true}
                                    initialNumToRender={10}
                                    keyExtractor={this._keyExtractor}
                                    data={this.state.itemsSearching}
                                    renderItem={this._renderItem}
                                />
                            </View>

                        </View>


                    </View>
                </SlidingUpPanel>
            </View>
        )
    }
}


class MyListItem extends React.PureComponent {

    constructor(props) {
        super(props);
    }


    render() {
        let LastIndex = this.props.itemCategories.length - 1;
        let LastCategory = this.props.itemCategories[LastIndex].n;


        return (

            <TouchableOpacity
                disabled={true}
                onPress={() => {
                    this.props.navigation.navigate("DetailsItem", {
                        name: "DetailsItem",
                        productData: this.props.itemFullData,
                        productType: LastCategory
                    })
                }}
                style={{
                    flex: 1,
                    justifyContent: "center",
                    marginTop: 5,
                    borderBottomColor: "#4A4A4A",
                    borderBottomWidth: 0.5
                }}>
                <View style={{
                    flex: 1,
                    width: "100%",
                    flexDirection: "row",
                    marginLeft: 15,
                    marginTop: 5
                }}>
                    <View
                        style={{ flexDirection: "column", width: "55%", marginBottom: 4, alignItems: "flex-start" }}>
                        {deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ? <Text style={{
                            color: "black",
                            fontSize: 16,
                            fontFamily: "Helvetica",
                            marginTop: 4,
                            textAlign: "right"
                        }}>{this.props.itemName}</Text> :
                            <Text style={{
                                color: "black",
                                fontSize: 16,
                                fontFamily: "Helvetica",
                                marginTop: 4
                            }}>{this.props.itemName}</Text>
                        }

                        {deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ? <Text style={{
                            color: "black",
                            fontSize: 16,
                            fontFamily: "Helvetica",
                            marginTop: 4,

                        }}>{this.props.itemDescription}</Text> : <Text style={{
                            color: "black",
                            fontSize: 16,
                            fontFamily: "Helvetica",
                            marginTop: 4
                        }}>{this.props.itemDescription}</Text>}

                        {I18nManager.isRTL ? <Text style={{
                            color: "#4A4A4A",
                            fontSize: 14,
                            fontFamily: "Helvetica",
                            marginTop: 4
                        }}>₪ {this.props.itemPrice}</Text> : deviceLocale === "he-IL" && GlobalVariables.userLanguage.value === "en-US" ? <Text style={{
                            color: "#4A4A4A",
                            fontSize: 14,
                            fontFamily: "Helvetica",
                            marginTop: 4,
                            textAlign: "right"
                        }}>{this.props.itemPrice} {GlobalVariables.restCurrencyCode.value}</Text> : <Text style={{
                            color: "#4A4A4A",
                            fontSize: 14,
                            fontFamily: "Helvetica",
                            marginTop: 4
                        }}>{this.props.itemPrice} {GlobalVariables.restCurrencyCode.value}</Text>}

                    </View>

                    <View style={{
                        width: "45%",
                        height: 100,
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8
                    }}>
                        <Image style={{ resizeMode: "contain", width: 95, height: 90 }}
                            source={{ uri: this.props.itemImage }} />

                    </View>

                </View>

            </TouchableOpacity>


        );
    }
}



const PageStyles = StyleSheet.create({

    roundCircleCategory:
    {
        width: ImageWidth,
        height: ImageHeight,
        borderRadius: ImageWidth / 2,
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#FFB300",
        justifyContent: 'center'
    },

    roundCircleCategorySelected: {
        width: ImageWidth,
        height: ImageHeight,
        borderRadius: ImageWidth / 2,
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#E2BA5D",
        justifyContent: 'center'
    },
    selectedSubSubSubCategory: {
        backgroundColor: "#F7B314",
        height: 45, width: 125,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginLeft: 8
    },
    UnselectedSubSubSubCategory: {

        height: 45,
        width: 125,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
        marginLeft: 8
    },


});

