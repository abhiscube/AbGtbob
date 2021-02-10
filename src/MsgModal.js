import React from "react";
import PropTypes from "prop-types";
import {I18nManager, Image, Text, TouchableOpacity, View} from "react-native";
import localeStrings from "../res/strings/LocaleStrings";
import Modal from "react-native-modal";
import StyleSheetFactory from "../res/styles/LocaleStyles";
const styles = StyleSheetFactory.getSheet(I18nManager.isRTL);
export default class MsgModal extends React.Component {
    onClose = e => {
        this.props.onClose && this.props.onClose(e);
    };
    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            // <div class="modal" id="modal">
            //     <h2>Modal Window</h2>
            //     <div class="content">{this.props.children}</div>
            //     <div class="actions">
            //         <button class="toggle-button" onClick={this.onClose}>
            //             close
            //         </button>
            //     </div>
            // </div>
            <Modal
                animationType="fade"
                //visible={this.props.show}
            >
                <View>
                    <View style={styles.modalSecondView}>
                        <Image source={require("../res/images/popuplogo.png")}
                               resizeMode='cover'
                               style={styles.modalImage}>
                        </Image>
                        <View style={styles.modalCenterText}>
                            <Text style={{
                                fontSize: 18,
                                color: "gray",
                                fontWeight: "bold"
                            }}>{localeStrings.barLocationStrings.ohOh}
                            </Text>
                            <Text style={{fontSize: 15, color: "black", marginTop: 15, textAlign: "center"}}>
                                {localeStrings.barLocationStrings.toReview}
                            </Text>
                        </View>
                        <Text style={{top: -12}}> ───────────────────────────────────── </Text>
                        <View style={styles.container}>
                            <TouchableOpacity style={styles.buttonStyle}
                                              onPress={() => this.setState({IsMsgModalVisible: false})}>
                                <Text style={styles.textStyle}>{localeStrings.barLocationStrings.later}</Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    borderLeftWidth: 1,
                                    borderLeftColor: 'black',
                                    borderStyle: 'solid',
                                    height: "146%",
                                    top: -22,
                                }}
                            />
                            <TouchableOpacity style={styles.buttonStyle} onPress={() => {
                                this.setState({IsMsgModalVisible: false});
                                this.goToLogin();
                            }}>
                                <Text style={styles.textStyle}>{localeStrings.barLocationStrings.login}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        );
    }
}
MsgModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};