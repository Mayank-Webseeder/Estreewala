import React from 'react';
import { Modal, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { windowWidth,windowHeight } from '../../theme/appConstant';

const NoInternetModal = () => {
  const isConnected = useSelector(
    state => state.network.isConnected,
  );

  return (
    <Modal
      visible={!isConnected}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
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
          <Icon
            name="wifi-off"
            size={56}
            color="#2d2f4e"
            style={{ marginBottom: windowHeight(16) }}
          />

          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Inter-Medium',
              marginBottom: 8,
              color: '#111',
            }}
          >
            No Internet Connection
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Please check your Wi-Fi or mobile data and try again.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default NoInternetModal;
