import { apiClient } from '../api/apiClient';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const ContactService = {
  sendContact: async (data: ContactRequest): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/contacts', data);
    return response.data;
  }
};
