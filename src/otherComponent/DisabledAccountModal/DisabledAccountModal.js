import React, { useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../utils/context/authContext';
import { clearAccountDisabled } from '../../redux/slices/uiSlice';
import { windowHeight, windowWidth } from '../../theme/appConstant';
import { clearAddressState } from '../../redux/slices/addressSlice';

const DisabledAccountModal = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();

  const { isAccountDisabled, disabledMessage } = useSelector(
    state => state.ui,
  );

  const isConnected = useSelector(
    state => state.network.isConnected
  );

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem('userLocation');
      dispatch(clearAccountDisabled());
      dispatch(clearAddressState());
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <Modal
      visible={isAccountDisabled && isConnected}
      transparent
      animationType="fade"
      onRequestClose={() => { }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '82%',
            backgroundColor: '#fff',
            paddingVertical: windowHeight(28),
            paddingHorizontal: windowWidth(20),
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              height: windowHeight(50),
              width: windowHeight(50),
              borderRadius: "50%",
              backgroundColor: '#dbdcedff',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: windowHeight(10),
            }}
          >
            <Icon
              name="account-lock"
              size={40}
              color="#2d2f4e"
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Inter-Medium',
              marginBottom: 8,
              color: '#111',
              textAlign: 'center',
            }}
          >
            Account Disabled
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter-Regular',
              color: '#555',
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: windowHeight(20),
            }}
          >
            {disabledMessage}
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{
              width: '100%',
              backgroundColor: '#2d2f4e',
              paddingVertical: windowHeight(8),
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                fontFamily: 'Inter-Medium',
                fontSize: 15,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DisabledAccountModal;
