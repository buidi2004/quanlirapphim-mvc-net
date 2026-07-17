import { apiClient } from '../api/apiClient';
import { PaginatedMoviesResponse, MovieDetailResponse, ShowtimeSummary } from '../models/Movie';

export const MovieService = {
  getMovies: async (status: 'now_showing' | 'coming_soon' = 'now_showing', page: number = 1, genre?: string): Promise<PaginatedMoviesResponse> => {
    let url = `/movies?status=${status}&page=${page}`;
    if (genre) {
      url += `&genre=${encodeURIComponent(genre)}`;
    }
    const response = await apiClient.get<PaginatedMoviesResponse>(url);
    return response.data;
  },

  getMovieDetail: async (id: number, date?: string): Promise<MovieDetailResponse> => {
    let url = `/movies/${id}`;
    if (date) {
      url += `?date=${date}`;
    }
    const response = await apiClient.get<MovieDetailResponse>(url);
    return response.data;
  },

  getMovieShowtimes: async (id: number, date?: string): Promise<{ success: boolean; data: { date: string; showtimes: ShowtimeSummary[] }; error?: string }> => {
    let url = `/movies/${id}/showtimes`;
    if (date) {
      url += `?date=${date}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  }
};
