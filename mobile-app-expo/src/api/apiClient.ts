import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng IP mạng LAN của máy tính Windows (192.168.1.5) để hỗ trợ cả máy ảo và điện thoại thật qua Expo Go
const API_BASE_URL = 'http://192.168.1.5:8080'; 
export const IMAGE_BASE_URL = 'http://192.168.1.5:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Sửa lỗi Axios: tự động chèn /api vào đầu đường dẫn thay vì để dấu / làm ghi đè baseURL
    if (config.url && config.url.startsWith('/')) {
      config.url = `/api${config.url}`;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from AsyncStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
