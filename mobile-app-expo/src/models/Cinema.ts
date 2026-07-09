export interface Cinema {
  id: number;
  name: string;
  slug: string;
  province: string;
  address: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  phone?: string;
  email?: string;
  openingHours?: string;
  description?: string;
  facilities?: string;
}

export interface CinemasResponse {
  success: boolean;
  data: Cinema[];
  error?: string;
}

export interface ProvincesResponse {
  success: boolean;
  data: string[];
  error?: string;
}

export interface CinemaShowtimeGroup {
  movie: {
    id: number;
    title: string;
    durationMinutes: number;
    genre: string;
    posterUrl: string;
  };
  showtimes: {
    id: number;
    roomName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
}

export interface CinemaShowtimesResponse {
  success: boolean;
  date: string;
  data: CinemaShowtimeGroup[];
  error?: string;
}
