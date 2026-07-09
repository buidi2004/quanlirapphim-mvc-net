import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Lấy URL cấu hình từ biến môi trường (EXPO_PUBLIC_API_URL)
// Nếu không có, tự động chuyển đổi tùy theo nền tảng (Platform)
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback 1: Trích xuất IP thật của máy tính từ Metro Bundler (rất tốt khi test trên điện thoại thật)
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5062`;
  }

  // Thay vì 10.0.2.2 hoặc localhost, trỏ thẳng tới IP LAN thực tế của máy tính
  // Để Expo Go trên điện thoại thật bắt được tín hiệu Backend
  return 'http://192.168.1.3:5062'; 
};

const API_BASE_URL = getBaseUrl(); 
export const IMAGE_BASE_URL = API_BASE_URL;
console.log('API_BASE_URL is:', API_BASE_URL);
console.log('IMAGE_BASE_URL is:', IMAGE_BASE_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Thêm timeout 10s tránh lỗi treo app vĩnh viễn (memory leak loop)
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
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e: any) {
      console.log('Error fetching token:', e?.message || e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // No unwrapping needed, we will fix the frontend models to match the backend.
    return response;
  },
  async (error) => {
    // Xử lý lỗi Network Error hoặc Timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({ message: 'Kết nối máy chủ bị quá hạn. Vui lòng kiểm tra lại mạng.' });
      }
      return Promise.reject({ message: 'Lỗi kết nối. Không thể liên lạc với máy chủ.' });
    }

    // Xử lý bảo mật: Token hết hạn hoặc không hợp lệ
    if (error.response.status === 401) {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
      // TODO: Có thể emit event để đá văng User ra khỏi màn hình hiện tại
      return Promise.reject({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    }

    if (error.response && error.response.data) {
       return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);
