import { apiClient } from '../api/apiClient';
import { CinemasResponse, ProvincesResponse, CinemaShowtimesResponse } from '../models/Cinema';

export const CinemaService = {
  getCinemas: async (province?: string): Promise<CinemasResponse> => {
    let url = '/cinemas';
    if (province) {
      url += `?province=${encodeURIComponent(province)}`;
    }
    const response = await apiClient.get<CinemasResponse>(url);
    return response.data;
  },

  getProvinces: async (): Promise<ProvincesResponse> => {
    const response = await apiClient.get<ProvincesResponse>('/cinemas/provinces');
    return response.data;
  },

  getGlobalShowtimes: async (date: string): Promise<any> => {
    const response = await apiClient.get('/cinemas/global-showtimes', { params: { date } });
    return response.data;
  },

  getNearestCinemas: async (lat: number, lng: number, limit: number = 3): Promise<CinemasResponse> => {
    const response = await apiClient.get<CinemasResponse>(`/cinemas/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
    return response.data;
  },

  getCinemaShowtimes: async (id: number, date?: string): Promise<CinemaShowtimesResponse> => {
    let url = `/cinemas/${id}/showtimes`;
    if (date) {
      url += `?date=${date}`;
    }
    const response = await apiClient.get<CinemaShowtimesResponse>(url);
    return response.data;
  }
};
