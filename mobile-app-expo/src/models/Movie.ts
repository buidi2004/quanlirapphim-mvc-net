export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  genre: string;
  director: string;
  cast: string;
  rating: number;
  posterUrl: string;
  trailerUrl?: string;
  status: string;
}

export interface Review {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ShowtimeSummary {
  id: number;
  cinemaId: number;
  cinemaName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
}

export interface MovieDetailResponse {
  success: boolean;
  movie: Movie;
  selectedDate: string;
  showtimes: ShowtimeSummary[];
  reviews: Review[];
  error?: string;
}

export interface PaginatedMoviesResponse {
  success: boolean;
  data: Movie[];
  pageIndex: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  error?: string;
}
