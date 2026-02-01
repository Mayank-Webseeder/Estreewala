import fonts from '../../../theme/appFonts';
import appColors from '../../../theme/appColors';
import { StyleSheet } from 'react-native';
import { fontSizes, windowHeight } from '../../../theme/appConstant';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  centerView: {
    justifyContent: 'center',
    // height:"80%",
    // width:"100%"
  },
  mainView: {
    marginHorizontal: 20,
  },
  mainContainer: {
    //  height:windowHeight(10)
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 56,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // 👈 keep same as container height
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginRight: -1,
    minWidth: 100,
    backgroundColor: appColors.inputField,
    shadowColor: appColors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 0.1,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    fontFamily: fonts.InterMedium,
    fontSize: fontSizes.FONT16, // slightly smaller for balance
    color: '#333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    borderColor: '#d2b48c',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: '#e6e6e6',
    fontFamily: fonts.InterMedium,
    fontSize: fontSizes.FONT16,
    color: '#333',
    backgroundColor: appColors.inputField,
    shadowColor: appColors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 0.1,
    height: 56, // 👈 match height
    textAlignVertical: 'center', // 👈 ensures text is vertically centered
  },
  focusedInput: {
    borderColor: appColors.blue,
    backgroundColor: '#fff',
  },
  submitButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: appColors.blue,
  },
  inactiveButton: {
    backgroundColor: appColors.inActive,
  },
  submitButtonText: {
    color: appColors.white,
    fontFamily: fonts.InterSemiBold,
    fontSize: 16,
  },

  resendOtp: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 6,
  },

  disabledResend: {
    opacity: 0.6,
  },

  activeResend: {
    opacity: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  resendOtpText: {
    fontFamily: fonts.InterMedium,
    color: appColors.blue,
    fontSize: 14,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: windowHeight(4),
  },
  checkboxTouchable: {
    padding: 3, //  invisible padding for better tap
  },
  termsContainer: {
    marginLeft: 6,
    flex: 1,
  },
  termsText: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    color: appColors.font,
  },
  highlightText: {
    color: '#947757',
    textDecorationLine: 'underline',
    fontFamily: fonts.InterSemiBold,
  },
  errorText: {
    color: appColors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 10,
    fontFamily: fonts.InterMedium,
  },
  errorInput: {
    borderColor: appColors.error,
    borderWidth: 1,
  },
  disabledResend: {
    opacity: 0.5,
  },
  box: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },

  focusedBox: {
    borderColor: appColors.darkBlue,
    backgroundColor: '#fff',
  },

  otpBoxesContainer: {
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBoxText: {
    fontSize: 20,
    color: '#333',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e6e6e6',
    backgroundColor: '#f8f8f8',
    padding: 10,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 25,
    left: 15,
    zIndex: 10,
  },

  backButtonCircle: {
    width: 40, // circle width
    height: 40, // circle height
    borderRadius: 20, // make it a perfect circle
    backgroundColor: appColors.darkBlue, // circle color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // optional shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // shadow for Android
  },
});
