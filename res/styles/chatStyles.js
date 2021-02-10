
import  {StyleSheet} from 'react-native';

const chatStyles = StyleSheet.create({

    chatInviteButton: {
        backgroundColor: "#9ab7ff",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
    },
    renderComposerTextInput: {
        paddingTop: 5,
        paddingBottom: 5,
        width: "80%",
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 8,
        backgroundColor: "white",
        borderRadius: 10,
        fontSize: 15
    },
    modalFirstView: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    modalSecondView: {
        marginTop: "10%",
        backgroundColor: "white",
        width: "75%",
        height: "60%",
        borderRadius: 10,
    },
    modalCloseButton: {
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        width: 35,
        height: 35
    },
    modalImage: {
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    modalCenterText: {
        marginTop: 15,
        marginBottom: 15,
        width: "70%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    },
    modalInviteButton: {
        marginTop: 20,
        width: "100%",
        height: 35,
        backgroundColor: "#9ab7ff",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center"
    }

});

export default chatStyles;