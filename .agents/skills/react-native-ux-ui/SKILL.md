---
name: react-native-ux-ui
description: >
  Triển khai giao diện và trải nghiệm người dùng cho nền tảng Mobile App CinemaXNet (React Native / Expo).
  Được chuyển đổi và tối ưu trực tiếp từ bộ quy chuẩn UX/UI của Web (SKILL.md gốc).
  Kích hoạt skill này khi người dùng yêu cầu xây dựng, chỉnh sửa hoặc refactor BẤT KỲ thành phần UI nào
  trên App Mobile: trang chủ, danh sách phim, chi tiết phim, đặt vé nhanh, sơ đồ ghế, bắp nước,
  thanh toán, kết quả thanh toán, hệ thống rạp, hồ sơ, vé của tôi, tin tức, khuyến mãi, tìm kiếm,
  liên hệ, trải nghiệm đặc biệt, thể loại, chương trình thành viên, đổi mật khẩu, lịch sử giao dịch,
  dark mode, quét QR, geolocation, hay bất kỳ trang nào thuộc hệ sinh thái app mobile.
---

# CinemaXNet Mobile App — Skill UX/UI (React Native / Expo)

Kỹ năng này kế thừa **100%** các nguyên tắc thiết kế từ Web CinemaXNet và được tối ưu riêng cho Mobile.
Tài liệu này là **nguồn sự thật duy nhất** cho mọi quyết định UI/UX trên app mobile.

---

## Nguyên tắc thiết kế cốt lõi

1. **Không gián đoạn luồng mua vé** — Navigation phải mượt mà, không block toàn màn hình khi tải dữ liệu. Dùng Skeleton Loaders.
2. **Luôn hiển thị tổng tiền** — Order Summary luôn neo ở bottom bar (Fixed) trong suốt luồng: chọn ghế → bắp nước → thanh toán.
3. **Fallback graceful** — Mọi component phụ thuộc API phải có phương án dự phòng (UI lỗi thân thiện + nút Retry). Không bao giờ crash toàn màn hình.
4. **Mobile-first interactions** — Không hover (thay bằng `Pressable` scale), sử dụng swipe gestures, pull-to-refresh, và haptic feedback.

---

## Bản đồ màn hình: Web → Mobile

> Bảng ánh xạ đầy đủ tất cả Views trên Web sang screens trên Mobile.

### Nhóm A: Tab chính (Bottom Tab Navigator)

| # | Web View | Mobile Screen | File path | Tab |
|---|----------|---------------|-----------|-----|
| A1 | `Home/Index.cshtml` | `HomeScreen` | `src/screens/Home/HomeScreen.tsx` | 🏠 Trang chủ |
| A2 | `Movie/Index.cshtml` | `MovieListScreen` | `src/screens/Movie/MovieListScreen.tsx` | 🎬 Phim |
| A3 | `Booking/Fast.cshtml` | `QuickBookScreen` | `src/screens/Booking/QuickBookScreen.tsx` | ⚡ Đặt vé |
| A4 | `Cinema/Index.cshtml` | `CinemaListScreen` | `src/screens/Cinema/CinemaListScreen.tsx` | 🏢 Rạp |
| A5 | `Profile/Index.cshtml` | `ProfileScreen` | `src/screens/Profile/ProfileScreen.tsx` | 👤 Tài khoản |

### Nhóm B: Stack screens (Push từ Tab)

| # | Web View | Mobile Screen | File path |
|---|----------|---------------|-----------|
| B1 | `Movie/Detail.cshtml` | `MovieDetailScreen` | `src/screens/Movie/MovieDetailScreen.tsx` |
| B2 | `Movie/TicketDetail.cshtml` | `TicketDetailScreen` | `src/screens/Movie/TicketDetailScreen.tsx` |
| B3 | `Booking/SeatMap.cshtml` + `Shared/_SeatMap.cshtml` | `SeatSelectionScreen` | `src/screens/Booking/SeatSelectionScreen.tsx` |
| B4 | `Booking/Concessions.cshtml` | `ConcessionScreen` | `src/screens/Booking/ConcessionScreen.tsx` |
| B5 | `Payment/Index.cshtml` | `PaymentScreen` | `src/screens/Payment/PaymentScreen.tsx` |
| B6 | `Payment/Success.cshtml` | `PaymentSuccessScreen` | `src/screens/Payment/PaymentSuccessScreen.tsx` |
| B7 | `Cinema/Detail.cshtml` | `CinemaDetailScreen` | `src/screens/Cinema/CinemaDetailScreen.tsx` |
| B8 | `Cinema/GlobalShowtimes.cshtml` | `GlobalShowtimesScreen` | `src/screens/Cinema/GlobalShowtimesScreen.tsx` |
| B9 | `Movie/MyTickets.cshtml` | `MyTicketsScreen` | `src/screens/Movie/MyTicketsScreen.tsx` |
| B10 | `Search/Index.cshtml` | `SearchScreen` | `src/screens/Search/SearchScreen.tsx` |
| B11 | `News/Index.cshtml` | `NewsListScreen` | `src/screens/News/NewsListScreen.tsx` |
| B12 | `News/Detail.cshtml` | `NewsDetailScreen` | `src/screens/News/NewsDetailScreen.tsx` |
| B13 | `Promotion/Index.cshtml` + `Promotion/Detail.cshtml` | `PromotionScreen` | `src/screens/Promotion/PromotionScreen.tsx` |
| B14 | `Promotion/Detail.cshtml` | `PromotionDetailScreen` | `src/screens/Promotion/PromotionDetailScreen.tsx` |
| B15 | `Experience/Detail.cshtml` | `ExperienceDetailScreen` | `src/screens/Experience/ExperienceDetailScreen.tsx` |
| B16 | `Contact/Index.cshtml` | `ContactScreen` | `src/screens/Contact/ContactScreen.tsx` |
| B17 | `Contact/Details.cshtml` | `ContactDetailScreen` | `src/screens/Contact/ContactDetailScreen.tsx` |
| B18 | `Concession/Detail.cshtml` | `ConcessionDetailScreen` | `src/screens/Concession/ConcessionDetailScreen.tsx` |

### Nhóm C: Auth Stack (Trước khi đăng nhập)

| # | Web View | Mobile Screen | File path |
|---|----------|---------------|-----------|
| C1 | `Auth/Login.cshtml` | `LoginScreen` | `src/screens/Auth/LoginScreen.tsx` |
| C2 | `Auth/Register.cshtml` | `RegisterScreen` | `src/screens/Auth/RegisterScreen.tsx` |
| C3 | `Auth/ForgotPassword.cshtml` | `ForgotPasswordScreen` | `src/screens/Auth/ForgotPasswordScreen.tsx` |
| C4 | `Auth/ResetPassword.cshtml` | `ResetPasswordScreen` | `src/screens/Auth/ResetPasswordScreen.tsx` |

### Nhóm D: Profile sub-screens

| # | Web View | Mobile Screen | File path |
|---|----------|---------------|-----------|
| D1 | `Profile/Edit.cshtml` | `EditProfileScreen` | `src/screens/Profile/EditProfileScreen.tsx` |
| D2 | `Profile/ChangePassword.cshtml` | `ChangePasswordScreen` | `src/screens/Profile/ChangePasswordScreen.tsx` |
| D3 | `Profile/Transactions.cshtml` | `TransactionHistoryScreen` | `src/screens/Profile/TransactionHistoryScreen.tsx` |

### Nhóm E: Trang tĩnh (Static Pages — WebView hoặc native)

| # | Web View | Mobile Screen | File path |
|---|----------|---------------|-----------|
| E1 | `Page/membership.cshtml` | `MembershipScreen` | `src/screens/Page/MembershipScreen.tsx` |
| E2 | `Page/faq.cshtml` | `FAQScreen` | `src/screens/Page/FAQScreen.tsx` |
| E3 | `Page/terms.cshtml` | `TermsScreen` | `src/screens/Page/TermsScreen.tsx` |
| E4 | `Page/privacy_policy.cshtml` | `PrivacyPolicyScreen` | `src/screens/Page/PrivacyPolicyScreen.tsx` |
| E5 | `Page/payment_policy.cshtml` | `PaymentPolicyScreen` | `src/screens/Page/PaymentPolicyScreen.tsx` |
| E6 | `Page/cinema_rules.cshtml` | `CinemaRulesScreen` | `src/screens/Page/CinemaRulesScreen.tsx` |
| E7 | `Page/terms_transaction.cshtml` | `TransactionTermsScreen` | `src/screens/Page/TransactionTermsScreen.tsx` |
| E8 | `Page/app.cshtml` | `AppDownloadScreen` | `src/screens/Page/AppDownloadScreen.tsx` |
| E9 | `Page/careers.cshtml` | `CareersScreen` | `src/screens/Page/CareersScreen.tsx` |
| E10 | `Page/partners.cshtml` | `PartnersScreen` | `src/screens/Page/PartnersScreen.tsx` |

### Nhóm G: Mobile-only screens (Không có trên Web)

| # | Mobile Screen | File path | Mô tả |
|---|---------------|-----------|--------|
| G1 | `NotificationScreen` | `src/screens/Notification/NotificationScreen.tsx` | Danh sách thông báo (kế thừa Navbar bell dropdown) |
| G2 | `SettingsScreen` | `src/screens/Settings/SettingsScreen.tsx` | Cài đặt app: theme, ngôn ngữ, push notification |
| G3 | `SplashScreen` | `src/screens/Splash/SplashScreen.tsx` | Splash logo khi mở app |
| G4 | `OnboardingScreen` | `src/screens/Onboarding/OnboardingScreen.tsx` | Giới thiệu app lần đầu (3 slides) |

### Nhóm F: Error screens

| # | Web View | Mobile Screen | File path |
|---|----------|---------------|-----------|
| F1 | `Home/Error404.cshtml` | `NotFoundScreen` | `src/screens/Error/NotFoundScreen.tsx` |
| F2 | `Home/Error500.cshtml` | `ServerErrorScreen` | `src/screens/Error/ServerErrorScreen.tsx` |
| F3 | (Mất mạng — mobile only) | `NoConnectionScreen` | `src/screens/Error/NoConnectionScreen.tsx` |

---

## Chi tiết từng màn hình

### A1. HomeScreen — Trang chủ

**Kế thừa từ:** `Views/Home/Index.cshtml` (787 dòng, 17 sections trên web)

**Các section phải có (theo thứ tự cuộn dọc):**

