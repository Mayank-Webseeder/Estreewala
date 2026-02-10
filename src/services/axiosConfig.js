// api/axiosConfig.js
import axios from 'axios';
import { getGlobalToken, clearGlobalAuth, addTokenListener } from "../utils/context/authContext"
import { BASE_URL } from './api';
import { clearAccountDisabled, setAccountDisabled } from '../redux/slices/uiSlice';
import { store } from '../redux/store';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentToken = getGlobalToken();

addTokenListener((token) => {
  currentToken = token;
  console.log('🔐 Axios interceptor token updated:', !!token);
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = currentToken || getGlobalToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    store.dispatch(clearAccountDisabled());
    return response;
  },

  error => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log('❌ API Error:', status, message);

    if (
      status === 403 &&
      message?.toLowerCase().includes('disabled')
    ) {
      store.dispatch(setAccountDisabled(message));
    }

    if (status === 401) {
      clearGlobalAuth();
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;