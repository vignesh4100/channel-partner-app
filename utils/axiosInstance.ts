import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
  baseURL: 'https://noqu.co.in/db',
  timeout: 10000,
});

// Automatically attach token to each request
axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
