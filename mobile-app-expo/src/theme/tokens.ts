// CinemaXNet Design Tokens — Mobile
// Kế thừa CSS Variables từ Web CinemaXNet
// Updated: iOS-Native Glassmorphism & Dock UI Standards

import { Appearance } from 'react-native';

export const DarkColors = {
  // Brand
  accent: '#e50914',
  accentLight: 'rgba(229,9,20,0.15)',
  gold: '#FFD700',
  goldLight: 'rgba(255,215,0,0.15)',
  warning: '#6f42c1',
  warningLight: 'rgba(111,66,193,0.12)',

  // Dark theme (default)
  background: '#0d0d0d',
  surface: '#1a1d23',
  card: '#1a1a2e',
  cardBorder: '#2d2d44',
  textPrimary: '#ffffff',
  textSecondary: '#8b949e',
  textMuted: '#6c757d',

  // Semantic
  success: '#198754',
  successLight: 'rgba(25,135,84,0.15)',
  info: '#0dcaf0',
  danger: '#dc3545',

  // Age Rating badges
  badgeC13: '#ff9800',
  badgeC18: '#f44336',
  badgeP: '#4caf50',
  badgeNow: '#4caf50',
  badgeSoon: '#2196f3',

  // Seat colors
  seatAvailable: '#2d2d44',
  seatSelected: '#e50914',
  seatBooked: '#6c757d',
  seatVipBorder: '#FFD700',

  // Glass / Blur effect colors
  glass: {
    background: 'rgba(18, 18, 30, 0.65)',
    backgroundLight: 'rgba(26, 26, 46, 0.55)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    tint: 'rgba(13, 13, 13, 0.4)',
    topHighlight: 'rgba(255, 255, 255, 0.35)',
  },
};

export const LightColors = {
  ...DarkColors,
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e0e0e0',
  textPrimary: '#212529',
  textSecondary: '#495057',
  textMuted: '#adb5bd',
  seatAvailable: '#e9ecef',
  glass: {
    background: 'rgba(255, 255, 255, 0.65)',
    backgroundLight: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 0, 0, 0.12)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    tint: 'rgba(255, 255, 255, 0.4)',
    topHighlight: 'rgba(255, 255, 255, 0.65)',
  },
};

export const Colors = Appearance.getColorScheme() === 'light' ? LightColors : DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// iOS-Native Rounded Corners — Chuẩn bo cong kiểu iOS (Tối giản hơn)
export const Radius = {
  xs: 4,      // Badge nhỏ, seat ghế
  sm: 6,      // Badge, small chips
  md: 8,      // Input fields, small buttons
  btn: 8,     // Buttons chính (CTA)
  lg: 10,     // Cards nhỏ, section items
  card: 12,   // Cards lớn (movie card, payment card, promo card)
  xl: 16,     // Sections, modals, bottom sheets
  dock: 20,   // Floating Dock Tab Bar
  pill: 999,  // Rounded pill (tags, status chips)
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  dock: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  glass: {
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  price: { fontSize: 20, fontWeight: '700' as const },
};

// Backward compat alias
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  typography: Typography,
};
