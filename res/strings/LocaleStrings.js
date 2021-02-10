import React from 'react';
import LocalizedStrings from 'react-native-localization';


const localeStrings = new LocalizedStrings({

        en: {
            otpScreen : {
                screenName: "Enter Digit Code",
                enterOtpMsg : "Enter Digit Code sent to your mobile number",
                resendOtp : "Resend Digit Code",
                resendOtpIn : "Resend Digit Code in ",
                attemptsRemaining : "Attempts Remaining",
                btnText: "Verify Digit Code",
                seconds:"seconds",
                getOTP : "Send Digit code",
                inputNumber: "Enter your mobile number to continue",
                inputOTP : "Please enter the Digit Code received via text on your mobile",
                wrongOTPInput : "We couldn't verify the credentials with our records.\nPlease try again.",
                unableToSend : "Sorry, we were unable to send the Digit Code."
            },
            firstPageStrings: {
                middleText1: "Login to Bob and start to order everywhere",
                middleText2: "and get socialize with your friends and others",
                signUp: "Sign Up",
                logIn: "Log In",
                signIn: "Sign In",
                missingDetails : "Please fill in your details in order to sign up with BOB"
            },
            logInStrings: {
                signIn: "Sign in",
                logIn: "Log in",
                enterValidEmail: "Please enter a valid email.",
                enterEmail: "Please enter your email.",
                enterPassword: "Please enter your password.",
                emailPlaceHolder: "Email",
                passwordPlaceHolder: "Password",
                forgotPassword: "Forgot your Password?",
                orJoin: "or join with",
                invalidNameOrPassword: "Invalid Email or Password",
                noDetailsMatch: "We were unable to verify the login information with our record.\nPlease try again.",
                enterLoginCredentials : "Please enter login credentials in order to continue",
                alertHeading : "Info",
                alertText: "Sorry we couldn't retrieve your email and can not allow you to connect to the application. \n Please try again",
            },
            signUpStrings: {
                signUp: "Sign Up",
                registerFailed: "Register failed! Make sure you completed the fields correctly",
                emailMatchStrings:"Emails do not match",
                passwordMatchStrings:"Passwords do not match",
                emailNotMatch: "Email and Re-type Email do not match!",
                passwordNotMatch: "Password and Confirm Password do not match!",
                register: "Register",
                orJoin: "or join with",
                fullNamePlaceHolder: "Full Name",
                birthdayPlaceHolder: "Birthday",
                emailPlaceHolder: "Email",
                retypeEmailPlaceHolder: "Re-type Email",
                passwordPlaceHolder: "Password",
                retypePasswordPlaceHolder: "Re-type Password",
                enterFullName: "Please enter your full name.",
                enterValidEmail: "Please enter a valid email.",
                enterEmail: "Please enter your email.",
                enterPassword: "Please enter your password.",
                enterStrongPassword: "Please provide a strong password."
            },
            forgotPasswordStrings: {
                hi: "Hi!",
                ops: "Ops!",
                completeAllFields: "Please complete the email field!",
                pleaseFollow: "Please follow the steps from this email:",
                toChange: " to change the password",
                ok: "Ok",
                somethingWentWrong: "Something went wrong! Please try again later.",
                cancel: "Cancel",
                passwordRecovery: "Password Recovery",
                enterYourEmail: "Enter your email and we'll send",
                linkResetPassword: "to you the link to reset the password.",
                submit: "Submit",
                emailPlaceHolder: "Email",
            },
            homeScreenStrings: {
                currentLocation : "Current Location",
                specialOffers: "Special Offers",
                reviewOurSpecial: "Review our special offers next to you.",
                locations: "Locations",
                checkIn: "Checkin",
                takeAway: "Take Away",
                delivery: "Delivery",
                orders: "Orders",
                inOrderTo: "In order to proceed further you must first Sign up/Login",
                logOut: "Log Out",
                logIn: "Log In",
                signIn: "Sign In / Sign Up",
                coupons: "Coupons",
                privacyPolicy: "Privacy Policy",
                termsAndConditions: "Terms and Conditions",
                versionNo: "Version No.",
                scanCode: "Scan Code",
                cancel: "Cancel",
                ok: "Ok",
                tableCodeConfirm: "Table Code Confirmed",
                done: "Done",
                quickMenu : "Quick Menu",
                //change language
                openOrder:"Open \n Order",
                changeLanguage:"Change Language",
                selectLanguage:"Select Language",
                english:"English",
                hebrew:"עברית",
                chat: "Chat",
                myWallet: "My Wallet",
                shareWithFriend:"Share with a friend",
                ordersHistory: "Orders History",
                shareMessageLoggeedIn : " invites you to join BOB and start enjoying our services.",
                shareMessage : " You Are invited to Join BOB and enjoy our services.",
                bestOffer : "Best Offers",
                switchOrderTypeTitle : "Switch Order Type",
                switchOrderTypeMessage : "Switching order type will empty your basket",
            },
            profileStrings: {
                editProfile: "Edit profile",
                viewProfile: "View profile",
                edit: "Edit",
                save: "Save",
                placeHolderName: "Enter your full name",
                placeHolderAge: "Enter your age",
                changePicture: "Change profile picture",
                changePassword: "Change Password",
                signOut: "Sign Out",
                forgotPassword: "Forgot your Password?",
                oldPassword: "Old password",
                newPassword: "New password",
            },
            ordersStrings: {
                orders: "Orders",
                noOrders: "No orders",
                orderNumber: "Order #",
                today: "Today",
                allOrders: "All Orders",
                //Translation needed
                newOrder:'New', //orderStatus:1
                onHoldOrder:'On Hold',//orderStatus:10
                payPendingOrder:'Pending Payment',//orderStatus:20
                payReceivedOrder:'Payment Received',//orderStatus:30
                payFailedOrder:'Payment Failed',//orderStatus:35
                invoicedOrder:'Invoiced',//orderStatus:40
                shippingOrder:'Shipping',//orderStatus:50
                shippedOrder:'Shipped',//orderStatus:60
                completeOrder:'Complete',//orderStatus:70
                cancelledOrder:'Cancelled',//orderStatus:80
                refundedOrder:'Refunded',//orderStatus:90
                closedOrder:'Closed',//orderStatus:100
                inProgress : 'In Progress',
                proceedBtn : "Proceed",
                goBack : "Go Back"



            },
            orderDetailsStrings: {
                myCart: "My Order",
                messageSent: "Message sent to waiter",
                ok: "OK",
                isLateDelivery: "Late delivery?",
                isProblem: "Is there a problem with your order?",
                part: "Part",
                all: "All",
                lateDelivery: "Late delivery",
                subTotal: "Subtotal",
                deliveryCharge: "Delivery Charge",
                tax: "VAT",
                locationDiscount:"Discount",
                total: "TOTAL",
                tips : "Tip",
                didNotReceive: "I did not receive my order",
                changeMyTable: "Changed my table",
                callTheWaiter: "Call the waiter",
                invoice: "Invoice",
                cancel: " Cancel ",
                yourOrderSummary: "Your Order Summary",
                quantity: "Quantity"
            },
            couponsStrings: {
                coupons: "Coupons",
                exploreMore: "Explore more promos around your location",
                checkOurCoupons: ",check our coupons",
            },
            scanCodeStrings: {
                cantScan: "Can't scan QR code",
                qrCodeNotCorrect: "QR code not correct please enter a table number and update the waiter",
                cancel: "Cancel",
                ok: "Ok",
                youMovedToFar: "You moved too far away from your current checked in restaurant, you will be checked out!",
            },
            bobLocationAllStrings: {
                searchFor: "Search for bar,beaches,hotels and other",
                filterBy: "Filter by distance from you",
                any: "Any",
                eightHundred: "800 m",
                twoKm: "2 km",
                fiveKm: "5 km",
                tenKm: "10 km",
                distance: "Distance:",
                km: "km"
            },
            barLocationStrings: {
                youMovedToFar: "You moved to far away from your current checked in restaurant, you will be checked out!",
                checkIn: "Check In",
                checkOut: "Check Out",
                youHaveSuccessfully: "You have successfully checked out!",
                noPeopleCheckIn: "Currently there are no people checked In",
                closed: "Closed",
                close: "Close ",
                open: "Open ",
                seeWhoIsIn: "See Who's in now",
                menu: "Menu",
                ohOh: "Oh oh...",
                toReview: "To review menu login first",
                checkInMsg: "To review menu Check-in first",
                checkInToAdd:"To add items to cart - check in first.",
                checkInToPay:"To add and pay- please check in first.",
                later: "Later",
                login: "Login",
                toContinue: "Please Login first to continue",
                youAreTooFar: "You are too far away from this restaurant!",
                areYouSure: "Are you sure you want to check in to ",
                cancel: "Cancel",
                ok: "Ok",
                reserveTable: "Reserve a table",
                checkInFailed: "Check in failed",
                pleaseTryAgain: "The table code is incorrect",
                scanCode: "Scan Code",
                typeCode: "Type Code",
                typeRoomTableNumber: "Room No.\\Table No.",
                typeTableNumber: "Type table No.",
                confirm: "Confirm",
                tableCodeConfirm: "Table Code Confirmed",
                done: "Done",
                exitLocationTitle: "Continue to Exit ?",
                exitLocationMessage: "Exiting location will Delete all Orders in Basket",
            },
            whoIsInStrings: {
                whosIn: "Who's In"
            },
            ratingStrings: {
                rateUs: "Rate us",
                inOrderTo: "In order to Check In you must first Sign up/Login",
                cancel: "Cancel",
                ok: "Ok",
                youDidNot: "You did not rate us!",
                thankYou: "Thank you!",
                yourRatingWasSent: "Your rating was send!",
                welcomeToOur: "Welcome to our restaurant",
                ifYouEnjoy: "If you enjoy, rate us!",
                addReview:"Add a review",
                send: "Send"
            },
            menuSliderStrings: {
                menu: "Menu",
                addItems: "Add items in your list",
                cancel: "Cancel",
                search: "Search",
                all: "All",
                youHave: "You have ",
                itemInList: " items in your list",
                pay: "Pay",
                welcomeTo: "Welcome to ",
                weHope: "We hope that you will enjoy yourself at us!",
                thankYou: "Thank you",
                youDontHaveItems: "You don't have items in cart",
                subTotal: "Subtotal",
                deliveryCharge: "Delivery Charge",
                tax: "VAT",
                total: "TOTAL",
                ourRestaurant: "our restaurant",
                discount: "Discount"
            },
            detailItemsStrings: {
                instructions: "Instructions",
                extraDressing: "Extras",
                choiceOfDressing: "Selections",
                firstCourse: "First course",
                quantity: "Quantity",
                specialInstructions: "Special Instructions",
                add: "ADD",
                apply: "APPLY"
            },
            orderCompletedStrings: {
                confirmation: "Confirmation",
                thankYou: "Thank you!",
                youJustConfirmed: "You just confirmed your order.",
                ourStaff: "Our staff is doing his best to deliver the order shortly.",
                orderNumber: "Order #",
                completed: "Completed",
                receiveOrder: "When you receive your order,",
                pleaseConfirm: "please open this page and confirm.",
                whenHeArrives: "When the waitress arrive with your order,",
                pleaseOpen: "Please open this page on your order page,",
                soHeWill: "so he will confirm your order"
            },
            deliveryAddressStrings : {
                screenName : "Delivery Address",                
                chooseOption: "Choose your delivery address",
                addMethod: "Add your delivery address",
                useAgain : "Use the saved address on the system",
                btnText: "Next",
                confirm: "Please confirm your address",
                textYes : "Yes",
                textNo : "No",
                invalidTitle : "Invalid Address",
                invalidText : "Please enter valid delivery address",
                serverError : "Server Error",
                serverErrorText : "Sorry, something went wrong. Please try again",
                ok : "Ok",
                chooseAnother : "Or choose another address",
                addNew : "Add a new delivery address",
                deleteMessage: "Are you sure you want to delete the address?",
                textOr: "or",
                forget : "Forget my address"
            },
            paymentStrings : {
                screenName : "Payments",                
                chooseOption: "Choose your payment method",
                addMethod: "Add your payment method",
                useAgain : "Use the saved credit card on the system",
                israCard : "Credit Card",
                payPal : "Pay with PayPal",
                transactionFee : "A transaction fee may apply",
                waitressTip : "Waitress tips",
                btnText : "Press to complete payment & order",
                alertHeading: "Info",
                warningText : "Please choose your payment method",
                alertText : "Do you want to keep your information about this card",
                textYes : "Yes",
                textNo : "No",
                chooseAnother : "Or choose another card",
                addNewCard : "Add a new payment method",
                deleteMessage: "Are you sure you want to delete the card?",
                textOr: "or",
                forgetCard : "Forget my card"
            }
            
        },

        he: {
            otpScreen : {
                screenName : "הזן קוד ספרתי",
                enterOtpMsg : "הזן את קוד הספרות שנשלח למספר הנייד שלך",
                resendOtp : "שלח שוב את קוד הספרות",
                resendOtpIn : "שלח את הקוד בספרה",
                attemptsRemaining : "ניסיונות שנותרו",
                btnText: "אמת",
                seconds:"שניות",
                getOTP:"קבל קוד דיגיטלי",
                inputNumber : "הזן את מספר הנייד שלך כדי להמשיך",
                inputOTP : "אנא הזן את קוד הספרות שהתקבל בטקסט הנייד שלך",
                wrongOTPInput : "לא יכולנו לאמת את האישורים עם הרשומות שלנו.\nבבקשה נסה שוב.",
                unableToSend : "מצטערים, לא הצלחנו לשלוח את הקוד הספרתי."
            },
            firstPageStrings: {
                middleText1: "הכנס לאפליקציה BOB והתחל להזמין מכל מקום.",
                middleText2: "",
                signUp: "הרש\מה",
                logIn : "התחברות",
                signIn: "כניסה",
                missingDetails : "אנא מלא את פרטיך כדי להירשם ל- BOB"

            },
            logInStrings: {
                signIn: "כניסה",
                enterValidEmail: "הקלד כתובת דואר אלקטרוני חוקי",
                enterEmail: "הקלד כתובת דואר אלקטרוני",
                enterPassword: " הקלד סיסמה",
                emailPlaceHolder: "דואר אלקטרוני",
                passwordPlaceHolder: "סיסמה",
                forgotPassword: "שכחת סיסמה?",
                orJoin:"הכנס\י באמצעות",
                invalidNameOrPassword:  "שגיאה בדואר האלקטרוני או בסיסמה",
                logIn : "התחברות",
                enterLoginCredentials: "אנא הכנס אישורי כניסה כדי להמשיך",
                noDetailsMatch : "לא הצלחנו לאמת את פרטי הכניסה עם הרשומה שלנו \n.בבקשה נסה שוב.",
                alertHeading: "מידע",
                alertText : "מצטערים שלא הצלחנו לאחזר את הדואל שלך ולא נוכל לאפשר לך להתחבר ליישום. \ n אנא נסה שוב"
            },
            signUpStrings: {
                signUp: "הרשמה",
                registerFailed: "משהו השתבש, אנא וודא הקלדה נכונה של הפרטים י",
                emailMatchStrings:"כתובות המייל אינן תואמות",
                passwordMatchStrings:"סיסמאות לא תואמות",
                emailNotMatch: "אימייל ואימייל מחדש לא תואמים!",
                passwordNotMatch: "סיסמא ואשר סיסמה אינם תואמים!",
                register: "הרשמה",
                orJoin: "הכנס\י באמצעות",
                fullNamePlaceHolder: "שם מלא",
                birthdayPlaceHolder: "תאריך לידה",
                emailPlaceHolder: "דואר אלקטרוני",
                retypeEmailPlaceHolder: "הקלד שוב את הדואר אלקטרוני שלך",
                passwordPlaceHolder: "סיסמה",
                retypePasswordPlaceHolder: "הקלד שוב סיסמה",
                enterFullName:"הקלד שם מלא",
                enterValidEmail: "הקלד כתובת דואר אלקטרוני חוקי",
                enterEmail: "הקלד את כתובת הדואר האלקטרוני שלך",
                enterPassword: "אנא הקלד סיסמה",
                enterStrongPassword: "הקלד סיסמה חזקה"
            },
            forgotPasswordStrings: {
                hi: "היי!",
                ops: "אופסס!",
                completeAllFields: "אנא השלם את פרטי הדואר אלקטרוני",
                pleaseFollow: "בצע את השלבים מדוא\"ל זה:",
                toChange: "שינוי סיסמה",
                ok: "בסדר",
                somethingWentWrong: "ההתחברות נכשלה אנא תנסה שוב מאוחר יותר",
                cancel: "ביטול",
                passwordRecovery: "שחזר סיסמה",
                enterYourEmail:"הקלד כתובת הדואר אלקטרוני  שלך",
                linkResetPassword: "הוראות לאיפוס סיסמה ישלחו אליך למייל",
                submit: "אשר",
                emailPlaceHolder: "אימייל",
            },
            homeScreenStrings: {
                currentLocation : "מיקום \n נוכחי",
                quickMenu: "הזמנה מהירה",
                signIn: "כניסה / הרשמה",
                specialOffers: "הצעות מיוחדות",
                //reviewOurSpecial: "המלצות מיוחדות בסביבתך",
                reviewOurSpecial: "סקור את ההצעות המיוחדות שלנו בקרבתך.",
                locations: "מקומות",
                checkIn: "סריקת ברקוד",
                takeAway: "איסוף עצמי",
                delivery: "משלוח",
                orders: "הזמנות",
                inOrderTo: "להתחבר לחשבון / להרשמה",
                logOut: "יציאה",
                logIn : "התחברות",
                coupons: "קופונים",
                privacyPolicy: "מדיניות הפרטיות",
                termsAndConditions:"תנאים כלליים",
                versionNo: " גרסה מס.",
                scanCode:"סורק QR",
                ok: "אוקיי",
                cancel: "ביטול",
                tableCodeConfirm: "קוד שולחן מאושר",
                done: "סיימתי",
                openOrder:"הזמנה \n פתוחה",
                changeLanguage:"שנה שפה",
                selectLanguage:"בחר שפה",
                english:"English",
                hebrew:"עברית",
                ordersHistory: 'היסטוריית הזמנות',
                shareWithFriend: 'שתפו עם חבר',
                shareMessageLoggeedIn: " הינך מוזמן להצטרף ל BOB ולהינות מהשירותים שלנו.",
                shareMessage : " הינך מוזמן להצטרף ל BOB ולהינות מהשירותים שלנו.",
                bestOffer : "הכי משתלמות",
                switchOrderTypeTitle : "Switch Order Type",
                switchOrderTypeMessage : "Switching order type will empty your basket",
            },
            profileStrings: {
                editProfile: "עדכון פרטים אישיים",
                edit: "ערוך",
                save: "שמור",
                placeHolderName: "שם מלא",
                placeHolderAge: "גיל המשתמש",
                changePicture: "החלף תמונת פרופיל",
                changePassword: "החלף סיסמה",
                signOut: "צא מהמערכת",
                forgotPassword: "שכחתי סיסמה",
                oldPassword: "הקלד סיסמה חדשה",
                newPassword: "סיסמה חדשה",
            },
            ordersStrings: {
                orders: "ההזמנות שלך",
                noOrders: "אין הזמנות",
                orderNumber: " הזמנה מספר",
                today: "היום",
                allOrders: "כל ההזמנות",
                newOrder:'חדש', //orderStatus:1
                onHoldOrder:'בהמתנה',//orderStatus:10
                payPendingOrder:'בהמתנה לתשלום',//orderStatus:20
                payReceivedOrder:'תשלום מתקבל',//orderStatus:30
                payFailedOrder:'התשלום נכשל',//orderStatus:35
                invoicedOrder:'חשבונית',//orderStatus:40
                shippingOrder:'משלוח',//orderStatus:50
                shippedOrder:'נשלח',//orderStatus:60
                completeOrder:'הושלם',//orderStatus:70
                cancelledOrder:'מבוטל',//orderStatus:80
                refundedOrder:'החזר כספי',//orderStatus:90
                closedOrder:'סגור',//orderStatus:100
                inProgress : 'בתהליך',
                proceedBtn : "להמשיך",
                goBack : "לחזור"
            },
            orderDetailsStrings: {
                myCart: "ההזמנות הפתוחות שלי",
                messageSent: "הודעה נשלחה למלצר",
                ok: "אוקיי",
                tips : "טיפ",
                isLateDelivery: "ההזמנה מתעכבת?",
                isProblem: "האם יש בעיה עם הזמנתך?",
                part: "חלק מההזמנה",
                all:"כל ההזמנה",
                lateDelivery: "המשלוח ההזמנה מתאחר",
                subTotal: "סיכום ביניים",
                deliveryCharge: "דמי משלוח",
                tax: "מע\"מ",
                locationDiscount:"הנחה",
                total: "סה'כ",
                didNotReceive: "ההזמנה טרם הגיע ",
                changeMyTable: "החלפתי שולחן ישיבה",
                callTheWaiter: "קרא למלצר",
                invoice: "חשבונית",
                cancel: " ביטול ",
                yourOrderSummary: "סיכום הזמנתך",
                quantity: "כמות"
            },
            couponsStrings: {
                coupons: "קופונים ומבצעים",
                exploreMore: "חפש פרומואים בסביבתך",
                checkOurCoupons: "בדוק את המבצעים להיום",
            },
            scanCodeStrings: {
                cantScan: "לא מצליח לסרוק את ה QR קוד",
                qrCodeNotCorrect: "קוד איננו תקין, אנא הכנס מספר שולחן ועדכן את המלצר\ית שלך",
                cancel: "ביטול",
                ok: "אוקיי",
                youMovedToFar: "התרחקת ממקום הבילוי אתה תנותק מהערכת - BoB",
            },
            bobLocationAllStrings: {
                searchFor: "חיפוש מקומות",
                filterBy: "מיין על פי מרחק",
                any: "הכל",

                eightHundred: "800 מ '",
                twoKm: "2 ק\"מ",
                fiveKm: "5 ק\"מ",
                tenKm: "10 ק\"מ",
                distance: "מרחק:",
                km: "ק\"מ"
            },
            barLocationStrings: {
                youMovedToFar: "התרחקת מהמקום, קשה למערכת לזהות אותך, המערכת תנתק אותך",
                checkIn: "כניסה למערכת",
                checkOut: "יציאה מהמערכת",
                youHaveSuccessfully: "התנתקת בהצלחה",
                noPeopleCheckIn: "כרגע אין משתמשים\חברים מחוברים",
                closed: "נסגרה",
                close: "סגור",
                open: "פתוח ",
                seeWhoIsIn: "בדוק מי נמצא",
                menu: "תפריט",
                ohOh: "אוי לא..",
                toReview: "על מנת לצפות בתפריט יש להתחבר קודם",
                checkInMsg: "כדי לבדוק תחילה את צ'ק-אין התפריט",
                checkInToAdd:"בכדי להוסיף מוצרים - אנא הרשם קודם",
                checkInToPay:"בכדי להוסיף מוצר ולשלם - אנא הרשם קודם",
                later: "מאוחר יותר",
                login: "התחברות",
                youAreTooFar: "המסעדה ממוקמת במרחק רב ",
                areYouSure: "מעוניין להתחבר?",
                cancel: "ביטול",
                ok: "אוקיי",
                reserveTable: "שמור שולחן",
                checkInFailed: " כניסת משתמש נכשלה",
                pleaseTryAgain: "קוד הטבלה שגוי",
                scanCode: "סורק QR",
                typeCode: "הקלד את הקוד",
                typeTableNumber: "הקלד מספר שולחן",
                confirm: "אשר",
                tableCodeConfirm: "מספר שולחן אושר",
                done: "בוצע",
                exitLocationTitle: "האם לצאת ?",
                exitLocationMessage: "יציאה מהמיקום תבטל את כל ההזמנות בסל",
            },
            whoIsInStrings: {
                whosIn: "מי נמצא"
            },
            ratingStrings: {
                rateUs: "חשוב לנו, תן לנו דירוג",
                inOrderTo: "בכדי להיכנס למערכת עליך לבצע תחילה רישום משתמש חדש או התחבר עם שם משתמש וסיסמה",
                cancel: "ביטול",
                ok: "אוקיי",
                youDidNot: "לא דירגת אותנו!",
                thankYou: "תודה רבה!",
                yourRatingWasSent: "הדירוג שלך עודכן",
                welcomeToOur: "ברוך הבא לפאב במסעדה שלנו",
                ifYouEnjoy: "נהנית? דרג אותנו!",
                addReview:"הוסף ביקורת",
                send: "שלח"
            },
            menuSliderStrings: {
                menu: "תפריט",
                addItems: "הוסף פריט להזמנתך",
                cancel: "ביטול",
                search: "חיפוש",
                all: "הכל",
                youHave: "יש לך",
                itemInList: "מוצרים ברשימה שלך",
                pay: "לתשלום",
                welcomeTo: "ברוך הבא ל ",
                weHope: "מקווים שתהנה מהבילוי אצלנו!",
                thankYou: "תודה רבה",
                youDontHaveItems: "הסל שלך ריק",
                subTotal: "סיכום ביניים",
                deliveryCharge: "דמי משלוח",
                tax: "מע\"מ",
                total: "סך הכל",
                ourRestaurant:"המסעדה שלנו",
                discount:"הנחה"
            },
            detailItemsStrings: {
                instructions: "הוראות",
                extraDressing: "תוספות",
                choiceOfDressing: "שינויים",
                firstCourse: "מנה ראשונה",
                quantity: "כמות",
                specialInstructions: "הוראות מיוחדות",
                add: "הוסף",
                apply: "מאשר"
            },
            orderCompletedStrings: {
                confirmation: "אישור",
                thankYou: "תודה רבה!",
                youJustConfirmed: "אישרת את הזמנתך",
                ourStaff: "הצוות עושה כמיטב יכולתו לספק את הזמנתך בהקדם",
                orderNumber: "הזמנה מספר #",
                completed: "הושלמה",
                receiveOrder: "כאשר אתה מקבל הזמנתך",
                pleaseConfirm: "אנא פתח דף זה ואשר.",
                whenHeArrives: "כשהמלצר מגיע עם הזמנתך",
                pleaseOpen: "אנא הצג דף זה",
                soHeWill: "בכדי לאשר הזמנתך"
            },
            deliveryAddressStrings : {
                screenName : "כתובת למשלוח",                
                chooseOption: "בחר את כתובת המסירה שלך",
                addMethod: "הוסף את כתובת המסירה שלך",
                useAgain : "השתמש בכתובת השמורה במערכת",
                btnText: "הבא",
                confirm: "אנא אשר את כתובתך",
                textYes : "כן",
                textNo : "לא",
                invalidTitle : "כתובת לא חוקית",
                invalidText : "אנא הזן כתובת מסירה חוקית",
                serverError : "שגיאת שרת",
                serverErrorText : "סליחה,  משהו השתבש.  אנא נסה שוב.",
                ok : "אוקיי",
                chooseAnother : "או בחר כתובת אחרת",
                addNew : "הוסף כתובת חדשה למשלוח",
                deleteMessage: "האם אתה בטוח שברצונך למחוק את הכתובת?",
                textOr : "או",
                forget : "מחק כתובת"
            },
            paymentStrings : {
                screenName : "תשלומים",
                chooseOption: "בחר את אמצעי התשלום שלך",     
                addMethod: "הוסף כרטיס אשראי",           
                useAgain : "השתמש בפרטי האשראי ששמרת במערכת?",
                israCard : "כרטיס אשראי",
                payPal : "שלם באמצעות PayPal",
                transactionFee : "תתכן עמלת עסקה",
                waitressTip : "טיפ למלצר",
                btnText : "לחץ להשלמת התשלום וההזמנה",
                alertHeading: "מידע",
                warningText : "בחר את אמצעי התשלום שלך",
                alertText : "האם ברצונך לשמור את המידע שלך בכרטיס זה",
                textYes : "כן",
                textNo : "לא",
                chooseAnother : "או בחר כרטיס אחר",
                addNewCard : "הוסף כרטיס אשראי חדש",
                deleteMessage: "האם אתה בטוח שברצונך למחוק את פרטי האשראי?",
                textOr : "או",
                forgetCard : "תשכח מהכרטיס שלי"
            }
        },
    }
);

module.exports = localeStrings;
