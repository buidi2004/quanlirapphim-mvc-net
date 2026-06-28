export type RootStackParamList = {
  // ── Tabs ──
  MainTabs: undefined;

  // ── Auth Flow ──
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // ── Movie Flow ──
  MovieDetail: { movieId: number };
  TrailerModal: { videoUrl: string };
  Reviews: { movieId: number };

  // ── Booking Flow ──
  SeatSelection: { showtimeId: number };
  Concessions: { ticketIds: number[] };
  Checkout: { ticketIds: number[], concessionsTotal: number };
  PaymentSuccess: { transactionId: string };

  // ── Extra Pages (1-to-1 Web) ──
  NewsList: undefined;
  NewsDetail: { slug: string };
  PromotionsList: undefined;
  PromotionDetail: { slug: string };
  Experience: undefined; // Công nghệ chiếu IMAX, 4DX...
  Contact: undefined;
  Search: undefined;

  // ── Profile Sub-pages ──
  EditProfile: undefined;
  ChangePassword: undefined;
  MemberCard: undefined; // Hiển thị mã vạch
};

// Types for Bottom Tabs
export type MainTabParamList = {
  HomeTab: undefined;
  CinemasTab: undefined;
  TicketsTab: undefined;
  ProfileTab: undefined;
};
