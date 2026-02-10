import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/header';
import { styles } from './styles';
import appColors from '../../../theme/appColors';
import { useAuth } from '../../../utils/context/authContext';

const ChangePasswordScreen = ({ navigation }) => {
    const { userToken, userLocation, isLoading } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    // Validate current password
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Please enter your current password';
      isValid = false;
    }

    // Validate new password
    if (!passwords.newPassword) {
      newErrors.newPassword = 'Please enter a new password';
      isValid = false;
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
      isValid = false;
    }

    // Validate confirm password
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = () => {
    if (!validateForm()) {
      return;
    }

    // Simulate password change
    // In a real app, you would call your API here
    console.log('Password changed successfully');
    userToken ? navigation.goBack() :
    // Navigate back after successful password change
   navigation.reset({
  index: 0,
  routes: [{ name: "PhoneLogin" }],
});
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const clearError = (field) => {
    setErrors({
      ...errors,
      [field]: ''
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Change Password"
        onBackPress={() => navigation.goBack()}
        showNotificationIcon={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View>
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={[
              styles.passwordInput, 
              errors.currentPassword ? { borderColor: appColors.error } : {}
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                secureTextEntry={!showPasswords.current}
                value={passwords.currentPassword}
                onChangeText={(text) => {
                  setPasswords({...passwords, currentPassword: text});
                  clearError('currentPassword');
                }}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility('current')}>
                <Icon
                  name={showPasswords.current ? 'eye-off' : 'eye'}
                  size={20}
                  color={appColors.gray}
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View style={[styles.inputContainer,{marginBottom: errors ? 10 : 15}]}>
            <Text style={styles.label}>New Password</Text>
            <View style={[
              styles.passwordInput, 
              errors.newPassword ? { borderColor: appColors.error } : {}
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                secureTextEntry={!showPasswords.new}
                value={passwords.newPassword}
                onChangeText={(text) => {
                  setPasswords({...passwords, newPassword: text});
                  clearError('newPassword');
                }}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
                <Icon
                  name={showPasswords.new ? 'eye-off' : 'eye'}
                  size={20}
                  color={appColors.gray}
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[
              styles.passwordInput, 
              errors.confirmPassword ? { borderColor: appColors.error } : {}
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                secureTextEntry={!showPasswords.confirm}
                value={passwords.confirmPassword}
                onChangeText={(text) => {
                  setPasswords({...passwords, confirmPassword: text});
                  clearError('confirmPassword');
                }}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility('confirm')}>
                <Icon
                  name={showPasswords.confirm ? 'eye-off' : 'eye'}
                  size={20}
                  color={appColors.gray}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
            <Text style={styles.saveButtonText}>Update Password</Text>
          </TouchableOpacity>

          <Text style={styles.passwordRequirements}>
            • Minimum 6 characters{'\n'}
            • Include letters and numbers{'\n'}
            • Avoid common passwords
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default ChangePasswordScreen;