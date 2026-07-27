import { apiClient } from '../api/apiClient';
import { MyTicketsResponse, TicketDetailResponse } from '../models/Ticket';

export const TicketService = {
  getMyTickets: async (): Promise<MyTicketsResponse> => {
    const response = await apiClient.get<MyTicketsResponse>('/tickets/my-tickets');
    return response.data;
  },

  getTicketDetail: async (id: number): Promise<TicketDetailResponse> => {
    const response = await apiClient.get<TicketDetailResponse>(`/tickets/${id}`);
    return response.data;
  },

  getTicketSummary: async (): Promise<{ success: boolean; data?: { year: number, totalSpent: number }; error?: string }> => {
    const response = await apiClient.get('/tickets/summary');
    return response.data;
  }
};
