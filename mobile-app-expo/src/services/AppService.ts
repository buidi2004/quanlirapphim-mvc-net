import { apiClient } from '../api/apiClient';

export const AppService = {
  getPromotions: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/app/promotions');
    return response.data;
  },

  getNews: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/app/news');
    return response.data;
  },

  getNotifications: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/app/notifications');
    return response.data;
  }
};