```
┌─────────────────────────────┐
│  1. Hero Banner (auto-play) │  ← Carousel ngang, auto-scroll 5s
│     [Đặt Vé Ngay] [Trailer] │
├─────────────────────────────┤
│  2. Quick Booking Bar       │  ← Nút floating hoặc Card nổi bật
├─────────────────────────────┤
│  3. Phim Thịnh Hành        │  ← FlatList ngang, card lớn 350x500
│     #1, #2, #3 ...          │     với ranking number overlay
├─────────────────────────────┤
│  4. Phim Đang Chiếu        │  ← FlatList ngang hoặc Grid 2 cột
│     [Xem tất cả →]          │     Poster + Title + Duration + Badge
├─────────────────────────────┤
│  5. Phim Sắp Chiếu         │  ← Tương tự section 4
├─────────────────────────────┤
│  6. Quà Tặng & Bắp Nước    │  ← Card lớn + 2 card nhỏ (masonry)
├─────────────────────────────┤
│  7. Ưu Đãi Nổi Bật         │  ← FlatList ngang, promo card
│     [Tất cả ưu đãi →]       │     với ribbon giảm giá
├─────────────────────────────┤
│  8. Trải Nghiệm Điện Ảnh   │  ← 3 icon cards: Dolby, IMAX, Sweetbox
├─────────────────────────────┤
│  9. Định Dạng Đặc Biệt     │  ← 3 cards: IMAX, ATMOS, SWEETBOX
│     (ảnh nền + overlay)      │     với gradient overlay + title
├─────────────────────────────┤
│ 10. Khám Phá Thể Loại      │  ← Grid 2x2 cards với ảnh nền
│     Hành động, Khoa học,     │     Tình cảm, Kinh dị
├─────────────────────────────┤
│ 11. Hệ Thống Rạp CinemaX   │  ← 3 rạp cards + nút Tìm rạp gần tôi
│     [📍 Tìm rạp gần tôi]    │     (dùng expo-location)
├─────────────────────────────┤
│ 12. Tin Tức Điện Ảnh        │  ← FlatList ngang, news cards
│     [Tất cả tin tức →]       │
├─────────────────────────────┤
│ 13. Chương Trình Thành Viên │  ← Banner CTA + 3 tier cards
│     Silver, Gold, Platinum   │     (Silver/Gold/Platinum)
├─────────────────────────────┤
│ 14. Đăng Ký Nhận Bản Tin   │  ← Input email + nút Đăng Ký
├─────────────────────────────┤
│ 15. Đối Tác Thanh Toán     │  ← Logo row: VISA, MoMo, ZaloPay...
└─────────────────────────────┘
```

**Code pattern cho Hero Banner:**
```tsx
<FlatList
  ref={carouselRef}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  data={banners}
  keyExtractor={(_, i) => i.toString()}
  onViewableItemsChanged={onViewableChange}
  renderItem={({ item }) => (
    <View style={{ width: SCREEN_WIDTH }}>
      <Image source={{ uri: item.image }} style={styles.heroImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.95)']}
        style={styles.heroOverlay}>
        <Badge label={item.status} />
        <Text style={styles.heroTitle}>{item.title}</Text>
        <View style={styles.heroActions}>
          <CustomButton title="Đặt Vé Ngay" icon="ticket" />
          <CustomButton title="Xem Trailer" variant="outline" icon="play" />
        </View>
      </LinearGradient>
    </View>
  )}
/>
{/* Pagination dots */}
<View style={styles.dotsRow}>
  {banners.map((_, i) => (
    <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
  ))}
</View>
```

**Code pattern cho Phim Thịnh Hành (Trending):**
```tsx
<FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={trendingMovies.slice(0, 5)}
  snapToInterval={TRENDING_CARD_WIDTH + 16}
  decelerationRate="fast"
  contentContainerStyle={{ paddingHorizontal: 16 }}
  renderItem={({ item, index }) => (
    <Pressable
      onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
      style={({ pressed }) => [styles.trendingCard, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Image source={{ uri: item.posterUrl }} style={styles.trendingPoster} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} style={styles.trendingOverlay}>
        <Text style={styles.trendingRank}>#{index + 1}</Text>
        <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingChip}>
          <Ionicons name="star" size={12} color="#ffc107" />
          <Text style={styles.ratingText}>4.8/5</Text>
        </View>
        <TouchableOpacity style={styles.trendingBtn}>
          <Text style={styles.trendingBtnText}>ĐẶT VÉ</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Pressable>
  )}
/>
```

---

### A2. MovieListScreen — Danh sách phim

**Kế thừa từ:** `Views/Movie/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  Header: "Danh Sách Phim"   │
├─────────────────────────────┤
│  Filter Bar (ScrollView HZ) │
│  [Đang chiếu] [Sắp chiếu]  │
│  [Đã dừng chiếu]            │
├─────────────────────────────┤
│  Genre Dropdown / BottomSheet│
│  Tất cả | Hành động | Hài   │
│  Kinh dị | Tình cảm | ...   │
├─────────────────────────────┤
│  FlatList Grid 2 cột        │
│  ┌──────┐  ┌──────┐         │
│  │Poster│  │Poster│         │
│  │Title │  │Title │         │
│  │120ph │  │95ph  │         │
│  └──────┘  └──────┘         │
│  ...                         │
├─────────────────────────────┤
│  Pagination / Infinite scroll│
└─────────────────────────────┘
```

**Quy tắc:**
- Dùng `FlatList` với `numColumns={2}`, KHÔNG dùng `ScrollView`
- Poster height: 220px, `objectFit: 'cover'`
- Badge tuổi (C13, C18, P) góc trên phải poster
- Empty state: icon `camera-reels` + text + nút "Đặt Vé Ngay"
- Pull-to-refresh: `RefreshControl`
- Status tabs: chip buttons scrollable ngang, active = `bg-warning`

---

### A3. QuickBookScreen — Đặt vé nhanh

**Kế thừa từ:** `Views/Booking/Fast.cshtml` (Matrix 4 cột zero-reload)

Trên mobile, matrix 4 cột thành **4 bước tuần tự** (Step indicator + content):

**Layout:**
```
┌─────────────────────────────┐
│  ⚡ ĐẶT VÉ NHANH            │
├─────────────────────────────┤
│  Step Indicator              │
│  ①──②──③──④                 │
│  Phim Rạp Ngày Suất         │
├─────────────────────────────┤
│  Bước 1: CHỌN PHIM          │
│  ┌────────────────────────┐  │
│  │ 🖼 Poster │ Title      │  │
│  │          │ C18 · 120ph │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🖼 Poster │ Title      │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  (Sau khi chọn → tự động    │
│   chuyển sang bước tiếp)     │
└─────────────────────────────┘
```

**Quy tắc UX:**
- Cascade: Phim → Rạp → Ngày → Suất chiếu
- Khi đang fetch: Skeleton loader cho list tiếp theo
- Option không khả dụng: `opacity: 0.4`, `disabled`, KHÔNG xóa khỏi list
- Item đang chọn: highlight border vàng `#ffc107` + background nhạt
- Nếu fetch lỗi: Toast error + giữ nguyên bước hiện tại
- Auto-advance: Sau khi chọn một item, tự scroll/animate sang bước tiếp theo

**API cascade:**
```typescript
// Bước 1 → chọn Movie → fetch Cinemas
GET /api/booking/cinemas?movieId={id}

// Bước 2 → chọn Cinema → fetch Dates
GET /api/booking/dates?movieId={id}&cinemaId={id}

// Bước 3 → chọn Date → fetch Showtimes
GET /api/booking/showtimes?movieId={id}&cinemaId={id}&date={yyyy-MM-dd}

// Bước 4 → chọn Showtime → Navigate to SeatSelectionScreen
navigation.navigate('SeatSelection', { showtimeId })
```

---

### B1. MovieDetailScreen — Chi tiết phim

**Kế thừa từ:** `Views/Movie/Detail.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Back          🔍 Search  │
├─────────────────────────────┤
│      ┌──────────┐           │
│      │  Poster  │           │
│      │  (3D tilt│           │
│      │  effect) │           │
│      └──────────┘           │
│  Title (display-5 bold)      │
│  [C18] [120ph] [Hành động]  │
│  [⭐ 4.8/5 (23)] [Đang chiếu]│
│                              │
│  [▶ Xem Trailer]            │
│                              │
│  ── Mô tả phim ──           │
│  Lorem ipsum dolor sit amet  │
│  ...                         │
├─────────────────────────────┤
│  ── LỊCH CHIẾU & SUẤT CHIẾU─│
│  Date Slider (FlatList HZ)   │
│  [Hôm nay] [Thứ Hai] [T3]  │
│  [T4] [T5] [T6] [T7]       │
├─────────────────────────────┤
│  Cinema Group Cards          │
│  ┌────────────────────────┐  │
│  │ CinemaX Landmark       │  │
│  │ TP.HCM                 │  │
│  │ [10:30] [13:15] [16:00]│  │
│  │ [19:30] [21:45]        │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  [Đặt Vé Ngay]  (Bottom bar)│
└─────────────────────────────┘
```

**Date Slider pattern:**
```tsx
<FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={next7Days}
  keyExtractor={item => item.dateString}
  renderItem={({ item }) => (
    <Pressable
      onPress={() => setSelectedDate(item.dateString)}
      style={[styles.dateChip, item.dateString === selectedDate && styles.dateChipActive]}>
      <Text style={styles.dayName}>{item.isToday ? 'Hôm nay' : item.dayName}</Text>
      <Text style={styles.dayNumber}>{item.dayNumber}</Text>
      <Text style={styles.monthLabel}>Th{item.month}</Text>
    </Pressable>
  )}
/>
```

**Trailer:** Dùng `expo-av` hoặc `react-native-youtube-iframe` trong Modal.

---

### B3. SeatSelectionScreen — Sơ đồ ghế

