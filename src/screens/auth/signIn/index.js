import { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthHeader from '../../../components/auth/authHeader';
import InputField from '../../../components/auth/inputField';
import AuthFooter from '../../../components/auth/authFooter';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { windowHeight } from '../../../theme/appConstant';

const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      // await login('user_token_here'); // Save token
      console.log('Sign in with:', { email, password });
      navigation.navigate('SetLocation');
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to your account"
          bannerStyle={{ height: windowHeight(240) }}
        />
        <View style={styles.formContainer}>
          <InputField
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!email || !password) && styles.disabledButton,
            ]}
            onPress={handleSignIn}
            disabled={!email || !password}
          >
            <Text style={styles.submitButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.phoneLoginButton}
            onPress={() => navigation.navigate('PhoneLogin')}
          >
            <Text style={styles.phoneLoginButtonText}>Sign in with Phone</Text>
          </TouchableOpacity>

          <AuthFooter
            text="Don't have an account?"
            buttonText="Sign Up"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignInScreen;
