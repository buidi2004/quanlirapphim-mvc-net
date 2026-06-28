import { apiClient } from '../api/apiClient';
import { 
  SeatMapResponse, 
  HoldSeatsRequest, 
  HoldSeatsResponse, 
  ApplyPromoRequest, 
  ApplyPromoResponse, 
  ConfirmBookingRequest, 
  ConfirmBookingResponse 
} from '../models/Booking';

export const BookingService = {
  getSeatMap: async (showtimeId: number): Promise<SeatMapResponse> => {
    const response = await apiClient.get<SeatMapResponse>(`/booking/seatmap/${showtimeId}`);
    return response.data;
  },

  holdSeats: async (data: HoldSeatsRequest): Promise<HoldSeatsResponse> => {
    const response = await apiClient.post<HoldSeatsResponse>('/booking/hold', data);
    return response.data;
  },

  applyPromo: async (data: ApplyPromoRequest): Promise<ApplyPromoResponse> => {
    const response = await apiClient.post<ApplyPromoResponse>('/booking/apply-promo', data);
    return response.data;
  },

  confirmBooking: async (data: ConfirmBookingRequest): Promise<ConfirmBookingResponse> => {
    const response = await apiClient.post<ConfirmBookingResponse>('/booking/confirm', data);
    return response.data;
  }
};