**Kế thừa từ:** `Views/Booking/SeatMap.cshtml` + `Views/Shared/_SeatMap.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← CHỌN GHẾ NGỒI           │
│  Movie Title — 10/07 15:30  │
│  Room: Phòng 3              │
├─────────────────────────────┤
│       ╔═══ MÀN HÌNH ═══╗    │
│       ╚═════════════════╝    │
│                              │
│  (ScrollView 2 chiều)        │
│  Pinch-to-zoom               │
│                              │
│  A  ○ ○ ○   ○ ○ ○ ○   ○ ○  │
│  B  ○ ○ ○   ○ ○ ○ ○   ○ ○  │
│  C  ○ ○ ●   ○ ● ○ ○   ○ ○  │
│  D  ○ ○ ○   ○ ○ ○ ○   ○ ○  │
│  E  ◉◉   ◉◉   ◉◉   ◉◉     │  ← Sweetbox (span 2)
│                              │
│  Legend:                     │
│  ○ Trống  ● Đang chọn       │
│  ■ Đã đặt  ◉ Sweetbox       │
│  ★ VIP                       │
├─────────────────────────────┤
│  ┌─────────────────────────┐ │
│  │ Ghế: C3, C5             │ │
│  │ Số lượng: 2             │ │
│  │ TỔNG: 180.000₫          │ │
│  │ [GIỮ GHẾ (15 PHÚT)]    │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**Quy tắc ghế (kế thừa chính xác từ web):**
- Ghế thường: `36×36`, `borderRadius: 6`
- Ghế đôi (Sweetbox): `width: 76` (gấp đôi + gap), gradient hồng/đỏ
- Ghế VIP: viền vàng gold `#FFD700`, `borderWidth: 2`
- Ghế đã đặt: nền `#6c757d`, `opacity: 0.5`, `disabled`
- Ghế đang chọn: nền `accent (#e50914)`, `scale(1.1)` animated
- Aisle (lối đi): khoảng trống `20px`

**Pinch-to-zoom:**
```tsx
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

<ReactNativeZoomableView
  maxZoom={2.5}
  minZoom={0.8}
  initialZoom={1}
  bindToBorders>
  <View style={styles.seatGrid}>
    {rows.map(row => (
      <View key={row.label} style={styles.seatRow}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        {row.seats.map(seat => <SeatButton key={seat.id} seat={seat} />)}
      </View>
    ))}
  </View>
</ReactNativeZoomableView>
```

**Khách vãng lai (không đăng nhập):** Hiện thêm form email + SĐT phía trên nút "Giữ ghế", bọc trong `KeyboardAvoidingView`.

---

### B4. ConcessionScreen — Bắp nước

**Kế thừa từ:** `Views/Booking/Concessions.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← CHỌN BẮP NƯỚC  ⏱ 14:23  │
├─────────────────────────────┤
│  ScrollView                  │
│  ┌────────────────────────┐  │
│  │ 🖼 Combo Couple        │  │
│  │ 2 Nước M + 1 Bắp L     │  │
│  │ ̶1̶3̶0̶.̶0̶0̶0̶₫̶  109.000₫  │  │
│  │             [-] 0 [+]  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🖼 Combo Avatar  [LTD] │  │
│  │ Ly tạo hình + 1 Bắp L  │  │
│  │            299.000₫    │  │
│  │             [-] 0 [+]  │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  ┌─────────────────────────┐ │  ← Sticky Bottom
│  │ Bắp nước: 109.000₫     │ │
│  │ [TIẾP TỤC THANH TOÁN]  │ │
│  │ hoặc [BỎ QUA ➡]        │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

**Quy tắc UX:**
- Cập nhật quantity tức thì trên client, KHÔNG chờ API
- Animation nhảy giá (price bump) khi thay đổi số lượng:
```tsx
const scale = useSharedValue(1);

const onQuantityChange = (delta: number) => {
  setQty(q => Math.max(0, q + delta));
  scale.value = withSequence(
    withTiming(1.15, { duration: 150 }),
    withTiming(1, { duration: 150 })
  );
};
```
- Nút [-] disabled khi qty === 0
- Badge "LIMITED" cho combo đặc biệt
- Giá gốc bị gạch ngang khi có giá khuyến mãi
- Countdown timer hiển thị ở header (đếm ngược 15 phút giữ ghế)

---

### B5. PaymentScreen — Thanh toán

**Kế thừa từ:** `Views/Payment/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← XÁC NHẬN THANH TOÁN      │
├─────────────────────────────┤
│  ⏱ Countdown Timer          │
│  Thời gian giữ ghế: 12:34   │
├─────────────────────────────┤
│  ── Chi tiết đặt vé ──      │
│  Phim: Avengers Endgame      │
│  Ngày: 10/07/2026            │
│  Suất: 15:30                 │
│  Phòng: Phòng IMAX 3         │
│  Số lượng: 2 vé              │
│  Ghế: [C3] [C4]              │
│  ── Bắp nước ──             │
│  1x Combo Couple  109.000₫   │
├─────────────────────────────┤
│  ── Mã giảm giá ──          │
│  [Nhập mã...    ] [Áp dụng] │
│  ✅ Giảm 20% (-36.000₫)     │
├─────────────────────────────┤
│  ── Tổng tiền ──            │
│  Vé (2):         180.000₫    │
│  Bắp nước:       109.000₫   │
│  Giảm giá:       -36.000₫   │
│  ─────────────────────────   │
│  TỔNG:           253.000₫   │
├─────────────────────────────┤
│  ── Phương thức thanh toán ──│
│  ○ Ví MoMo                  │
│  ○ ZaloPay                  │
│  ○ VNPay                    │
│  ○ Thẻ Visa/Mastercard      │
├─────────────────────────────┤
│  [XÁC NHẬN THANH TOÁN]      │
└─────────────────────────────┘
```

**Countdown timer pattern:**
```tsx
const [remaining, setRemaining] = useState(remainingSeconds);

