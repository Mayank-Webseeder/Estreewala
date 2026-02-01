import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  Switch,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import appColors from '../../theme/appColors';
import Header from '../../components/header';
import { styles } from './styles';
import { BellIcon } from '../../assets/Icons/svg/bell';
import HelpSupportIcon from '../../assets/Icons/svg/helpSupport';
import Faq from '../../assets/Icons/svg/faq';
import { windowHeight } from '../../theme/appConstant';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomerDetails } from '../../redux/slices/customerSlice';
import TermsServiceIcon from '../../assets/Icons/svg/termsServiceIcon';
import DeleteAccountModal from '../../otherComponent/deleteModal';
import { deleteAccount } from '../../redux/slices/deleteAccountSlice';
import { useAuth } from '../../utils/context/authContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_FCM_TOKEN } from '../../utils/storageKeys';

import messaging from '@react-native-firebase/messaging';
import { updateFcmToken } from '../../redux/slices/notificationSlice';
import { useToast } from '../../utils/context/toastContext';
import { clearAddressState } from '../../redux/slices/addressSlice';
import { clearCart } from '../../redux/slices/cartSlice';

export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
};

const MenuItem = ({ icon, label, onPress, isLast, rightComponent }) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!!rightComponent}
  >
    <View style={styles.iconBox}>{icon}</View>
    <Text style={styles.menuText}>{label}</Text>
    {rightComponent ? (
      rightComponent
    ) : (
      <Icon name="chevron-forward" size={18} color="#999" />
    )}
  </TouchableOpacity>
);

export default function Profile({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { customerData } = useSelector(state => state.customer);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { logout } = useAuth();

  console.log('customerData in profile ', customerData);

  const getPermissionStatus = async () => {
    const status =
      (await messaging().hasPermission?.()) ??
      (await messaging().requestPermission());

    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async state => {
      if (state !== 'active') return;

      console.log('🔄 App resumed');

      const permissionGranted = await getPermissionStatus();

      if (!permissionGranted) {
        console.log('🚫 Permission revoked from settings');

        setNotificationsEnabled(false);
        await AsyncStorage.removeItem(ASYNC_FCM_TOKEN);
        dispatch(updateFcmToken(''));
        return;
      }

      // Permission granted
      setNotificationsEnabled(true);

      const storedToken = await AsyncStorage.getItem(ASYNC_FCM_TOKEN);

      if (!storedToken) {
        console.log('📲 Generating new FCM token');

        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        if (token) {
          dispatch(updateFcmToken(token));
          await AsyncStorage.setItem(ASYNC_FCM_TOKEN, token);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const init = async () => {
      const permissionGranted = await getPermissionStatus();

      setNotificationsEnabled(permissionGranted);

      if (!permissionGranted) {
        await AsyncStorage.removeItem(ASYNC_FCM_TOKEN);
        dispatch(updateFcmToken(''));
      }
    };

    init();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      const result = await dispatch(deleteAccount()).unwrap();
      console.log('Account deletion result:', result);
      await logout();
      dispatch(clearAddressState());
      await AsyncStorage.removeItem(ASYNC_FCM_TOKEN);
      await AsyncStorage.removeItem('userLocation');
      // await AsyncStorage.removeItem('userLocation');
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleRateApp = () => {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.estreewala&pcampaignid=web_share',
    );
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  useEffect(() => {
    dispatch(getCustomerDetails());
  }, [dispatch]);

  const handleNotificationToggle = async value => {
    if (!value) {
      // User manually turned OFF
      setNotificationsEnabled(false);
      await AsyncStorage.removeItem(ASYNC_FCM_TOKEN);
      dispatch(updateFcmToken(''));
      return;
    }

    // User turned ON
    const permissionGranted = await getPermissionStatus();

    if (!permissionGranted) {
      Alert.alert(
        'Enable Notifications',
        'Please allow notifications from settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();

    if (token) {
      dispatch(updateFcmToken(token));
      await AsyncStorage.setItem(ASYNC_FCM_TOKEN, token);
      setNotificationsEnabled(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      dispatch(clearAddressState());

      showToast('Logged out successfully', 'success');
    } catch (e) {
      console.log('Logout error:', e);
      showToast('Logout failed', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        <Header
          iconColor={appColors.white}
          titleStyle={{ color: appColors.white }}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingVertical: windowHeight(7) }}
          title="My Profile"
        />
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../assets/images/avtar.png')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          <Text style={styles.userName}>{customerData?.name}</Text>
          <Text style={styles.userEmail}>{customerData?.phone}</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==== USER INFO ==== */}

        {/* ==== First Group ==== */}
        <View style={styles.menuCard}>
          <MenuItem
            icon={
              <Icon name="person-outline" size={20} color={appColors.font} />
            }
            label="Personal Information"
            onPress={() => navigation.navigate('LoginSecurity')}
          />
          <MenuItem
            icon={<BellIcon size={18} color={appColors.font} />}
            label="Notification"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#ccc', true: appColors.font }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
          <MenuItem
            icon={
              <Icon name="location-outline" size={20} color={appColors.font} />
            }
            label="Manage Address"
            onPress={() => navigation.navigate('ManageAddress')}
            isLast
          />
        </View>

        {/* ==== Second Group ==== */}
        <View style={styles.menuCard}>
          {/* <MenuItem
            icon={<Icon name="key-outline" size={18} color={appColors.font} />}
            label="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
          /> */}
          <MenuItem
            icon={<HelpSupportIcon />}
            label="Contact Support"
            onPress={() => navigation.navigate('ContactSupport')}
          />
          <MenuItem
            icon={
              <Icon
                name="information-circle-outline"
                size={20}
                color={appColors.font}
              />
            }
            label="About Us"
            onPress={() => navigation.navigate('AboutUs')}
          />
          <MenuItem
            icon={
              <Icon
                name="shield-checkmark-outline"
                size={20}
                color={appColors.font}
              />
            }
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <MenuItem
            icon={<Faq />}
            label="FAQ"
            onPress={() => navigation.navigate('Faqs')}
          />
          <MenuItem
            icon={<TermsServiceIcon />}
            label="Terms Of Service"
            onPress={() => navigation.navigate('TermsOfServiceScreen')}
          />
          <MenuItem
            icon={<Icon name="star-outline" size={16} color={appColors.font} />}
            label="Rate Us"
            onPress={handleRateApp}
            isLast
          />
        </View>

        <View style={{ marginVertical: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDeleteModalVisible(true)}
            style={styles.deleteButton}
          >
            <Icon
              name="trash-outline"
              size={20}
              color="#f07777ff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <AntDesign
            name="logout"
            size={18}
            color="#555"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <DeleteAccountModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />
    </SafeAreaView>
  );
}
