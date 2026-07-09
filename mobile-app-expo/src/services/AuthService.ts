import { apiClient } from '../api/apiClient';
import { AuthResponse, ProfileResponse } from '../models/User';

export const AuthService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, fullName: string = '', phone: string = ''): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', { username, email, password, fullName, phone });
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<ProfileResponse> => {
    const response = await apiClient.put<ProfileResponse>('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};
