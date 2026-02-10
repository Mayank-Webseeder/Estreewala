import { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthHeader from '../../../components/auth/authHeader';
import InputField from '../../../components/auth/inputField';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    console.log('Reset password for:', { email });
    navigation.navigate('ChangePassword')
    // Handle reset password logic
    // After successful request, you might navigate to a confirmation screen
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
          title="Forgot Password"
          subtitle="Enter your email to receive reset instructions"
           showBackButton={true}
             onBackPress={() => navigation.goBack()}
        />
        
        <View style={styles.formContainer}>
          <InputField
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TouchableOpacity 
            style={[styles.submitButton, !email && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={!email}
          >
            <Text style={styles.submitButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;