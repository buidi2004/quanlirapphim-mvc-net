import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng Localtunnel (Public URL) để bỏ qua hoàn toàn lỗi mạng của máy ảo / điện thoại / Windows
const API_BASE_URL = 'https://grumpy-ears-film.loca.lt'; 
export const IMAGE_BASE_URL = 'https://grumpy-ears-film.loca.lt';

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
