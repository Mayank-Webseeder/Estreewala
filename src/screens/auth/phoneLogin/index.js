import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
  PermissionsAndroid,
  Platform,
  BackHandler,
  Linking,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import OTPTextInput from 'react-native-otp-textinput';

import {
  sendOtp,
  verifyOtp,
  resetOtpState,
  resetVerifyState,
} from '../../../redux/slices/authSlice';
import messaging from '@react-native-firebase/messaging';
import { updateFcmToken } from '../../../redux/slices/notificationSlice';
import AuthHeader from '../../../components/auth/authHeader';
import { styles } from './styles';
import { countries } from '../../../utils/data';
import appColors from '../../../theme/appColors';
import { useToast } from '../../../utils/context/toastContext';
import { useAuth } from '../../../utils/context/authContext';

const PhoneLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { otpLoading, otpSent, verifyLoading } = useSelector(
    state => state.auth,
  );
  const { login, saveLocation } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [isChecked, setIsChecked] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [selectedCountry] = useState(countries[0]);

  const phoneInputRef = useRef();
  const otpRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { showToast } = useToast();

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      dispatch(resetOtpState());
      dispatch(resetVerifyState());
    };
  }, [dispatch]);

  useEffect(() => {
    const backAction = () => {
      if (isOtpSent) {
        setIsOtpSent(false);
        setOtp('');
        setResendTimer(30);
        return true; // prevent default back action
      }
      return false; // allow default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isOtpSent]);

  /* ================= OTP SENT ================= */
  useEffect(() => {
    if (!otpSent) return;

    setIsOtpSent(true);
    setResendTimer(30);
    dispatch(resetOtpState());

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [otpSent]);

  /* ================= RESEND TIMER ================= */
  useEffect(() => {
    if (!isOtpSent || resendTimer === 0) return;

    const timer = setTimeout(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer, isOtpSent]);

  /* ================= HELPERS ================= */

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const reverseGeocode = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LaundryApp/1.0',
          Accept: 'application/json',
        },
      },
    );
    return res.json();
  };

  const parseAddress = data => {
    const addr = data?.address || {};

    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        '',

      state: addr.state || addr.region || '',

      pincode: addr.postcode || '',
    };
  };

  const handleAutoAddress = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      return new Promise(resolve => {
        Geolocation.getCurrentPosition(
          async ({ coords }) => {
            const geoData = await reverseGeocode(
              coords.latitude,
              coords.longitude,
            );

            const parsed = parseAddress(geoData);

            resolve({
              coordinates: [coords.longitude, coords.latitude],
              city: parsed.city || 'Unknown City',
              state: parsed.state || 'Unknown State',
              pincode: parsed.pincode || '',
            });
          },
          error => {
            console.log('📍 Location error:', error);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      });
    } catch (e) {
      console.log('❌ Auto address failed:', e);
      return null;
    }
  };

  /* ================= OTP HANDLERS ================= */

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      showToast('Enter valid phone number', 'error');
      return;
    }

    try {
      await dispatch(sendOtp({ phone })).unwrap();
    } catch (err) {
      showToast(err || 'Failed to send OTP', 'error');
    }
  };

  const handleResendOtp = () => {
    if (resendTimer !== 0 || otpLoading) return;
    dispatch(sendOtp({ phone }));
    setResendTimer(30);
  };

  const handleVerifyOtp = async () => {
    try {
      const result = await dispatch(verifyOtp({ phone, otp })).unwrap();

      if (result?.message) showToast(result.message, 'success');

      if (result?.token && result?.customer) {
        await login(result.token, result.customer);
        try {
          const fcmToken = await messaging().getToken();
          console.log('📲 FCM Token:', fcmToken);

          if (fcmToken) {
            dispatch(updateFcmToken(fcmToken));
          }
        } catch (err) {
          console.log('❌ FCM token error:', err);
        }
        const locationData = await handleAutoAddress();

        if (locationData) {
          await saveLocation(locationData);
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (err) {
      showToast(err, 'error');
    }
  };

  const openTerms = () => {
    Linking.openURL('https://www.estreewalla.com/terms-and-conditions');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.estreewalla.com/privacy-policy');
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {isOtpSent && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setIsOtpSent(false);
                setOtp('');
                setResendTimer(30);
                dispatch(resetOtpState()); // reset Redux OTP state
              }}
            >
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={20} color={appColors.white} />
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.centerView}>
            <AuthHeader
              title="Sign in with Phone"
              subtitle={
                isOtpSent && phone.length === 10
                  ? `Enter the OTP sent to ${selectedCountry.dialCode}${phone}`
                  : 'Enter your phone number to continue'
              }
            />
            <View style={styles.mainView}>
              <View style={styles.mainContainer} />
              {!isOtpSent || phone.length !== 10 ? (
                <>
                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={[
                        styles.countryCodeContainer,
                        focusedField === 'country' && styles.focusedInput,
                      ]}
                      onFocus={() => setFocusedField('country')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <Text style={styles.flag}>{selectedCountry.flag}</Text>
                      <Text style={styles.countryCodeText}>
                        {selectedCountry.dialCode}
                      </Text>
                      {/* <Ionicons name="chevron-down" size={16} color="#666" /> */}
                    </TouchableOpacity>

                    <TextInput
                      ref={phoneInputRef}
                      style={[
                        styles.phoneInput,
                        focusedField === 'phone' && styles.focusedInput,
                      ]}
                      placeholder="Phone Number"
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      maxLength={10}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      phone.length === 10 && isChecked && !otpLoading
                        ? styles.activeButton
                        : styles.inactiveButton,
                    ]}
                    onPress={handleSendOtp}
                    disabled={phone.length < 10 || !isChecked || otpLoading}
                  >
                    <Text
                      style={[
                        styles.submitButtonText,
                        {
                          color:
                            phone.length === 10 && isChecked
                              ? appColors.white
                              : '#7a7a7a',
                        },
                      ]}
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsChecked(!isChecked)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.checkboxTouchable}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={isChecked ? appColors.primary : '#999'}
                      />
                    </TouchableOpacity>

                    {/* 👇 Text area also toggles checkbox */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsChecked(!isChecked)}
                      style={styles.termsContainer}
                    >
                      <Text style={styles.termsText}>
                        I agree to the{' '}
                        <Text style={styles.highlightText} onPress={openTerms}>
                          Terms & Conditions
                        </Text>{' '}
                        and{' '}
                        <Text
                          style={styles.highlightText}
                          onPress={openPrivacyPolicy}
                        >
                          Privacy Policy
                        </Text>
                        .
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <OTPTextInput
                    ref={otpRef}
                    inputCount={4}
                    tintColor={appColors.darkBlue}
                    offTintColor="#e6e6e6"
                    textInputStyle={styles.otpBoxText}
                    handleTextChange={setOtp}
                    keyboardType="number-pad"
                    containerStyle={styles.otpBoxesContainer}
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      otp.length === 4 && !verifyLoading
                        ? styles.activeButton
                        : styles.inactiveButton,
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={otp.length !== 4 || verifyLoading}
                  >
                    <Text style={styles.submitButtonText}>
                      {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resendOtp,
                      (resendTimer > 0 || otpLoading) && styles.disabledResend,
                    ]}
                    onPress={handleResendOtp}
                    disabled={resendTimer > 0 || otpLoading}
                  >
                    <Text
                      style={[
                        styles.resendOtpText,
                        {
                          color:
                            resendTimer > 0 || otpLoading
                              ? '#9E9E9E' // gray
                              : appColors.primary, // blue
                        },
                      ]}
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneLoginScreen;
