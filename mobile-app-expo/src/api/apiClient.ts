import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

// Lấy URL cấu hình từ biến môi trường (EXPO_PUBLIC_API_URL)
// Nếu không có, tự động chuyển đổi tùy theo nền tảng (Platform)
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback mặc định khi không có .env
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5062'; // Android Emulator
  }
  return 'http://localhost:5062'; // iOS Simulator & Web
};

const API_BASE_URL = getBaseUrl(); 
export const IMAGE_BASE_URL = API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Sửa lỗi Axios: tự động chèn /api vào đầu đường dẫn thay vì để dấu / làm ghi đè baseURL
    if (config.url && config.url.startsWith('/')) {
      config.url = `/api${config.url}`;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from SecureStore', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
