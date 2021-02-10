/*import React from "react";
import {Text, TouchableOpacity, View, StyleSheet, Platform, Modal, Image} from "react-native";
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat'
import {KeyboardAccessoryView} from "react-native-keyboard-input";
import {BlurView} from 'react-native-blur';

const IsIOS = Platform.OS === 'ios';
const TrackInteractive = true;

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';

let UserTitle = "Mary Turner";

import chatStrings from '../../res/strings/chatStrings';
import chatStyles from "../../res/styles/chatStyles";

export default class Chat extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: UserTitle,
            headerStyle: {
                backgroundColor: '#9ab7ff',
                borderBottomWidth: 0,
                shadowColor: "transparent",
                elevation: 0,
                shadowOpacity: 0
            },

            headerTintColor: '#fff',
            headerTitleStyle: {
                textAlign: "center",
                flex: 1,
                alignSelf: "center",
                color: '#fefefe',

                fontSize: 17,
                fontFamily: "Helvetica"
            },
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            viewRef: null,
            userName: "Mary Turner",
            userImage: require("../../res/images/chatImages/image.jpg"),
            modalVisible: false,
            messages: [],
            messageText: ""
        };

        this.keyboardAccessoryViewContent = this.keyboardAccessoryViewContent.bind(this);
        this.renderInputToolbar = this.renderInputToolbar.bind(this);
        this.renderBubble = this.renderBubble.bind(this);
        this.renderComposer = this.renderComposer.bind(this);
    }

    componentWillMount() {

        this.setState({
            customKeyboard: {
                component: undefined,
                
                initialProps: undefined,
            },
            receivedKeyboardData: undefined,
            messages: [
                {
                    _id: 1,
                    text: 'Hello! How can i help you ?',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                    },
                },
            ],
        })
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: "#a5c489",
                        color: "black"
                    },
                    left: {
                        backgroundColor: "#a0c8d4",
                        color: "black"
                    }
                }}
                textStyle={{
                    right: {
                        color: "black"
                    },
                    left: {
                        color: "black"
                    }
                }}
            />
        )
    }

    keyboardAccessoryViewContent() {
        const InnerContainerComponent = (IsIOS && BlurView) ? BlurView : View;
        return (
            <InnerContainerComponent blurType="xlight" style={{height: 45}}>
                <TouchableOpacity
                    onPress={() => {
                        this.setModalVisible(!this.state.modalVisible);
                    }}
                    style={chatStyles.chatInviteButton}>
                    <Text style={{color: "white", fontSize: 20, textAlign: "center"}}>{chatStrings.inviteButton}</Text>
                </TouchableOpacity>
            </InnerContainerComponent>
        );
    }

    renderInputToolbar(props) {
        return (
            <InputToolbar {...props} containerStyle={{backgroundColor: "#f1f1f1"}}/>
        )
    }

    renderComposer() {
        return (
            <AutoGrowingTextInput
                maxHeight={200}
                underlineColorAndroid="transparent"
                ref={input => {
                    this.textInput = input
                }}
                style={chatStyles.renderComposerTextInput}
                onChangeText={(text) => this.state.messageText = text}
                placeholderTextColor="gray" placeholder="Message"/>
        )
    }

    onSend(messages = []) {
        this.setState(previousState => ({messages: GiftedChat.append(previousState.messages, messages),}));
        this.textInput.clear();
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <GiftedChat
                    renderComposer={this.renderComposer}
                    alwaysShowSend={true}
                    renderInputToolbar={this.renderInputToolbar}
                    renderAvatar={null}
                    messages={this.state.messages}
                    onSend={messages => {
                        messages[0].text = this.state.messageText;
                        this.onSend(messages);
                    }}
                    user={{_id: 1}}
                    renderBubble={this.renderBubble}
                    renderAccessory={() =>
                        <KeyboardAccessoryView
                            renderContent={this.keyboardAccessoryViewContent}
                            onHeightChanged={IsIOS ? height => this.setState({keyboardAccessoryViewHeight: height}) : undefined}
                            trackInteractive={TrackInteractive}
                            revealKeyboardInteractive
                        />}
                />
                <Modal
                    animationType="fade"
                    visible={this.state.modalVisible}
                    transparent={true}>
                    <View style={chatStyles.modalFirstView}>
                        <View style={chatStyles.modalSecondView}>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setModalVisible(!this.state.modalVisible);
                                }}
                                style={chatStyles.modalCloseButton}>
                                <Text style={{fontSize: 22, color: "gray", fontWeight: "bold"}}>X</Text>
                            </TouchableOpacity>

                            <Image source={this.state.userImage}
                                   resizeMode='cover'
                                   style={chatStyles.modalImage}>
                            </Image>
                            <View style={chatStyles.modalCenterText}>
                                <Text style={{
                                    fontSize: 18,
                                    color: "gray",
                                    fontWeight: "bold"
                                }}>{this.state.userName}</Text>
                                <Text style={{fontSize: 15, color: "black", marginTop: 25, textAlign: "center"}}>
                                    {chatStrings.invitePopUp}{this.state.userName.substr(0, this.state.userName.indexOf(' '))} {chatStrings.invitePopUp2}</Text>
                                <TouchableOpacity

                                    style={chatStyles.modalInviteButton}>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 17,
                                            color: "white"
                                        }}>{chatStrings.inviteButton}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        );
    }
}


*/