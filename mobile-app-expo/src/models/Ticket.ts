export interface TicketHistoryItem {
  id: number;
  showtime_id: number;
  seat_code: string;
  status: string;
  total_price: number;
  booked_at: string;
  show_date: string;
  start_time: string;
  movie_title: string;
}

export interface MyTicketsResponse {
  success: boolean;
  data: TicketHistoryItem[];
  error?: string;
}

export interface TicketDetail {
  id: number;
  showtimeId: number;
  seatCode: string;
  status: string;
  totalPrice: number;
  bookedAt: string;
  movieTitle: string;
  posterUrl: string;
  ageRating: string;
  durationMinutes: number;
  showDate: string;
  startTime: string;
  roomName: string;
  cinemaName: string;
  ticketCode: string;
}

export interface TicketDetailResponse {
  success: boolean;
  data: TicketDetail;
  error?: string;
}
