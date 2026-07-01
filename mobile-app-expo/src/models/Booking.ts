export interface Seat {
  code: string;
  row: string;
  col: number;
  status: 'available' | 'holding' | 'paid' | 'maintenance';
  price: number;
}

export interface SeatMapResponse {
  success: boolean;
  data: {
    showtimeId: number;
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    startTime: string;
    basePrice: number;
    seats: Seat[];
  };
  error?: string;
}

export interface HoldSeatsRequest {
  showtimeId: number;
  seatCodes: string[];
  guestEmail?: string;
  guestPhone?: string;
}

export interface HoldSeatsResponse {
  success: boolean;
  ticketIds: number[];
  expiryTime: string;
  remainingSeconds: number;
  error?: string;
}

export interface ApplyPromoRequest {
  code: string;
  subtotal: number;
}

export interface ApplyPromoResponse {
  success: boolean;
  discount: number;
  totalPrice: number;
  error?: string;
}

export interface ConfirmBookingRequest {
  ticketIds: number[];
  paymentMethod: string;
  totalPrice: number;
  promotionCode?: string;
}

export interface ConfirmBookingResponse {
  success: boolean;
  transactionId?: string;
  bookingDetail?: {
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    startTime: string;
    seats: string[];
    subtotal: number;
    discount: number;
    totalPrice: number;
    paymentMethod: string;
    bookingDate: string;
  };
  error?: string;
}
