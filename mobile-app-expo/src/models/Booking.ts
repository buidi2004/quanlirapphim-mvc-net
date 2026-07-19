export interface Seat {
  code: string;
  row: string;
  col: number;
  status: 'available' | 'holding' | 'paid' | 'maintenance';
  price: number;
  type?: 'Normal' | 'VIP' | 'Sweetbox';
}

export interface SeatMapResponse {
  success: boolean;
  data: {
    showtimeId: number;
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    showDate: string;
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
  data: {
    holdResult: {
      ticketIds: number[];
      expiryTime: string;
      remainingSeconds: number;
    }
  };
  error?: string;
}

export interface ApplyPromoRequest {
  promoCode: string;
  totalPrice: number;
}

export interface ApplyPromoResponse {
  success: boolean;
  data: {
    discount: number;
    finalPrice: number;
  };
  error?: string;
}

export interface ConfirmBookingRequest {
  ticketIds: number[];
  paymentMethod: string;
  promoCode?: string;
  concessions?: { id: number; quantity: number }[];
}

export interface ConfirmBookingResponse {
  success: boolean;
  data?: {
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
  };
  error?: string;
}
