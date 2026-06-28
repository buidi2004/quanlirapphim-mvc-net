---
name: react-native-ux-ui
description: >
  Triển khai giao diện và trải nghiệm người dùng cho nền tảng Mobile App CinemaXNet (React Native).
  Được chuyển đổi và tối ưu trực tiếp từ bộ quy chuẩn UX/UI của Web.
  Kích hoạt skill này khi người dùng yêu cầu xây dựng, chỉnh sửa hoặc
  refactor BẤT KỲ thành phần UI nào trên App Mobile: trang chủ, sơ đồ ghế,
  bắp nước, thanh toán, navigation, dark mode, quét QR, geolocation.
---

# CinemaXNet Mobile App — Skill UX/UI (React Native)

Kỹ năng này kế thừa trực tiếp các nguyên tắc thiết kế cốt lõi từ nền tảng Web CinemaXNet và được tối ưu hóa riêng biệt cho môi trường Mobile (React Native).

## Nguyên tắc thiết kế cốt lõi (Kế thừa từ Web)

1. **Không gián đoạn luồng mua vé** — Chuyển màn hình (Navigation) phải mượt mà. Không block toàn bộ màn hình khi tải dữ liệu, sử dụng Skeleton Loaders.
2. **Luôn hiển thị tổng tiền** — Order Summary luôn được neo (Fixed/Absolute) ở dưới cùng màn hình (Bottom Bar) trong suốt quá trình chọn ghế → bắp nước.
3. **Fallback graceful** — Mọi component phụ thuộc API phải có phương án dự phòng (UI báo lỗi thân thiện có nút Retry).

---

## 1. Layout & Cấu trúc màn hình

### 1.1 Fixed Bottom Order Summary (Tối ưu từ Web 8-4 Layout)

Trên mobile không có cột trái/phải. Order Summary phải luôn bám ở cạnh dưới màn hình (phía trên vùng an toàn SafeArea).

```tsx
<View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }}>
    {/* Danh sách ghế / bắp nước */}
  </ScrollView>
  
  {/* Sticky Bottom Summary */}
  <SafeAreaView edges={['bottom']} style={styles.stickySummary}>
    <Text style={styles.totalPrice}>Tổng cộng: {total.toLocaleString('vi-VN')}đ</Text>
    <CustomButton title="Tiếp tục" onPress={handleNext} />
  </SafeAreaView>
</View>
```

### 1.2 Sơ đồ ghế — 2D Map (Tối ưu từ CSS Grid)

Trên mobile, màn hình hẹp nên Sơ đồ ghế cần được bọc trong 2 lớp `ScrollView` (Cuộn ngang và dọc) hoặc dùng thư viện Pinch-to-Zoom.

*   **Ghế thường:** `36x36`, `borderRadius: 6`
*   **Ghế đôi (Sweetbox):** `width: 76` (gấp đôi), màu gradient.
*   **Ghế VIP:** Viền vàng gold `#FFD700`.
*   **Ghế đã đặt:** Nền xám `#6c757d`, `opacity: 0.5`, `disabled={true}`.
*   **Ghế đang chọn:** Nền đỏ Accent, hiệu ứng `scale` khi chọn.

```tsx
<ScrollView horizontal>
  <ScrollView>
    <View style={styles.gridContainer}>
       {/* Render hàng và cột bằng Flexbox (flexDirection: 'row') */}
    </View>
  </ScrollView>
</ScrollView>
```

### 1.3 Horizontal Scroll (Danh sách phim ngang)

Kế thừa CSS `scroll-snap-type` của web bằng thuộc tính `snapToInterval` trong `FlatList` của React Native.

```tsx
<FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={movies}
  keyExtractor={(item) => item.id.toString()}
  snapToInterval={ITEM_WIDTH + SPACING}
  decelerationRate="fast"
  renderItem={({ item }) => <MovieCard data={item} />}
/>
```

---

## 2. Core UX Flows

### 2.1 Chọn Suất Chiếu Nhanh (Tối ưu từ Zero-Reload)

Sử dụng hệ thống Tabs (Ngày) và Accordion/List (Cụm rạp). Khi nhấn chọn một ngày, list rạp trượt nhẹ ra (Reanimated) thay vì tải lại toàn trang.
Option nào không khả dụng thì dùng màu `muted` và `disabled={true}`.

### 2.2 Bắp Nước — Tính Toán Local Tức Thì

