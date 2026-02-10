import React, { useEffect } from 'react'
import Navigation from './src/navigation/index'
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/utils/context/authContext';
import { Provider, useDispatch } from 'react-redux'
import { persistor, store } from "./src/redux/store"
import { ToastProvider } from './src/utils/context/toastContext';
import { PersistGate } from 'redux-persist/integration/react';
import { SocketProvider } from "./src/utils/context/socketContext"
import { requestUserPermission, getFcmToken, notificationListener } from "./src/utils/notification/notificationService"
import notifee, { AndroidImportance } from '@notifee/react-native';
import UpdateModal from "./src/otherComponent/updateModal"
import { StatusBar } from 'react-native';
import DisabledAccountModal from './src/otherComponent/DisabledAccountModal/DisabledAccountModal';
import NoInternetModal from './src/otherComponent/NoInternetModal/NoInternetModal';
import { setNetworkStatus } from './src/redux/slices/networkSlice';
import NetInfo from '@react-native-community/netinfo';


function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setNetworkStatus(state.isConnected));
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    requestUserPermission()
    getFcmToken()
    notificationListener()
  }, [])

  useEffect(() => {
    notifee.createChannel({
      id: 'default',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
    });
  }, []);



  return (
    <ToastProvider>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <AuthProvider>
        <SocketProvider>
          <UpdateModal />
          <NavigationContainer>
            <Navigation />
            <NoInternetModal />
            <DisabledAccountModal />
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}