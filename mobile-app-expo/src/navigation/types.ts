export type RootStackParamList = {
  // ── Drawer & Tabs ──
  MainDrawer: undefined;
  MainTabs: undefined;

  // ── Auth Flow ──
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;

  // ── Movie Flow ──
  MovieDetail: { movieId: number };
  MovieList: undefined;
  MyTickets: undefined;
  TicketDetail: { ticketId?: string };

  // ── Booking Flow ──
  QuickBook: undefined;
  SeatSelection: { showtimeId?: number; movieTitle?: string; cinemaName?: string; showDate?: string; showTime?: string; roomName?: string };
  Concession: { showtimeId?: number; movieTitle?: string };
  ConcessionDetail: { item?: any };
  Payment: { showtimeId?: number };
  PaymentSuccess: { transactionId?: string };

  // ── Cinema Flow ──
  CinemaList: undefined;
  CinemaDetail: { cinemaId?: number };
  GlobalShowtimes: undefined;

  // ── Search ──
  Search: undefined;

  // ── News / Promotions ──
  NewsList: undefined;
  NewsDetail: { newsId?: number; slug?: string };
  PromotionsList: undefined;
  PromotionDetail: { promotionId?: number; slug?: string };

  // ── Contact ──
  Contact: undefined;
  ContactDetail: { contactId?: string };

  // ── Profile Sub-pages ──
  EditProfile: undefined;
  ChangePassword: undefined;
  TransactionHistory: undefined;

  // ── Notifications / Settings ──
  Notification: undefined;
  Settings: undefined;

  // ── Error Screens ──
  NotFound: undefined;
  ServerError: undefined;

  // ── Splash & Onboarding ──
  Splash: undefined;
  Onboarding: undefined;

  // ── Experience ──
  ExperienceDetail: { type?: string };

  // ── Static Pages ──
  StaticPage: { page: 'membership' | 'faq' | 'terms' | 'privacy' };
};

// Types for Bottom Tabs
export type MainTabParamList = {
  HomeTab: undefined;
  MovieTab: undefined;
  BookingTab: undefined;
  CinemaTab: undefined;
  ProfileTab: undefined;
};
