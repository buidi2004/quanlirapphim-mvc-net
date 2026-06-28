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
  token: string;
  user: User;
  error?: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
  message?: string;
  error?: string;
}
