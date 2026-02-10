import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import addressReducer from '../redux/slices/addressSlice';
import nearByVendorReducer from '../redux/slices/nearByVendor';
import orderReducer from '../redux/slices/orderSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import cartReducer from '../redux/slices/cartSlice';
import myOrderReducer from '../redux/slices/myOrderSlice'
import customerReducer from "../redux/slices/customerSlice"
import searchReducer from "../redux/slices/searchSlice"
import notificationReducer from "../redux/slices/notificationSlice"
import deleteAccountReducer from "../redux/slices/deleteAccountSlice"
import orderDetailReducer from "../redux/slices/orderDetailSlice";
import uiReducer from './slices/uiSlice';
import networkReducer from './slices/networkSlice';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart'], 
};

const rootReducer = combineReducers({
  ui: uiReducer,
  network: networkReducer,
  auth: authReducer,
  address: addressReducer,
  nearByVendor: nearByVendorReducer,
  order: orderReducer,
  cart: cartReducer,
  myOrder: myOrderReducer,
  customer: customerReducer,
  search: searchReducer,
  notification: notificationReducer,
  deleteAccount: deleteAccountReducer,
  orderDetail: orderDetailReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
