// CinemaXNet Design Tokens — Mobile
// Kế thừa CSS Variables từ Web CinemaXNet

export const Colors = {
  // Brand
  accent: '#e50914',
  accentLight: 'rgba(229,9,20,0.15)',
  gold: '#FFD700',
  goldLight: 'rgba(255,215,0,0.15)',
  warning: '#ffc107',
  warningLight: 'rgba(255,193,7,0.12)',

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
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 8,
  btn: 8,
  lg: 12,
  card: 12,
  xl: 16,
  pill: 999,
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
};

export const Typography = {
  hero: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  price: { fontSize: 20, fontWeight: '800' as const },
};

// Backward compat alias
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  typography: Typography,
};