Không chờ API phản hồi mới cập nhật số lượng bắp nước. Cập nhật State (UI) ngay lập tức và hiệu ứng nhảy số.

```tsx
// Sử dụng Reanimated hoặc Animated của React Native cho hiệu ứng nhảy giá tiền
const scale = useSharedValue(1);

const onIncrease = () => {
  setQty(q => q + 1);
  scale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 150 }));
};
```

---

## 3. Advanced UI Patterns

### 3.1 Micro-interactions (Hiệu ứng chạm)

Bỏ hover (không có chuột trên mobile). Thay bằng `Pressable` với hiệu ứng scale xuống khi nhấn.

```tsx
<Pressable
  onPressIn={() => scale.value = withTiming(0.96)}
  onPressOut={() => scale.value = withTiming(1)}
>
  <Animated.View style={[styles.card, animatedStyle]}>...
```

### 3.2 Dark/Light Mode

Dùng `Appearance` từ React Native hoặc thẻ `ThemeProvider` của Navigation. Giao diện ưu tiên tông Tối (Dark Mode) giống hệ thống Web.

```tsx
const colors = isDark ? {
  bgCard: '#1a1d23',
  bgSurface: '#13161b',
  textMuted: '#8b949e'
} : { ... };
```

---

## 4. Feedback & Device APIs

### 4.1 Geolocation — Tìm rạp gần nhất

Dùng `expo-location` hoặc `@react-native-community/geolocation`. Phải xử lý xin quyền (Permissions) một cách thân thiện trước khi lấy tọa độ.

```tsx
let { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  showError('Vui lòng cấp quyền vị trí để tìm rạp gần bạn nhất.');
  return;
}
```

### 4.2 Lỗi Mạng / Lỗi Server

| Lỗi | Hình ảnh | Tiêu đề | Hành động trên App |
| :--- | :--- | :--- | :--- |
| Mất mạng | Icon WiFi gạch chéo | "Không có kết nối Internet" | Nút "Thử lại" bọc toàn màn hình |
| 500 | Phim đứt | "Kỹ thuật viên đang nối lại phim" | Nút "Thử lại" + Contact |
| 403 | Vé bị chặn | "Phiên đăng nhập hết hạn" | Điều hướng về màn hình `Login` |

---

## 5. Value-Add Components

### 5.1 Badge Cảnh Báo (Kế thừa CSS Absolute Positioning)

```tsx
const styles = StyleSheet.create({
  movieBadge: {
    position: 'absolute',
    top: 10,
    left: -5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    elevation: 3, // Shadow cho Android
    shadowColor: '#000', // Shadow cho iOS
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
  },
  badgeC18: { backgroundColor: '#f44336' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});
```

### 5.2 Mã QR E-Ticket

Dùng `react-native-qrcode-svg` thay thế cho thư viện `qrcode.js` của Web.

```tsx
import QRCode from 'react-native-qrcode-svg';

<QRCode
  value={JSON.stringify({ code: bookingCode, ts: Date.now(), v: '1' })}
  size={200}
  color="black"
  backgroundColor="white"
/>
```

---

## 6. Design Tokens Khuyến Nghị (Bản sao từ CSS Variables)

Tạo file `src/theme/tokens.ts`:

```typescript
export const Theme = {
  colors: {
    accent: '#e50914',
    gold: '#FFD700',
    background: '#111111',
    surface: '#1a1d23',
    textPrimary: '#ffffff',
    textMuted: '#8b949e'
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  radius: {
    btn: 8,
    card: 12,
  }
};
```

---

## 7. Checklist Trước Khi Merge (Cho Mobile)

- [ ] Sticky Summary ở màn hình đặt vé có bị che khuất bởi tai thỏ / Home Indicator dưới cùng không? (Test bằng `SafeAreaView`).
- [ ] Bàn phím có che mất form nhập liệu ở trang Thanh toán / Đăng nhập không? (Kiểm tra `KeyboardAvoidingView`).
- [ ] List phim/rạp có mượt không? (Đã dùng `FlatList` chưa hay đang dùng `ScrollView`?).
- [ ] Fallback cho ảnh: Khi ảnh poster load lỗi, có hiển thị ảnh placeholder không? (`defaultSource` hoặc hàm `onError`).
- [ ] Màn hình QR vé có đẩy độ sáng màn hình điện thoại lên tối đa không? (Nên dùng thư viện `expo-brightness` để tăng sáng khi hiện mã QR giúp máy quét dễ đọc hơn).
