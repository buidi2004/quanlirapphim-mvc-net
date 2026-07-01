---
name: react_native_ui
description: Tiêu chuẩn và hướng dẫn để Agent code UI (Giao diện) cho ứng dụng di động React Native của dự án CinemaX.
---

# Kỹ năng Code UI React Native (CinemaX App)

Kỹ năng này định nghĩa các tiêu chuẩn, pattern, và phong cách thiết kế bắt buộc phải tuân thủ khi viết mã giao diện (UI) bằng React Native cho dự án CinemaX.

## 1. Công nghệ & Thư viện (Tech Stack)
*   **Core:** React Native (TypeScript), Functional Components, React Hooks.
*   **Điều hướng (Navigation):** React Navigation (Bottom Tabs, Native Stack).
*   **Gọi API:** Sử dụng Axios thông qua các Services đã được dựng sẵn tại thư mục `src/services/` và các Models tại `src/models/`.
*   **Quản lý trạng thái (State Management):** Ưu tiên dùng Context API cho Auth/Theme và Zustand cho giỏ hàng (Concessions/Tickets) nếu cần. Dùng local state (`useState`, `useReducer`) cho logic nội bộ của màn hình.
*   **Styling:** Sử dụng `StyleSheet.create` thuần hoặc Styled-Components/NativeWind (tuỳ theo setup cụ thể của dự án).

## 2. Ngôn ngữ Thiết kế (Design Language & Aesthetics)
Ứng dụng CinemaX hướng tới trải nghiệm điện ảnh cao cấp (Premium Cinematic Experience). Khi code UI, Agent **PHẢI** tuân thủ:
*   **Theme (Chế độ màu):** Ưu tiên giao diện tối (Dark Mode) làm chủ đạo (Nền Đen/Xám đậm - `#111111`, `#1C1C1C`) để làm nổi bật Poster phim.
*   **Màu nhấn (Accent Colors):** Sử dụng các gam màu sang trọng và nổi bật như Đỏ Điện Ảnh (`#E50914`), Vàng VIP (`#F5B041`), hoặc Xanh Neon cho các nút bấm (CTA), icon, và viền active.
*   **Typography:** Sử dụng font chữ hiện đại, sans-serif. Tiêu đề cần in đậm (Bold), khoảng cách dòng thoáng.
*   **Hiệu ứng (Effects):** Tích cực sử dụng bóng đổ (Shadows) mượt mà, bo góc (Border Radius - `12px` đến `16px`) cho các thẻ (Cards), và hiệu ứng kính (Glassmorphism/Blur) cho các lớp phủ (Overlays) hoặc thanh điều hướng.
*   **Trải nghiệm động (Animations):** Thêm micro-animations (dùng `Animated` hoặc `react-native-reanimated`) cho các thao tác chạm (ví dụ: nút bấm hơi thu nhỏ khi ấn - `TouchableOpacity`, danh sách vuốt mượt mà).

## 3. Cấu trúc Component
Sử dụng tư duy Atomic Design để chia nhỏ giao diện:
*   **Atoms:** Xây dựng các UI thuần túy có thể tái sử dụng tối đa: `CustomButton`, `CustomText`, `Badge`, `LoadingIndicator`.
*   **Molecules/Organisms:** Nhóm các Atoms lại: `MovieCard` (gồm Poster, Tiêu đề, Badge), `SeatItem` (Ghế ngồi), `ShowtimeSelector`.
*   **Screens:** Các Component cấp cao nhất kết nối với Navigation và gọi API Services (ví dụ: `HomeScreen`, `SeatMapScreen`). Các Screen KHÔNG nên chứa quá nhiều style inline mà phải tách riêng.

## 4. Tương tác với Dữ liệu (API & Models)
*   **Tuyệt đối không hardcode dữ liệu:** Ngoại trừ lúc làm mockup/skeleton. Mọi dữ liệu phải được định nghĩa bằng Interface (lấy từ `src/models/`) và fetch qua Service (`src/services/`).
*   **Xử lý trạng thái tải (Loading/Error States):** Mọi API call trên Screen phải có trạng thái `isLoading` (hiển thị `ActivityIndicator` hoặc Skeleton Screen) và `error` (hiển thị thông báo lỗi rõ ràng, có nút "Thử lại").

## 5. Tối ưu Hiệu năng (Performance) & UX
*   **Danh sách dài (Lists):** Bắt buộc sử dụng `FlatList` hoặc `SectionList`. Phải cấu hình `keyExtractor` chuẩn xác, sử dụng `initialNumToRender`, `windowSize`, và `getItemLayout` (nếu các item có chiều cao cố định) để tránh giật lag khi cuộn mượt hàng trăm bộ phim/suất chiếu.
*   **Tối ưu Hình ảnh:** Cấu hình `resizeMode="cover"` cho Poster phim. Có UI placeholder lúc ảnh đang tải.
*   **SafeArea & Cạnh màn hình:** Bắt buộc sử dụng `SafeAreaView` từ `react-native-safe-area-context` để UI không bị che khuất bởi rãnh tai thỏ (Notch), Dynamic Island hay thanh điều hướng hệ thống (Home Indicator).
*   **Bàn phím:** Sử dụng `KeyboardAvoidingView` và `TouchableWithoutFeedback` (để dismiss keyboard) ở các màn hình Form (Login, Register).

## 6. Sơ đồ File & Kiến trúc UI Khuyến nghị
Khi tạo một màn hình mới, hãy đặt file theo cấu trúc:
```
mobile-app/src/
  ├── components/
  │   ├── common/      (Button, Input, Header)
  │   └── features/    (MovieCard, SeatItem)
  ├── screens/
  │   ├── Home/
  │   │   ├── HomeScreen.tsx
  │   │   └── styles.ts
  │   ├── Booking/
  │   └── ...
  ├── theme/           (Colors.ts, Typography.ts, Spacing.ts)
```

**Mục tiêu tối thượng:** Render ra một giao diện khiến người dùng phải WOW ngay từ cái nhìn đầu tiên. Khước từ sự nhàm chán, ôm trọn sự tinh tế!
