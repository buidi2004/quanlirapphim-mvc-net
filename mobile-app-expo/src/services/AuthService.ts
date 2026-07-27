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
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  deleteAccount: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.delete('/auth/delete-account');
    return response.data;
  },

  uploadAvatar: async (formData: FormData): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
    const response = await apiClient.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
