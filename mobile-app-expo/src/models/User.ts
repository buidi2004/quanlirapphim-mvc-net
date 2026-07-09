export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender: string;
  city?: string;
  memberLevel: string;
  loyaltyPoints: number;
  totalSpent: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user: User;
  };
}
