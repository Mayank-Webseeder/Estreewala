import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerCustomer,
  registerSendOtp,
  registerVerifyOtp,
  resetOtpState,
  resetRegisterState,
  resetSignupOtpState,
} from '../../../redux/slices/authSlice';
import AuthHeader from '../../../components/auth/authHeader';
import InputField from '../../../components/auth/inputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { useToast } from '../../../utils/context/toastContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../../utils/context/authContext';
import { getFcmToken } from '../../../utils/notification/notificationService';
import { updateFcmToken } from '../../../redux/slices/notificationSlice';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { login } = useAuth();
  const { signupOtp, signupVerify } = useSelector(
  state => state.auth
);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const { showToast } = useToast();


  React.useEffect(() => {
    return () => {
      dispatch(resetSignupOtpState());
    };
  }, [dispatch]);

  const validateForm = () => {
    if (!name.trim()) {
      showToast('Please enter your full name', 'error');
      return false;
    }

    if (!phone.trim()) {
      showToast('Please enter your phone number', 'error');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return false;
    }

    return true;
  };


  const handleSendOtp = async () => {
    if (!validateForm()) return;

    try {
      const res = await dispatch(
        registerSendOtp({
          phone: phone.trim(),
          fullname: name.trim(),
        })
      ).unwrap();

      showToast(res?.message || 'OTP sent successfully', 'success');
      setShowOtpInput(true);
    } catch (error) {
      showToast(error, 'error');
    }
  };


  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showToast('Please enter OTP', 'error');
      return;
    }

    try {
      const res = await dispatch(
        registerVerifyOtp({
          phone: phone.trim(),
          fullname: name.trim(),
          otp: otp.trim(),
        })
      ).unwrap();

      if (res.success && res.token && res.customer) {
        await login(res.token, res.customer);

        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await dispatch(updateFcmToken(fcmToken));
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showToast(error || 'OTP verification failed', 'error');
    }
  };



  // const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isPhoneValid = /^\d{10}$/.test(phone.trim());

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAwareScrollView
        // contentContainerStyle={styles.contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
        enableOnAndroid
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title="Sign Up"
            subtitle="Join us to get started"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
          />

          <View style={{ marginHorizontal: 15 }}>

            <InputField
              icon="person-outline"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <InputField
              icon="call-outline"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            {!showOtpInput && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSendOtp}
              >
                <Text style={styles.submitButtonText}>Send OTP</Text>
              </TouchableOpacity>
            )}

            {showOtpInput && (
              <>
                <InputField
                  icon="lock-closed-outline"
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <TouchableOpacity
  style={styles.submitButton}
  onPress={handleVerifyOtp}
  // disabled={signupVerify.loading}
>
  <Text style={styles.submitButtonText}>
    {signupVerify.loading ? 'Verifying...' : 'Verify OTP'}
  </Text>
</TouchableOpacity>

              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