useEffect(() => {
  const interval = setInterval(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        Alert.alert('Hết thời gian', 'Phiên giữ ghế đã hết hạn.', [
          { text: 'Về trang chủ', onPress: () => navigation.navigate('Home') }
        ]);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, []);

const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;
```

---

### B6. PaymentSuccessScreen — Thanh toán thành công

**Kế thừa từ:** `Views/Payment/Success.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  🎊 Confetti Animation       │
├─────────────────────────────┤
│  ✅ (icon lớn, animate)      │
│  ĐẶT VÉ THÀNH CÔNG!         │
│  Cảm ơn bạn đã chọn CinemaX │
├─────────────────────────────┤
│  ╔═════════════════════════╗ │  ← E-Ticket Card (flip 3D)
│  ║ 🎬 CINEMAX E-TICKET     ║ │
│  ║ Phim: Avengers Endgame  ║ │
│  ║ Phòng: IMAX 3           ║ │
│  ║ Suất: 10/07 - 15:30     ║ │
│  ║ Ghế: C3, C4             ║ │
│  ║ Mã GD: CXN-123456       ║ │
│  ║ 👆 Chạm để quét QR      ║ │
│  ╚═════════════════════════╝ │
│                              │
│  (Mặt sau khi flip:)        │
│  ╔═════════════════════════╗ │
│  ║    MÃ QR KIỂM VÉ       ║ │
│  ║    ┌──────────┐         ║ │
│  ║    │ QR Code  │         ║ │
│  ║    └──────────┘         ║ │
│  ║    CXN-123456           ║ │
│  ╚═════════════════════════╝ │
├─────────────────────────────┤
│  [🎟 Vé của tôi]            │
│  [Về trang chủ]              │
└─────────────────────────────┘
```

**QR Code:** Dùng `react-native-qrcode-svg`:
```tsx
import QRCode from 'react-native-qrcode-svg';

<QRCode
  value={JSON.stringify({ code: transactionId, ts: Date.now(), v: '1' })}
  size={200}
  color="#000000"
  backgroundColor="#ffffff"
/>
```

**Tăng sáng màn hình khi hiện QR:**
```tsx
import * as Brightness from 'expo-brightness';

useEffect(() => {
  if (showQR) {
    Brightness.setBrightnessAsync(1); // Max brightness
    return () => Brightness.useSystemBrightnessAsync();
  }
}, [showQR]);
```

**Confetti:** Dùng `react-native-confetti-cannon`:
```tsx
import ConfettiCannon from 'react-native-confetti-cannon';
<ConfettiCannon count={80} origin={{ x: SCREEN_WIDTH / 2, y: -10 }} fadeOut />
```

---

### A4. CinemaListScreen — Hệ thống rạp

**Kế thừa từ:** `Views/Cinema/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  🏢 HỆ THỐNG RẠP CINEMAX    │
├─────────────────────────────┤
│  Province Picker (dropdown)  │
│  [-- Tất cả tỉnh thành --]  │
├─────────────────────────────┤
│  [📍 Tìm rạp gần tôi nhất]  │
├─────────────────────────────┤
│  FlatList Cinema Cards       │
│  ┌────────────────────────┐  │
│  │ 🖼 Ảnh rạp             │  │
│  │ [TP.HCM] [📍 2.5 km]   │  │
│  │ CinemaX Landmark        │  │
│  │ 📍 Tầng 8, Vincom...    │  │
│  │ 📞 028-1234-5678        │  │
│  │ ⏰ 08:00 - 24:00        │  │
│  │ [IMAX] [Dolby] [4DX]    │  │
│  │ [Xem lịch chiếu →]     │  │
│  └────────────────────────┘  │
│  ...                         │
└─────────────────────────────┘
```

**Geolocation (kế thừa web):**
```tsx
import * as Location from 'expo-location';

const findNearby = async () => {
  setLoading(true);
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền vị trí', 'Vui lòng cấp quyền vị trí để tìm rạp gần bạn nhất.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    const data = await api.get(`/cinemas/nearest?lat=${latitude}&lng=${longitude}`);
    setCinemas(data);
  } catch (err) {
    showError('Không thể lấy vị trí. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};
```

---

### A5. ProfileScreen — Hồ sơ cá nhân

**Kế thừa từ:** `Views/Profile/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ╔═══════════════════════╗   │  ← Loyalty Card (gradient)
│  ║ CINEMAX REWARDS       ║   │
│  ║ Thành viên Gold       ║   │
│  ║ 🖼 Avatar  Nguyễn Văn A║  │
│  ║ ID: 00000123          ║   │
│  ║ ┌────────┐            ║   │
│  ║ │ QR Code│            ║   │
│  ║ └────────┘            ║   │
│  ║ Đưa mã cho NV tích điểm║ │
│  ╚═══════════════════════╝   │
├─────────────────────────────┤
│  Progress Bar                │
│  Gold ════════▓░░░ Platinum  │
│  Còn 500.000₫ để lên Platinum│
├─────────────────────────────┤
│  ┌──────┐  ┌──────┐         │
│  │  12  │  │   8  │         │
│  │Vé mua│  │Phim  │         │
│  └──────┘  └──────┘         │
├─────────────────────────────┤
│  Menu Items (List)           │
│  👤 Hồ sơ của tôi        →  │
│  ✏️ Chỉnh sửa hồ sơ     →  │
│  🎟 Vé của tôi            →  │
│  📋 Lịch sử giao dịch    →  │
│  🔒 Đổi mật khẩu         →  │
│  🚪 Đăng xuất                │
└─────────────────────────────┘
```

**Loyalty Card component:**
```tsx
<LinearGradient
  colors={['#1a1a2e', '#000000']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.loyaltyCard}>
  <View style={styles.loyaltyHeader}>
    <View>
      <Text style={styles.loyaltyBrand}>CINEMAX REWARDS</Text>
      <Text style={styles.loyaltyLevel}>Thành viên {user.memberLevel}</Text>
    </View>
    <Ionicons name="trophy" size={28} color="#ffc107" />
  </View>
  <View style={styles.loyaltyUser}>
    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
    <View>
      <Text style={styles.loyaltyName}>{user.displayName}</Text>
      <Text style={styles.loyaltyId}>ID: {user.id.toString().padStart(8, '0')}</Text>
    </View>
  </View>
  <View style={styles.qrContainer}>
    <QRCode value={`CXN-${user.id}`} size={80} />
  </View>
</LinearGradient>
```

---

### B9. MyTicketsScreen — Vé của tôi

**Kế thừa từ:** `Views/Movie/MyTickets.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  🎟 VÉ CỦA TÔI              │
├─────────────────────────────┤
│  FlatList                    │
│  ┌────────────────────────┐  │
│  │ CinemaX Ticket   ✅Paid │  │
│  │ Avengers Endgame        │  │
│  │ 📅 10/07  ⏰ 15:30      │  │
│  │ 💺 C3     💰 90.000₫   │  │
│  │ ──────────────────────  │  │
│  │ Mã: #CX000123          │  │
│  │ Mua lúc: 09/07 10:30   │  │
│  │ [📄 Yêu cầu Hóa đơn]  │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  Empty state:                │
│  🎟 Bạn chưa mua vé nào     │
│  [Đặt Vé Ngay]              │
└─────────────────────────────┘
```

---

### B10. SearchScreen — Tìm kiếm phim

**Kế thừa từ:** `Views/Search/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  🔍 TÌM KIẾM PHIM           │
├─────────────────────────────┤
│  [🔍 Tìm tên phim...]       │  ← TextInput autofocus
│  Genre Filter (BottomSheet)  │
│  [Tất cả] [Hành động] [Hài] │
├─────────────────────────────┤
│  Kết quả: 5 phim             │
│  FlatList Grid 2 cột        │
│  Mỗi card: Poster + Title   │
│  + Genre + Status badge      │
├─────────────────────────────┤
│  Empty query: icon film      │
│  "Nhập từ khóa để tìm..."   │
│                              │
│  No results: icon frown      │
│  "Không tìm thấy phim nào"  │
│  [Xem tất cả phim]          │
└─────────────────────────────┘
```

**Quy tắc:** Dùng debounce 300ms cho search, KHÔNG fetch mỗi keystroke.

---

### B11–B12. NewsListScreen & NewsDetailScreen — Tin tức

**Kế thừa từ:** `Views/News/Index.cshtml` + `Views/News/Detail.cshtml`

**NewsListScreen:**
```
┌─────────────────────────────┐
│  📰 TIN TỨC MỚI NHẤT        │
├─────────────────────────────┤
│  Featured Article (Card lớn) │
│  ┌────────────────────────┐  │
│  │ 🖼 Background Image    │  │
│  │ (height: 350, darken)  │  │
│  │ [Category Badge]       │  │
│  │ Title (h3 bold white)  │  │
│  │ Summary text           │  │
│  └────────────────────────┘  │
├─────────────────────────────┤
│  FlatList                    │
│  ┌────────────────────────┐  │
│  │ 🖼 Image (h:180)       │  │
│  │ [Category] badge       │  │
│  │ Title (bold, 2 lines)  │  │
│  │ Summary (3 lines max)  │  │
│  │ [Đọc tiếp →]           │  │
│  └────────────────────────┘  │
│  ...                         │
└─────────────────────────────┘
```

**NewsDetailScreen:**
```
┌─────────────────────────────┐
│  ← Tin tức                   │
├─────────────────────────────┤
│  🖼 Hero Image (h:250)       │
│  (object-fit: cover)         │
├─────────────────────────────┤
│  [Category Badge]            │
│  Title (h1, bold, 1.6rem)    │
│  📅 Published date           │
├─────────────────────────────┤
│  Content (rich text)         │
│  Line-height: 1.8            │
│  ...                         │
├─────────────────────────────┤
│  ── Bài viết liên quan ──   │
│  FlatList ngang              │
│  ┌──────┐  ┌──────┐         │
│  │Thumb │  │Thumb │         │
│  │Badge │  │Badge │         │
│  │Title │  │Title │         │
│  └──────┘  └──────┘         │
├─────────────────────────────┤
│  CTA Card: "Đặt vé xem phim"│
│  [🎟 Đặt vé ngay]            │
└─────────────────────────────┘
```

---

### B13. PromotionScreen — Ưu đãi & Khuyến mãi

**Kế thừa từ:** `Views/Promotion/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  🎫 ƯU ĐÃI & KHUYẾN MÃI     │
│  Đừng bỏ lỡ deal hot nhất!  │
├─────────────────────────────┤
│  FlatList Promo Cards        │
│  ┌────────────────────────┐  │
│  │ 🖼 Promo Banner        │  │
│  │ [20% RIBBON]           │  │
│  │ GIAM20                 │  │
│  │ Giảm 20% giá vé        │  │
│  │ [GIAM20] [📋 Copy]     │  │
│  │ 📅 HSD: 30/12/2026     │  │
│  │ 👥 Còn 45 lượt         │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  Empty: "Chưa có khuyến mãi" │
└─────────────────────────────┘
```

**Copy to clipboard:**
```tsx
import * as Clipboard from 'expo-clipboard';

const copyPromoCode = async (code: string) => {
  await Clipboard.setStringAsync(code);
  Toast.show({ text: `Đã copy mã: ${code}`, type: 'success' });
};
```

---

### B14. PromotionDetailScreen — Chi tiết khuyến mãi

**Kế thừa từ:** `Views/Promotion/Detail.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Khuyến mãi               │
├─────────────────────────────┤
│  🖼 Hero Image (h:250)       │
│  (darken overlay)            │
│  ┌────────────────────────┐  │
│  │  [  20%  ] ← badge lớn │  │
│  │   GIAM20  ← code       │  │
│  └────────────────────────┘  │
├─────────────────────────────┤
│  ┌────┐  ┌────┐  ┌────┐     │
│  │ 📅 │  │ 👥 │  │ ✅ │     │
│  │HSD │  │Đã  │  │Còn │     │
│  │date│  │dùng│  │lại │     │
│  └────┘  └────┘  └────┘     │
├─────────────────────────────┤
│  [GIAM20        ] [📋 Copy]  │
│  (letter-spacing: 3px)       │
├─────────────────────────────┤
│  [🎟 Dùng khi đặt vé ngay]  │
└─────────────────────────────┘
```

**Copy animation:** Nút "Copy" chuyển thành "✅ Đã sao chép!" trong 2 giây, đổi màu `warning → success`.

---

### B15. ExperienceDetailScreen — Trải nghiệm đặc biệt

**Kế thừa từ:** `Views/Experience/Detail.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Trải nghiệm              │
├─────────────────────────────┤
│  🖼 Hero Image (h:300)       │
│  (brightness: 0.35)          │
│  🎵 Icon (3rem)              │
│  [CinemaX] badge             │
│  DOLBY ATMOS (display-5)     │
│  "Slogan text" (italic)      │
├─────────────────────────────┤
│  Mô tả chi tiết (fs-5)      │
│  ...                         │
├─────────────────────────────┤
│  ── Điểm nổi bật ──         │
│  ┌────┐  ┌────┐  ┌────┐     │
│  │Icon│  │Icon│  │Icon│     │
│  │Feat│  │Feat│  │Feat│     │
│  │Desc│  │Desc│  │Desc│     │
│  └────┘  └────┘  └────┘     │
├─────────────────────────────┤
│  ⭐ Note (Alert box)         │
├─────────────────────────────┤
│  [🎟 ĐẶT VÉ NGAY]           │
├─────────────────────────────┤
│  ── Trải nghiệm khác ──     │
│  ┌────────────────────────┐  │
│  │ Icon │ Name │ Slogan   │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Icon │ Name │ Slogan   │  │
│  └────────────────────────┘  │
├─────────────────────────────┤
│  Card: Rạp có trải nghiệm   │
│  [Xem hệ thống rạp]         │
└─────────────────────────────┘
```

---

### B16. ContactScreen — Liên hệ & Hỗ trợ

**Kế thừa từ:** `Views/Contact/Index.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  📞 LIÊN HỆ & HỖ TRỢ       │
├─────────────────────────────┤
│  Form (KeyboardAvoidingView) │
│  Họ và tên: [__________] *  │
│  Email:     [__________] *  │
│  SĐT:      [__________]    │
│  Chủ đề:   [BottomSheet_]  │
│    • Vấn đề đặt vé          │
│    • Vấn đề thanh toán       │
│    • Yêu cầu hoàn tiền      │
│    • Vấn đề tài khoản        │
│    • Khác                    │
│  Nội dung:  [             ] │
│             [             ] *│
│             [_____________] │
│                              │
│  [GỬI YÊU CẦU HỖ TRỢ]      │
├─────────────────────────────┤
│  ── THÔNG TIN LIÊN HỆ ──   │
│  ┌────────────────────────┐  │
│  │ 📞 Hotline              │  │
│  │ 1900 1234               │  │
│  │ T2-CN, 8:00-22:00       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 📧 Email                │  │
│  │ support@cinemax.vn      │  │
│  │ Phản hồi trong 24h      │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 💬 Chat trực tuyến      │  │
│  │ Hỗ trợ ngay tại app     │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🏢 Địa chỉ              │  │
│  │ Tầng 2, Vincom...       │  │
│  └────────────────────────┘  │
└─────────────────────────────┘
```

**Quy tắc:** Khi gửi thành công → hiện Alert success + option xem chi tiết yêu cầu (navigate to B17).

---

### B17. ContactDetailScreen — Chi tiết yêu cầu hỗ trợ

**Kế thừa từ:** `Views/Contact/Details.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Yêu cầu #123             │
├─────────────────────────────┤
│  ╔═══════════════════════╗   │
│  ║ MÃ YÊU CẦU: #123     ║   │  ← Card header dark
│  ║ Ngày gửi: 01/07/2026 ║   │
│  ║ [✅ Đã phản hồi]     ║   │  ← hoặc [⏳ Đang xử lý]
│  ╚═══════════════════════╝   │
├─────────────────────────────┤
│  ── Thông Tin Khách Hàng ── │
│  Họ tên:  Nguyễn Văn A       │
│  Email:   user@example.com   │
│  SĐT:    0901234567          │
│  Chủ đề: Vấn đề đặt vé      │
├─────────────────────────────┤
│  ── Nội Dung Yêu Cầu ──    │
│  [Content box, border-left   │
│   #ffc107, bg light]         │
├─────────────────────────────┤
│  ── Phản Hồi Từ CinemaX ── │
│  (nếu status === 'replied')  │
│  ┌────────────────────────┐  │
│  │ 🎧 Icon + title        │  │
│  │ Thời gian: 02/07 10:30 │  │
│  │ Nội dung phản hồi...   │  │
│  └────────────────────────┘  │
│                              │
│  (nếu chưa phản hồi:)       │
│  ℹ️ Đang được xử lý...      │
│  Phản hồi trong 24h.        │
├─────────────────────────────┤
│  [📧 Gửi yêu cầu mới]      │
│  [🏠 Quay lại Trang chủ]    │
└─────────────────────────────┘
```

---

### C1–C4. Auth Screens

**LoginScreen** kế thừa từ `Views/Auth/Login.cshtml`:
```
┌─────────────────────────────┐
│  (Logo CinemaX)              │
│  Chào mừng trở lại!         │
├─────────────────────────────┤
│  Email:    [__________]      │
│  Mật khẩu: [__________]     │
│  [Quên mật khẩu?]           │
│                              │
│  [ĐĂNG NHẬP]                 │
│                              │
│  ── hoặc ──                  │
│  [G Đăng nhập với Google]    │
│  [f Đăng nhập với Facebook]  │
│                              │
│  Chưa có tài khoản? Đăng ký │
└─────────────────────────────┘
```

**RegisterScreen** kế thừa từ `Views/Auth/Register.cshtml`:
```
┌─────────────────────────────┐
│  Tạo Tài Khoản Mới          │
├─────────────────────────────┤
│  Họ tên:   [__________]     │
│  Email:    [__________]     │
│  SĐT:     [__________]     │
│  Mật khẩu: [__________]     │
│  Xác nhận: [__________]     │
│                              │
│  [ĐĂNG KÝ]                  │
│                              │
│  Đã có tài khoản? Đăng nhập │
└─────────────────────────────┘
```

**ForgotPasswordScreen:**
```
┌─────────────────────────────┐
│  ← Quay lại                  │
│  (Logo CinemaX)              │
│  Quên mật khẩu?             │
│  Nhập email để nhận link...  │
├─────────────────────────────┤
│  Email:    [__________]      │
│                              │
│  [GỬI LINK ĐẶT LẠI]         │
│                              │
│  Nhớ mật khẩu? Đăng nhập    │
└─────────────────────────────┘
```

**ResetPasswordScreen:**
```
┌─────────────────────────────┐
│  Đặt lại mật khẩu           │
├─────────────────────────────┤
│  Mật khẩu mới: [________]   │
│  Xác nhận:     [________]   │
│                              │
│  [ĐẶT LẠI MẬT KHẨU]        │
└─────────────────────────────┘
```

**Quy tắc Auth chung:**
- Tất cả form bọc trong `KeyboardAvoidingView` + `ScrollView`
- Password fields có icon toggle show/hide (👁)
- Validation inline: border đỏ + error text dưới field
- Social login (Google/Facebook): Dùng `expo-auth-session` hoặc `@react-native-google-signin/google-signin`
- Loading state: Nút submit disabled + spinner khi đang call API
- Secure storage: Token JWT lưu vào `expo-secure-store`, KHÔNG dùng AsyncStorage cho token

---

### B2. TicketDetailScreen — Chi tiết vé

**Kế thừa từ:** `Views/Movie/TicketDetail.cshtml` (Vé 3D flip + QR)

**Layout:**
```
┌─────────────────────────────┐
│  ← Về danh sách    Vé Chi Tiết│
├─────────────────────────────┤
│  ╔═════════════════════════╗ │
│  ║ 🎬 CinemaX              ║ │  ← Ticket Card (flip)
│  ║ Electronic Ticket       ║ │
│  ║              [✅ Đã TT] ║ │
│  ║ ─ ─ ─ ─ tear line ─ ─  ║ │
│  ║ Avengers Endgame        ║ │
│  ║ [C18] 150 phút          ║ │
│  ║                          ║ │
│  ║ 📅 Ngày    ⏰ Giờ       ║ │
│  ║ 10/07      15:30        ║ │
│  ║ 📍 Rạp     🚪 Phòng     ║ │
│  ║ CinemaX    IMAX 3       ║ │
│  ║ 💺 Ghế     💰 Giá       ║ │
│  ║ C3 (gold)  90.000₫      ║ │
│  ║                          ║ │
│  ║ 🔄 Chạm để xem QR      ║ │
│  ╚═════════════════════════╝ │
│                              │
│  (Mặt sau khi flip:)        │
│  ╔═════════════════════════╗ │
│  ║  📱 MÃ VÉ ĐIỆN TỬ      ║ │
│  ║  ┌──────────────┐       ║ │
│  ║  │              │       ║ │
│  ║  │   QR CODE    │       ║ │
│  ║  │              │       ║ │
│  ║  └──────────────┘       ║ │
│  ║  CX-A1B2C3D4            ║ │
│  ║                          ║ │
│  ║  [📷 Lưu ảnh vé]        ║ │
│  ║  🔄 Chạm để lật lại    ║ │
│  ╚═════════════════════════╝ │
├─────────────────────────────┤
│  Bắp nước đã chọn (nếu có): │
│  1x Combo Couple  109.000₫   │
├─────────────────────────────┤
│  [📄 Yêu cầu Hóa đơn VAT]  │
│  [🎟 Về danh sách vé]        │
└─────────────────────────────┘
```

**3D Flip animation:**
```tsx
import { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';

const rotateY = useSharedValue(0);
const isFlipped = useSharedValue(false);

const flipCard = () => {
  rotateY.value = withTiming(isFlipped.value ? 0 : 180, { duration: 600 });
  isFlipped.value = !isFlipped.value;
};

const frontStyle = useAnimatedStyle(() => ({
  transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value}deg` }],
  backfaceVisibility: 'hidden',
}));

const backStyle = useAnimatedStyle(() => ({
  transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value + 180}deg` }],
  backfaceVisibility: 'hidden',
  position: 'absolute', top: 0, left: 0, right: 0,
}));
```

**Lưu ảnh vé:** Dùng `expo-media-library` + `react-native-view-shot` để capture ticket card thành ảnh.

---

### B7. CinemaDetailScreen — Chi tiết rạp

**Kế thừa từ:** `Views/Cinema/Detail.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Chi tiết rạp             │
├─────────────────────────────┤
│  🖼 Hero Image (h:250)       │
│  (brightness: 0.45)          │
│  [TP.HCM] badge              │
│  CinemaX Landmark (h1 bold)  │
│  📍 Tầng 8, Vincom...        │
├─────────────────────────────┤
│  ── Thông tin ──             │
│  📞 028-1234-5678            │
│  📧 landmark@cinemax.vn      │
│  ⏰ 08:00 - 24:00            │
│  📍 Địa chỉ đầy đủ          │
├─────────────────────────────┤
│  ── Tiện ích ──              │
│  [IMAX] [Dolby] [4DX]       │
│  [Parking] [F&B] [WiFi]     │
├─────────────────────────────┤
│  ── Bản đồ ──               │
│  [📍 Mở Google Maps]         │  ← Linking.openURL()
│  (hoặc MapView inline)       │
├─────────────────────────────┤
│  ── Giới thiệu ──           │
│  Lorem ipsum...              │
├─────────────────────────────┤
│  ── Trải nghiệm tại rạp ── │
│  ┌────┐  ┌────┐  ┌────┐     │
│  │Dolby│ │IMAX│ │Sweet│     │
│  │Atmos│ │    │ │ box │     │
│  └────┘  └────┘  └────┘     │
├─────────────────────────────┤
│  ── Lịch chiếu hôm nay ──  │
│  Date Slider (7 ngày)        │
│  ┌────────────────────────┐  │
│  │ Avengers Endgame       │  │
│  │ C18 · 150ph            │  │
│  │ [10:30] [13:15] [16:00]│  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Dune: Part Two         │  │
│  │ C13 · 166ph            │  │
│  │ [14:00] [19:30]        │  │
│  └────────────────────────┘  │
├─────────────────────────────┤
│  [📅 Xem lịch chiếu toàn bộ]│
└─────────────────────────────┘
```

**Mở bản đồ:**
```tsx
import { Linking, Platform } from 'react-native';

const openMap = (lat: number, lng: number, name: string) => {
  const url = Platform.select({
    ios: `maps:0,0?q=${name}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${name})`,
  });
  if (url) Linking.openURL(url);
};
```

---

### B8. GlobalShowtimesScreen — Lịch chiếu toàn quốc

**Kế thừa từ:** `Views/Cinema/GlobalShowtimes.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  📅 LỊCH CHIẾU TOÀN QUỐC    │
├─────────────────────────────┤
│  Date Slider (14 ngày tới)   │
│  [01/07] [02/07] [03/07] ... │
├─────────────────────────────┤
│  Province Jump Links         │
│  (FlatList ngang chip)       │
│  [TP.HCM] [Hà Nội] [Đà Nẵng]│
├─────────────────────────────┤
│  ── TP. Hồ Chí Minh ──      │  ← SectionList header
│  ┌────────────────────────┐  │
│  │ 🏢 CinemaX Landmark    │  │
│  │ 📍 Tầng 8, Vincom...   │  │
│  │ ┌─────────────────────┐│  │
│  │ │ Avengers  C18 150ph ││  │
│  │ │ [10:30] [13:15]     ││  │
│  │ └─────────────────────┘│  │
│  │ ┌─────────────────────┐│  │
│  │ │ Dune  C13 166ph     ││  │
│  │ │ [14:00] [19:30]     ││  │
│  │ └─────────────────────┘│  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🏢 CinemaX Lotte       │  │
│  │ ...                    │  │
│  └────────────────────────┘  │
│  ── Hà Nội ──               │
│  ...                         │
├─────────────────────────────┤
│  Empty: "Không có suất chiếu"│
└─────────────────────────────┘
```

**Quy tắc:** Dùng `SectionList` với `sections` grouped by Province → Cinema → Movie. Province chip scrollable ngang cho phép nhảy nhanh đến khu vực.

---

### D1–D3. Profile sub-screens (Chi tiết)

### D1. EditProfileScreen — Chỉnh sửa hồ sơ

**Kế thừa từ:** `Views/Profile/Edit.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Chỉnh sửa hồ sơ         │
├─────────────────────────────┤
│  (KeyboardAvoidingView)      │
│                              │
│  ┌──────┐ Avatar preview     │
│  │  🖼  │ (90x90, circle)    │
│  └──────┘                    │
│  [📷 Thay ảnh]               │  ← expo-image-picker
│                              │
│  Họ và tên: [Nguyễn Văn A]   │
│  SĐT:      [0901234567  ]   │
│  Ngày sinh: [DatePicker___]  │  ← native date picker
│  Giới tính: [BottomSheet_]   │
│    • Nam  • Nữ  • Khác      │
│  Thành phố: [TP. HCM____]   │
│                              │
│  [✅ Lưu thay đổi] [Hủy]    │
└─────────────────────────────┘
```

**Avatar picker:**
```tsx
import * as ImagePicker from 'expo-image-picker';

const pickAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (!result.canceled) {
    setAvatarUri(result.assets[0].uri);
  }
};
```

### D2. ChangePasswordScreen — Đổi mật khẩu

**Kế thừa từ:** `Views/Profile/ChangePassword.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Đổi mật khẩu             │
├─────────────────────────────┤
│  🔒 (icon shield-lock lớn)   │
│                              │
│  Mật khẩu hiện tại:         │
│  [••••••••______] 👁         │
│  (error: "Mật khẩu sai")    │
│                              │
│  Mật khẩu mới:              │
│  [________________] 👁       │
│  (hint: Ít nhất 8 ký tự)    │
│                              │
│  Xác nhận mật khẩu mới:     │
│  [________________] 👁       │
│  (error: "Không khớp")      │
│                              │
│  [✅ Đổi mật khẩu] [Hủy]    │
└─────────────────────────────┘
```

**Quy tắc:** Validation realtime — border đỏ khi mật khẩu mới < 8 ký tự hoặc xác nhận không khớp.

### D3. TransactionHistoryScreen — Lịch sử giao dịch

**Kế thừa từ:** `Views/Profile/Transactions.cshtml`

**Layout:**
```
┌─────────────────────────────┐
│  ← Lịch sử giao dịch        │
├─────────────────────────────┤
│  Filter Tabs (ScrollView HZ) │
│  [Tất cả] [Đã TT] [Đang giữ]│
│  [Đã hủy]                    │
├─────────────────────────────┤
│  💰 Tổng đã chi: 1.250.000₫  │  ← Alert card
├─────────────────────────────┤
│  FlatList                    │
│  ┌────────────────────────┐  │
│  │ Avengers Endgame       │  │
│  │ 📅 10/07 ⏰ 15:30      │  │
│  │ 🚪 Phòng 3 · Ghế C3   │  │
│  │ 🏷 Mã: GIAM20          │  │
│  │           [✅ Đã TT]   │  │
│  │           90.000₫      │  │
│  │           05/07 10:30  │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  Empty: 🧾 "Chưa có giao dịch"│
│  [Đặt vé ngay]              │
└─────────────────────────────┘
```

**Filter logic:** Active tab = `bg-warning` (paid=success, holding=warning, cancelled=danger). Fetch API với query param `?status=paid|holding|cancelled`.

---

### G1. NotificationScreen — Thông báo (Mobile-only)

**Kế thừa từ:** Navbar bell dropdown trên web (`_Navbar.cshtml` L117-151)

Trên web, thông báo nằm trong dropdown. Trên mobile, đây là một screen đầy đủ.

**Layout:**
```
┌─────────────────────────────┐
│  🔔 THÔNG BÁO                │
├─────────────────────────────┤
│  FlatList                    │
│  ┌────────────────────────┐  │
│  │ 🎟 (icon circle orange) │  │
│  │ Nhắc lịch xem phim     │  │  ← unread = bold + dot
│  │ Dune: Part Two sẽ chiếu │  │
│  │ trong 2 giờ nữa tại     │  │
│  │ Landmark 81.            │  │
│  │ 2 giờ trước             │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ ⭐ (icon circle blue)   │  │
│  │ Điểm thưởng cập nhật   │  │
│  │ Bạn được cộng 5,000 điểm│ │
│  │ từ giao dịch gần nhất.  │  │
│  │ 1 ngày trước            │  │
│  └────────────────────────┘  │
│  ...                         │
├─────────────────────────────┤
│  Empty: 🔕 "Không có thông   │
│  báo mới"                    │
└─────────────────────────────┘
```

**Badge trên Tab icon:** Hiện số thông báo chưa đọc trên icon Tab "Tài khoản" hoặc icon bell trên Header.

---

### G2. SettingsScreen — Cài đặt (Mobile-only)

**Layout:**
```
┌─────────────────────────────┐
│  ⚙️ CÀI ĐẶT                 │
├─────────────────────────────┤
│  Giao diện                   │
│  🌙 Dark Mode    [Switch ◉] │  ← Toggle dark/light
│  Theo hệ thống  [Switch ◉] │
├─────────────────────────────┤
│  Thông báo                   │
│  🔔 Push Notification [◉]   │
│  📧 Email Marketing   [◉]   │
│  🎟 Nhắc lịch xem phim [◉] │
├─────────────────────────────┤
│  Về ứng dụng                 │
│  Phiên bản: 1.0.0            │
│  [⭐ Đánh giá app]           │
│  [📋 Điều khoản sử dụng]    │
│  [🔒 Chính sách bảo mật]    │
│  [❓ Câu hỏi thường gặp]    │
├─────────────────────────────┤
│  [🗑 Xóa tài khoản]          │  ← Destructive, xác nhận 2 lần
└─────────────────────────────┘
```

---

### G3. SplashScreen — Màn hình khởi động

```
┌─────────────────────────────┐
│                              │
│                              │
│      🎬 CinemaX              │
│      (Logo animated)         │
│                              │
│      ────── loading ──────   │
│                              │
└─────────────────────────────┘
```

Dùng `expo-splash-screen` để giữ splash trong khi check auth token + preload fonts.

---

### G4. OnboardingScreen — Giới thiệu lần đầu

3 slides swipe ngang:
```
Slide 1: 🎬 "Khám phá phim hot nhất" + illustration
Slide 2: 💺 "Đặt vé siêu nhanh, chọn ghế yêu thích" + illustration  
Slide 3: 🎁 "Tích điểm, đổi quà, nhận ưu đãi" + illustration
         [BẮT ĐẦU NGAY] → navigate to HomeScreen
```

Chỉ hiện 1 lần (lưu flag vào AsyncStorage `@onboarding_done`).

---

### E1–E10. Trang tĩnh

Render nội dung tĩnh dạng ScrollView native (KHÔNG dùng WebView). Dùng component `StaticPageScreen` chung:

```tsx
// src/screens/Page/StaticPageScreen.tsx
const StaticPageScreen = ({ title, sections }: Props) => (
  <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.pageTitle}>{title}</Text>
      {sections.map((section, i) => (
        <View key={i} style={styles.section}>
          {section.heading && <Text style={styles.sectionTitle}>{section.heading}</Text>}
          <Text style={styles.sectionBody}>{section.content}</Text>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);
```

**Accordion pattern cho FAQ:**
```tsx
// FAQScreen dùng Accordion thay vì plain text
const FAQScreen = () => (
  <ScrollView>
    {faqItems.map((item, i) => (
      <Pressable key={i} onPress={() => toggleExpand(i)} style={styles.faqItem}>
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} />
        </View>
        {expanded === i && (
          <Animated.View entering={FadeIn} style={styles.faqAnswer}>
            <Text>{item.answer}</Text>
          </Animated.View>
        )}
      </Pressable>
    ))}
  </ScrollView>
);
```

---

### F1–F3. Error Screens

| Lỗi | Icon | Tiêu đề | Hành động |
|------|------|---------|-----------|
| 404 / Not Found | 🎬 Rạp trống | "Phòng chiếu này không tồn tại" | Nút "Về trang chủ" |
| 500 / Server Error | 🎞 Phim đứt | "Kỹ thuật viên đang nối lại phim" | Nút "Thử lại" + Contact |
| No Internet | 📡 WiFi gạch | "Không có kết nối Internet" | Nút "Thử lại" full màn hình |

---

## Navigation Architecture

```
AppNavigator
├── SplashScreen (G3)
├── OnboardingScreen (G4) ← chỉ lần đầu
├── AuthStack (khi chưa đăng nhập)
│   ├── LoginScreen (C1)
│   ├── RegisterScreen (C2)
│   ├── ForgotPasswordScreen (C3)
│   └── ResetPasswordScreen (C4)
│
└── MainTabs (Bottom Tab Navigator) ← 5 tabs
    ├── HomeTab
    │   ├── HomeScreen (A1)
    │   ├── MovieDetailScreen (B1)
    │   ├── SearchScreen (B10)
    │   ├── NewsListScreen (B11)
    │   ├── NewsDetailScreen (B12)
    │   ├── PromotionScreen (B13)
    │   ├── PromotionDetailScreen (B14)
    │   ├── ExperienceDetailScreen (B15)
    │   ├── NotificationScreen (G1)
    │   └── [Static Pages] (E1–E10)
    │
    ├── MovieTab
    │   ├── MovieListScreen (A2)
    │   └── MovieDetailScreen (B1)
    │
    ├── BookingTab
    │   ├── QuickBookScreen (A3)
    │   ├── SeatSelectionScreen (B3)
    │   ├── ConcessionScreen (B4)
    │   ├── PaymentScreen (B5)
    │   └── PaymentSuccessScreen (B6)
    │
    ├── CinemaTab
    │   ├── CinemaListScreen (A4)
    │   ├── CinemaDetailScreen (B7)
    │   └── GlobalShowtimesScreen (B8)
    │
    └── ProfileTab
        ├── ProfileScreen (A5)
        ├── EditProfileScreen (D1)
        ├── ChangePasswordScreen (D2)
        ├── TransactionHistoryScreen (D3)
        ├── MyTicketsScreen (B9)
        ├── TicketDetailScreen (B2)
        ├── ContactScreen (B16)
        ├── ContactDetailScreen (B17)
        └── SettingsScreen (G2)
```

---

## Design Tokens — `src/theme/tokens.ts`

```typescript
export const Colors = {
  // Brand (kế thừa CSS Variables từ web)
  accent: '#e50914',       // --cx-accent (Đỏ CinemaXNet)
  accentRgb: '229,9,20',
  gold: '#FFD700',         // --cx-gold (VIP / Premium)
  warning: '#ffc107',      // Nút chính, tiêu đề sections

  // Dark theme (default)
  dark: {
    background: '#111111',
    surface: '#1a1d23',
    card: '#1a1a2e',
    cardBorder: '#2d2d44',
    textPrimary: '#ffffff',
    textSecondary: '#8b949e',
    textMuted: '#6c757d',
  },

  // Light theme
  light: {
    background: '#f8f9fa',
    surface: '#ffffff',
    card: '#ffffff',
    cardBorder: '#dee2e6',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
  },

  // Semantic
  success: '#198754',
  info: '#0dcaf0',
  danger: '#dc3545',
  
  // Age Rating badges
  badgeC13: '#ff9800',
  badgeC18: '#f44336',
  badgeNow: '#4caf50',
  badgeSoon: '#2196f3',

  // Seat colors
  seatAvailable: '#2d2d44',
  seatSelected: '#e50914',
  seatBooked: '#6c757d',
  seatVipBorder: '#FFD700',
  seatSweetbox: ['#ff6b81', '#e50914'],  // gradient
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
  sm: 6,    // Ghế, badge
  md: 8,    // Button
  lg: 12,   // Card
  xl: 16,   // Experience card, Section card
  pill: 999, // Rounded pill
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  hover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
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
```

---

## Dark / Light Mode

```tsx
import { useColorScheme } from 'react-native';
import { Colors } from '../theme/tokens';

const useTheme = () => {
  const scheme = useColorScheme();  // 'dark' | 'light'
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
};
```

**Quy tắc:** App mặc định theo system preference. User có thể override qua Settings.

---

## Micro-interactions (Kế thừa từ Web)

Thay hover bằng press feedback:

```tsx
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MovieCard = ({ movie, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withTiming(0.96, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      onPress={onPress}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Card content */}
      </Animated.View>
    </Pressable>
  );
};
```

---

## Shared Components cần xây dựng

| Component | Mô tả | Dùng ở |
|-----------|--------|--------|
| `StickyBottomBar` | Bottom bar cố định hiển thị tổng tiền + CTA | B3, B4, B5 |
| `MovieCard` | Card phim (poster + title + duration + badge) | A1, A2, B10 |
| `DateSlider` | FlatList ngang chọn ngày (7 ngày tới) | B1, B8 |
| `ShowtimeChip` | Chip hiển thị giờ chiếu (touchable) | B1, B7, B8 |
| `SeatButton` | Nút ghế đơn (các trạng thái + animation) | B3 |
| `CountdownTimer` | Đếm ngược 15 phút giữ ghế | B4, B5 |
| `SkeletonLoader` | Placeholder loading (shimmer effect) | Tất cả |
| `ErrorRetry` | UI lỗi thân thiện + nút Retry | Tất cả |
| `AgeBadge` | Badge C13/C18/P với màu sắc chuẩn | A1, A2, B1 |
| `PromoCard` | Card khuyến mãi với ribbon | A1, B13 |
| `CinemaCard` | Card rạp (ảnh + tên + địa chỉ + facilities) | A1, A4 |
| `LoyaltyCard` | Thẻ thành viên gradient | A5 |
| `EmptyState` | Trạng thái trống (icon + text + CTA) | B9, A2, B10 |
| `QRTicket` | Thẻ vé E-ticket với QR code | B6, B9 |

---

## Mobile-Specific UX Enhancements

### Push Notifications

Dùng `expo-notifications` cho:
- **Nhắc lịch xem phim** — 2 giờ trước suất chiếu
- **Khuyến mãi mới** — khi có mã giảm giá mới
- **Trạng thái đặt vé** — xác nhận thanh toán thành công
- **Điểm thưởng** — cập nhật điểm tích lũy

```tsx
import * as Notifications from 'expo-notifications';

// Đăng ký push token
const registerForPush = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await api.post('/users/push-token', { token });
};

// Schedule local notification nhắc lịch
Notifications.scheduleNotificationAsync({
  content: {
    title: '🎬 Sắp đến giờ chiếu!',
    body: `${movieTitle} sẽ chiếu lúc ${startTime} tại ${cinemaName}.`,
  },
  trigger: { date: showtimeDate - 2 * 60 * 60 * 1000 },  // 2h trước
});
```

### Deep Linking

Cấu hình URL scheme: `cinemax://` và Universal Links.

| Pattern | Screen | Params |
|---------|--------|--------|
| `cinemax://movie/:id` | MovieDetailScreen | `{ id }` |
| `cinemax://cinema/:slug` | CinemaDetailScreen | `{ slug }` |
| `cinemax://ticket/:id` | TicketDetailScreen | `{ ticketId }` |
| `cinemax://promo/:code` | PromotionDetailScreen | `{ promoId }` |
| `cinemax://news/:slug` | NewsDetailScreen | `{ slug }` |
| `cinemax://booking/fast` | QuickBookScreen | — |

```tsx
// App linking config
const linking = {
  prefixes: ['cinemax://', 'https://cinemax.vn'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              MovieDetail: 'movie/:id',
              NewsDetail: 'news/:slug',
            }
          },
          CinemaTab: {
            screens: {
              CinemaDetail: 'cinema/:slug',
            }
          },
        }
      }
    }
  }
};
```

### Haptic Feedback

Dùng `expo-haptics` cho các tương tác quan trọng:

```tsx
import * as Haptics from 'expo-haptics';

// Khi chọn ghế
const onSeatSelect = (seat) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  toggleSeat(seat);
};

// Khi thanh toán thành công
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Khi lỗi
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

### Image Caching & Fallback

Dùng `expo-image` (thay `Image` mặc định) cho cache và fallback tự động:

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: movie.posterUrl }}
  placeholder={require('../assets/placeholder-movie.png')}
  contentFit="cover"
  transition={200}
  style={styles.poster}
/>
```

### Network Status

Dùng `@react-native-community/netinfo` để detect mất mạng → hiện `NoConnectionScreen` (F3) overlay:

```tsx
import NetInfo from '@react-native-community/netinfo';

const [isConnected, setIsConnected] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsConnected(state.isConnected ?? true);
  });
  return unsubscribe;
}, []);

// Render overlay
{!isConnected && <NoConnectionOverlay onRetry={checkConnection} />}
```

### Secure Token Storage

```tsx
import * as SecureStore from 'expo-secure-store';

// Lưu JWT
await SecureStore.setItemAsync('auth_token', token);

// Đọc JWT
const token = await SecureStore.getItemAsync('auth_token');

// Xóa khi logout
await SecureStore.deleteItemAsync('auth_token');
```

**QUAN TRỌNG:** KHÔNG dùng AsyncStorage cho auth token. AsyncStorage chỉ dùng cho preferences (theme, onboarding flag).

---

## Nguyên tắc thiết kế iOS-Native — Glassmorphism & Dock UI

> Section này bổ sung quy chuẩn thiết kế kiểu iOS hiện đại cho toàn bộ app CinemaXNet Mobile.
> Bao gồm: Floating Dock Tab Bar, hiệu ứng kính mờ (Glassmorphism), và bo cong chuẩn iOS.

### 1. Floating Dock Tab Bar (macOS Dock style)

Bottom Tab Bar của app PHẢI được thiết kế theo phong cách **macOS Dock** — nổi (floating), bo cong tròn, hiệu ứng kính mờ:

**Đặc điểm:**
- `position: 'absolute'` — nổi trên content, KHÔNG đẩy layout
- `marginHorizontal: 16` — thu hẹp, KHÔNG full width
- `borderRadius: 28` (`Theme.radius.dock`) — bo cong tròn giống dock
- Nền kính mờ: `expo-glass-effect` `GlassView` trên iOS 26+, fallback `rgba(18,18,30,0.65)` trên Android
- Viền mỏng: `borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)'`
- Shadow nhẹ phía dưới tạo cảm giác floating
- Nút "Đặt vé" giữa dock nổi lên (`marginTop: -18`) với background accent

**Code pattern (Custom tabBar):**
```tsx
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

const FloatingDockTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const glassAvailable = isGlassEffectAPIAvailable();

  const dockContent = (
    <View style={dockStyles.innerRow}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        // ... render tab items
      })}
    </View>
  );

  const dockOuterStyle = { bottom: Math.max(insets.bottom, 8) + 4 };

  if (glassAvailable) {
    return (
      <View style={[dockStyles.dockOuter, dockOuterStyle]}>
        <GlassView
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={Theme.colors.glass.tint}
          style={dockStyles.dockContainer}
        >
          {dockContent}
        </GlassView>
      </View>
    );
  }

  // Fallback: semi-transparent
  return (
    <View style={[dockStyles.dockOuter, dockOuterStyle]}>
      <View style={[dockStyles.dockContainer, { backgroundColor: Theme.colors.glass.background }]}>
        {dockContent}
      </View>
    </View>
  );
};

// Dùng trong Tab.Navigator:
<Tab.Navigator tabBar={(props) => <FloatingDockTabBar {...props} />} />
```

**Lưu ý:** Vì dock nổi bằng `position: absolute`, các ScrollView/FlatList trong Tab screens cần `contentContainerStyle={{ paddingBottom: 100 }}` để content không bị dock che.

---

### 2. Glassmorphism Standards (Kính mờ)

Hiệu ứng kính mờ (glass/blur) được áp dụng cho các surface sau:

| Surface | Glass Style | Khi nào dùng |
|---------|-------------|-------------|
| **Bottom Tab Bar (Dock)** | `GlassView regular` | Luôn luôn |
| **Screen Header** | `GlassView regular` | Khi cần header trong suốt (scroll-through) |
| **Sticky Bottom Bar** | `GlassView regular` | SeatSelection, Concession, Payment |
| **Cards quan trọng** | `GlassCard` component | Payment cards, order summary |
| **Modals / BottomSheet** | `GlassView regular` | Popup, BottomSheet nền |

**Thư viện:** `expo-glass-effect` (đã có trong dependencies)
- `GlassView`: iOS 26+ native liquid glass, fallback `View` trên Android
- `GlassContainer`: Grouping nhiều GlassView gần nhau (merge hiệu ứng)
- `isGlassEffectAPIAvailable()`: Check runtime support

**Glass Color Tokens (`Theme.colors.glass`):**
```typescript
glass: {
  background: 'rgba(18, 18, 30, 0.65)',       // Nền fallback chính
  backgroundLight: 'rgba(26, 26, 46, 0.55)',   // Nền nhạt hơn
  border: 'rgba(255, 255, 255, 0.12)',          // Viền glass chính
  borderLight: 'rgba(255, 255, 255, 0.08)',     // Viền nhẹ
  tint: 'rgba(13, 13, 13, 0.4)',               // Tint color cho GlassView
}
```

**Reusable Components:**

#### GlassCard (`src/components/ui/GlassCard.tsx`)
```tsx
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

<GlassCard intensity="regular" borderRadius={Theme.radius.card} bordered>
  {/* Card content */}
</GlassCard>
```
Props: `intensity` ('light' | 'regular'), `bordered` (boolean), `borderRadius` (number).
iOS 26+: native GlassView. Fallback: semi-transparent View.

#### GlassHeader (`src/components/ui/GlassHeader.tsx`)
```tsx
<GlassHeader
  title="XÁC NHẬN THANH TOÁN"
  onBack={() => navigation.goBack()}
  rightAction={<SearchButton />}
/>
```
Header iOS-style blur. Auto SafeArea padding top.

**Quy tắc Glass:**
- ❌ KHÔNG dùng glass cho tất cả mọi thứ — chỉ dùng cho surface "nổi" hoặc "floating"
- ❌ KHÔNG lồng GlassView bên trong GlassView (dùng GlassContainer nếu cần group)
- ✅ Luôn có fallback semi-transparent cho Android/iOS cũ
- ✅ Viền glass luôn mỏng: `borderWidth: 0.5` (KHÔNG dùng 1 hoặc 2)

---

### 3. Bo cong (Rounded Corners) — Tiêu chuẩn iOS

Tất cả component UI PHẢI sử dụng bo cong theo bảng sau:

| Component | Radius Token | Giá trị | Ví dụ |
|-----------|-------------|---------|-------|
| Badge nhỏ, ghế (seat) | `Theme.radius.xs` | `6` | Age badge, seat button |
| Chip, small badge | `Theme.radius.sm` | `8` | Filter chips, status tags |
| Input fields | `Theme.radius.md` | `12` | TextInput, search bar |
| Buttons (CTA) | `Theme.radius.btn` | `14` | "Đặt Vé", "Thanh Toán" |
| Cards nhỏ, items | `Theme.radius.lg` | `16` | Promo chip, list item |
| Cards lớn | `Theme.radius.card` | `20` | Movie card, payment card |
| Sections, modals | `Theme.radius.xl` | `24` | Bottom sheet, section wrapper |
| Floating Dock | `Theme.radius.dock` | `28` | Tab Bar dock |
| Pill shape | `Theme.radius.pill` | `999` | Tag labels only |

**Quy tắc bo cong:**
- ❌ KHÔNG dùng `borderRadius: 8` cho cards — tối thiểu `20` (giống iOS App Store cards)
- ❌ KHÔNG dùng góc vuông (radius 0) cho bất kỳ element tương tác nào
- ✅ Icon containers dùng `borderRadius: 16` (kiểu iOS app icon, KHÔNG tròn hoàn toàn)
- ✅ Buttons CTA luôn dùng `borderRadius: 14` (lớn hơn web nhưng không pill)
- ✅ Sticky bottom bars dùng `borderTopLeftRadius: 24, borderTopRightRadius: 24`

**Ví dụ so sánh trước/sau:**
```diff
// Cards
- borderRadius: 12
+ borderRadius: Theme.radius.card  // 20

// Buttons
- borderRadius: 8
+ borderRadius: Theme.radius.btn   // 14

// Inputs
- borderRadius: 8
+ borderRadius: Theme.radius.md    // 12

// Quick link icons (iOS app icon style, không tròn hoàn toàn)
- borderRadius: 22  (circle)
+ borderRadius: Theme.radius.lg  // 16 (squircle)

// Border width (glass-style mỏng hơn)
- borderWidth: 1
+ borderWidth: 0.5
```

---

### 4. Updated Design Tokens — `src/theme/tokens.ts`

```typescript
// iOS-Native Rounded Corners
export const Radius = {
  xs: 6,      // Badge nhỏ, seat ghế
  sm: 8,      // Badge, small chips
  md: 12,     // Input fields, small buttons
  btn: 14,    // Buttons chính (CTA)
  lg: 16,     // Cards nhỏ, section items
  card: 20,   // Cards lớn (movie card, payment card, promo card)
  xl: 24,     // Sections, modals, bottom sheets
  dock: 28,   // Floating Dock Tab Bar
  pill: 999,  // Rounded pill (tags, status chips)
};

// Shadows — Dock shadow mới
export const Shadows = {
  // ... existing card, strong ...
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
```

---

### 5. Shared UI Components bổ sung

Ngoài danh sách components đã có ở trên, thêm:

| Component | Mô tả | Dùng ở |
|-----------|--------|--------|
| `GlassCard` | Card kính mờ iOS (GlassView + fallback) | B5, B4, B3, Cards quan trọng |
| `GlassHeader` | Header blur iOS-style | Tất cả stack screens |
| `FloatingDockTabBar` | Custom tab bar kiểu macOS Dock | AppNavigator (Tab.Navigator) |

---

## Checklist trước khi merge (Cho Mobile)

### Layout & SafeArea
- [ ] Sticky Bottom Bar ở SeatSelection/Concession/Payment có bị che bởi Home Indicator / notch? (Test `SafeAreaView`)
- [ ] Bàn phím có che mất form nhập liệu ở Payment / Login / Register / Contact / ChangePassword? (Test `KeyboardAvoidingView`)
- [ ] Navigation header có nút Back trên tất cả stack screens?

### Performance
- [ ] List phim/rạp/vé có mượt không? (Đã dùng `FlatList` / `FlashList` chưa hay `ScrollView`?)
- [ ] Ảnh có dùng `expo-image` với cache không? Fallback placeholder khi load lỗi?
- [ ] Animation có `useReducedMotion()` để tôn trọng cài đặt hệ thống?

### Functional
- [ ] Màn hình QR vé có đẩy sáng lên max không? (`expo-brightness`)
- [ ] Dark mode có làm vỡ sơ đồ ghế / form / text không? (Test cả 2 theme)
- [ ] Geolocation error có message thân thiện không? (không throw raw error)
- [ ] Countdown timer hết thời gian có redirect về Home không?
- [ ] Pull-to-refresh hoạt động ở: Home, MovieList, CinemaList, MyTickets, News, Promotions?
- [ ] Deep linking hoạt động cho movie/:id, cinema/:slug, news/:slug?
- [ ] Push notification token đã gửi lên server chưa?
- [ ] Social login (Google/Facebook) hoạt động trên cả iOS và Android?
- [ ] Secure token storage dùng `expo-secure-store`, không dùng AsyncStorage?

### UX
- [ ] Tất cả nút có accessibility label chưa? (`accessibilityLabel`, `accessibilityRole`)
- [ ] Empty states có CTA button để điều hướng user?
- [ ] Haptic feedback khi chọn ghế, thanh toán thành công, lỗi?
- [ ] Splash screen + Onboarding hoạt động lần đầu?
- [ ] Copy promo code có toast feedback?
- [ ] 3D flip vé hoạt động mượt trên cả iOS/Android?
- [ ] Confetti animation ở PaymentSuccess không gây lag?

### Network
- [ ] Mất mạng có hiện NoConnectionScreen/Overlay không?
- [ ] API timeout có hiện lỗi thân thiện + nút Retry?
- [ ] Skeleton loaders hiển thị khi đang fetch dữ liệu?

---

## Tham khảo nhanh — Thư viện Mobile

| Thư viện | Mục đích | Package |
|----------|----------|---------|
| Expo SDK | Framework chính | `expo` |
| React Navigation | Navigation | `@react-navigation/native` |
| Reanimated | Animations mượt | `react-native-reanimated` |
| Expo Location | Geolocation | `expo-location` |
| Expo Brightness | QR screen brightness | `expo-brightness` |
| Expo Clipboard | Copy promo code | `expo-clipboard` |
| Expo AV | Trailer video | `expo-av` |
| Expo Image | Image cache + fallback | `expo-image` |
| Expo Image Picker | Avatar upload | `expo-image-picker` |
| Expo Haptics | Haptic feedback | `expo-haptics` |
| Expo Notifications | Push notifications | `expo-notifications` |
| Expo Secure Store | JWT token storage | `expo-secure-store` |
| Expo Splash Screen | Splash control | `expo-splash-screen` |
| Expo Auth Session | OAuth (Google/FB) | `expo-auth-session` |
| QRCode SVG | QR code generation | `react-native-qrcode-svg` |
| Linear Gradient | Gradient overlays | `expo-linear-gradient` |
| Confetti Cannon | Success celebration | `react-native-confetti-cannon` |
| Zoomable View | Seat map zoom | `@openspacelabs/react-native-zoomable-view` |
| FlashList | High-perf FlatList | `@shopify/flash-list` |
| View Shot | Capture ticket as image | `react-native-view-shot` |
| NetInfo | Network status detect | `@react-native-community/netinfo` |
| Media Library | Save ticket image | `expo-media-library` |

---

## Quy tắc Code Review & Tự động Fix Lỗi (Bắt buộc tuân thủ)

- **Liên tục kiểm tra:** Quá trình xây dựng app phải đi đôi với việc liên tục kiểm tra các màn hình, module, component do người khác (hoặc agent khác) vừa viết xem có bị lỗi code không.
- **Tự động sửa lỗi:** Nếu phát hiện lỗi (logic, UI vỡ, thiếu library, bug react native), bạn phải **TỰ ĐỘNG FIX NÓ NGAY LẬP TỨC**. Làm tới đâu phải kiểm tra tới đó, không để lỗi dồn lại.
- **Bảo toàn tài liệu:** Tuyệt đối không được phá, xóa hoặc làm hỏng file `SKILL.md` này. Mọi thay đổi tài liệu nếu có phải giữ nguyên vẹn nội dung cũ.
