---
name: cinemaxnet-ux-ui
description: >
  Triển khai giao diện và trải nghiệm người dùng cho nền tảng CinemaXNet —
  hệ thống đặt vé xem phim, bán bắp nước và thanh toán trực tuyến.
  Kích hoạt skill này khi người dùng yêu cầu xây dựng, chỉnh sửa hoặc
  refactor BẤT KỲ thành phần UI nào của CinemaXNet: trang chủ, sơ đồ ghế,
  đặt vé nhanh, bắp nước, thanh toán, Navbar, trang lỗi, dark mode, QR code,
  geolocation, hay bất kỳ trang/widget nào thuộc hệ sinh thái website.
  Cũng kích hoạt khi cần tư vấn UX, cải thiện Conversion Rate, hoặc debug
  các vấn đề về layout/animation/accessibility trên nền tảng này.
---

# CinemaXNet — Skill UX/UI

## Nguyên tắc thiết kế cốt lõi

Mọi thành phần UI trên CinemaXNet phải đáp ứng đồng thời 3 tiêu chí:

1. **Không gián đoạn luồng mua vé** — user không được bị redirect hay reload trang không cần thiết trong quá trình chọn phim → ghế → bắp nước → thanh toán.
2. **Luôn hiển thị tổng tiền** — bất kể user đang ở bước nào, Order Summary phải visible hoặc sticky.
3. **Fallback graceful** — mọi component phụ thuộc API/JSON phải có phương án dự phòng; luồng mua vé không bao giờ bị sập hoàn toàn.

---

## 1. Layout & Cấu trúc trang

### 1.1 Bố cục 8-4 (trang Bắp nước & Thanh toán)

Áp dụng tỷ lệ 2/3 – 1/3 theo chuẩn e-commerce:

```html
<div class="row g-4">
  <div class="col-lg-8"><!-- Danh sách sản phẩm / Form --></div>
  <div class="col-lg-4">
    <div class="order-summary sticky-top" style="top: 100px;">
      <!-- Order Summary luôn nổi theo màn hình -->
    </div>
  </div>
</div>
```

**Quy tắc:** Cột phải (4) LUÔN là Order Summary với `position: sticky; top: 100px`.
Không dùng `position: fixed` (gây vấn đề trên mobile) hay float.

### 1.2 Sơ đồ ghế — Dynamic CSS Grid

Ưu tiên render bằng CSS Grid từ dữ liệu JSON; fallback về HTML loop nếu không có JSON.

```javascript
function renderSeatMap(cinemaData) {
  if (cinemaData?.layout?.json) {
    // Lớp 1: Rạp hiện đại có dữ liệu cấu trúc
    return renderGridFromJSON(cinemaData.layout.json);
  }
  // Lớp 2: Fallback — rạp cũ, render vòng lặp HTML cơ bản
  return renderBasicSeatLoop(cinemaData.rows, cinemaData.cols);
}

function renderGridFromJSON(layoutJSON) {
  const cols = layoutJSON.columns; // VD: ["seat","seat","aisle","seat","seat"]
  const colTemplate = cols.map(c => c === "aisle" ? "20px" : "36px").join(" ");
  container.style.gridTemplateColumns = colTemplate;
  // Render từng ghế vào grid; ghế đôi (loveseat) dùng grid-column: span 2
}
```

**Quy tắc ghế:**
- Ghế thường: `36×36px`, border-radius `6px`
- Ghế đôi (Sweetbox): `grid-column: span 2`, màu gradient hồng/đỏ
- Ghế VIP: viền vàng gold `#FFD700`
- Ghế đã đặt: `background: #6c757d`, `cursor: not-allowed`, `pointer-events: none`
- Ghế đang chọn: `background: var(--cx-accent)`, scale `1.1` animation

### 1.3 Responsive & Mobile-First

Dùng Bootstrap 5 Grid; không custom breakpoint trừ khi thật sự cần.

```html
<!-- Phim Thịnh Hành — vuốt ngang trên mobile -->
<div class="d-flex gap-3 overflow-x-auto pb-2"
     style="scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;">
  <div class="movie-card flex-shrink-0" style="scroll-snap-align: start; width: 160px;">
    ...
  </div>
</div>

<!-- Grid phim trên desktop -->
<div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
  ...
</div>
```

---

## 2. Core UX Flows

### 2.1 Đặt Vé Nhanh — Zero-Reload Matrix

Trang `/booking/fast` dùng Fetch API; không dùng form submit truyền thống.

```javascript
// Thứ tự cascade: Phim → Rạp → Ngày → Suất chiếu
const selectors = ['movie', 'cinema', 'date', 'showtime'];

async function onSelect(level, value) {
  // Disable tất cả selector ở cấp sau
  selectors.slice(level + 1).forEach(s => {
    document.querySelector(`[data-selector="${s}"]`).disabled = true;
    document.querySelector(`[data-selector="${s}"]`).innerHTML =
      '<option>Đang tải...</option>';
  });

  const nextLevel = selectors[level + 1];
  if (!nextLevel) { redirectToSeatMap(value); return; }

  const data = await fetchOptions(nextLevel, buildCurrentParams());
  populateSelector(nextLevel, data);
  // Các option không khả dụng: disabled + class "text-muted"
}
```

**Quy tắc UX:**
- Option không khả dụng: `disabled`, màu `#adb5bd`, KHÔNG xóa khỏi DOM (user cần thấy lý do)
- Khi đang fetch: hiện skeleton loader, không block toàn trang
- Nếu fetch lỗi: toast error + giữ nguyên giá trị đã chọn, không reset form

### 2.2 Bắp Nước — Client-Side Tức Thì

```javascript
function updateConcessionItem(itemId, delta) {
  const item = cart.find(i => i.id === itemId);
  item.qty = Math.max(0, item.qty + delta);

  // Cập nhật DOM ngay, không gọi API
  document.querySelector(`#qty-${itemId}`).textContent = item.qty;
  document.querySelector(`#btn-minus-${itemId}`).disabled = item.qty === 0;

  // Tính lại tổng
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.querySelector('#order-total').textContent =
    total.toLocaleString('vi-VN') + 'đ';

  // Animation counter (optional nhưng recommended)
  document.querySelector('#order-total').classList.add('price-bump');
  setTimeout(() => document.querySelector('#order-total')
    .classList.remove('price-bump'), 300);
}
```

CSS animation counter:
```css
@keyframes priceBump {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); color: var(--cx-accent); }
  100% { transform: scale(1); }
}
.price-bump { animation: priceBump 0.3s ease; }
```

---

## 3. Advanced UI Patterns

### 3.1 Mega Menu

Ghi đè Bootstrap dropdown; KHÔNG dùng `dropdown-menu` mặc định.

```html
<li class="nav-item dropdown position-static">
  <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Khám Phá Phim</a>
  <div class="dropdown-menu w-100 p-4 mega-menu">
    <div class="row g-3">
      <!-- Cột 1: Phim nổi bật với poster -->
      <div class="col-lg-8">
        <div class="row row-cols-4 g-2">
          <!-- Poster phim kèm nút "Đặt vé ngay" -->
        </div>
      </div>
      <!-- Cột 2: Thể loại + Định dạng -->
      <div class="col-lg-4">
        <h6 class="text-muted text-uppercase small mb-2">Định dạng</h6>
        <!-- IMAX, 4DX, Sweetbox links -->
      </div>
    </div>
  </div>
</li>
```

```css
.mega-menu {
  border-radius: 0 0 12px 12px;
  border-top: 3px solid var(--cx-accent);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: megaSlideDown 0.2s ease;
}
@keyframes megaSlideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 3.2 Micro-interactions

Áp dụng thống nhất trên toàn site:

```css
/* Movie card hover */
.movie-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}
.movie-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}

/* Button press feedback */
.btn-cx:active { transform: scale(0.96); }

/* Seat selection */
.seat { transition: background 0.15s ease, transform 0.15s ease; }
.seat.selected { transform: scale(1.1); }
```

Scroll animations (dùng AOS.js):
```html
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script>AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });</script>

<!-- Áp dụng -->
<div data-aos="fade-up" data-aos-delay="100">...</div>
<div data-aos="zoom-in" data-aos-delay="200">...</div>
```

**Quy tắc animation:** `once: true` — hiệu ứng chỉ chạy 1 lần khi scroll tới; KHÔNG lặp.

### 3.3 Dark / Light Mode

```javascript
// CSS Variables approach — không dùng class riêng cho từng element
const STORAGE_KEY = 'cx-theme';

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem(STORAGE_KEY, newTheme);
  updateThemeIcon(newTheme);
}

// Áp dụng theme ngay khi load (tránh flash)
(function() {
  const saved = localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-bs-theme', saved);
})();
```

```css
/* Custom tokens override Bootstrap */
[data-bs-theme="dark"] {
  --cx-bg-card:    #1a1d23;
  --cx-bg-surface: #13161b;
  --cx-text-muted: #8b949e;
}
[data-bs-theme="light"] {
  --cx-bg-card:    #ffffff;
  --cx-bg-surface: #f8f9fa;
  --cx-text-muted: #6c757d;
}
```

---

## 4. Feedback & Form UX

### 4.1 Geolocation — Tìm Rạp Gần Nhất

```javascript
async function findNearbycinemas() {
  const btn = document.querySelector('#btn-find-cinema');
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang định vị...';
  btn.disabled = true;

  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 300000 // Cache 5 phút
      })
    );
    const { latitude, longitude } = position.coords;
    const cinemas = await fetchNearbyCinemas(latitude, longitude, radius = 20); // km
    renderCinemaResults(cinemas);
  } catch (err) {
    // err.code === 1: user từ chối quyền
    // err.code === 2: không lấy được vị trí
    // err.code === 3: timeout
    showLocationError(err.code);
  } finally {
    btn.innerHTML = '📍 Tìm rạp gần tôi';
    btn.disabled = false;
  }
}
```

### 4.2 Trang Lỗi Có Nghệ Thuật

Cấu hình trong `Program.cs` (ASP.NET):
```csharp
app.UseStatusCodePagesWithReExecute("/Error/{0}");
```

| Code | Hình ảnh     | Tiêu đề                        | Hành động               |
|------|-------------|-------------------------------|------------------------|
| 404  | Rạp trống   | "Phòng chiếu này không tồn tại" | Nút "Về trang chủ"    |
| 500  | Phim đứt    | "Kỹ thuật viên đang nối lại phim" | Nút "Thử lại" + Contact |
| 403  | Vé bị chặn  | "Bạn không có quyền vào đây"  | Nút "Đăng nhập"        |

---

## 5. Value-Add Components

### 5.1 Badge Cảnh Báo Nội Dung

```css
.movie-badge {
  position: absolute;
  top: 10px; left: -5px;
  padding: 3px 10px;
  font-size: 0.7rem; font-weight: 700;
  transform: rotate(0deg);
  z-index: 10;
  border-radius: 0 4px 4px 0;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.badge-c13  { background: #ff9800; color: #000; }
.badge-c18  { background: #f44336; color: #fff; }
.badge-now  { background: #4caf50; color: #fff; }
.badge-soon { background: #2196f3; color: #fff; }
```

```html
<div class="position-relative">
  <img src="poster.jpg" class="movie-poster">
  <span class="movie-badge badge-c18">C18</span>
  <span class="movie-badge badge-now" style="top: 35px;">ĐANG CHIẾU</span>
</div>
```

### 5.2 Experience Cards (IMAX / 4DX / Sweetbox)

```css
.experience-card {
  position: relative; overflow: hidden;
  border-radius: 16px; min-height: 200px;
}
.experience-card .overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg,
    rgba(0,0,0,0.7) 0%,
    rgba(var(--cx-accent-rgb), 0.4) 100%);
  display: flex; flex-direction: column;
  justify-content: flex-end; padding: 24px;
}
```

### 5.3 QR Code E-Ticket

Dùng thư viện `qrcode.js` (không cần server):

```html
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
```

```javascript
function generateETicketQR(bookingCode) {
  const qrData = JSON.stringify({
    code: bookingCode,
    ts: Date.now(),
    v: '1'
  });
  QRCode.toCanvas(
    document.querySelector('#qr-canvas'),
    qrData,
    { width: 200, margin: 2, color: { dark: '#000', light: '#fff' } }
  );
}
```

---

## 6. CSS Design Tokens (Biến toàn cục)

Khai báo trong `:root` — KHÔNG hardcode màu trực tiếp trong component:

```css
:root {
  /* Brand */
  --cx-accent:        #e50914;   /* Đỏ CinemaXNet */
  --cx-accent-rgb:    229,9,20;
  --cx-gold:          #FFD700;   /* VIP / Premium */

  /* Spacing */
  --cx-radius-card:   12px;
  --cx-radius-btn:    8px;
  --cx-shadow-card:   0 4px 20px rgba(0,0,0,0.12);
  --cx-shadow-hover:  0 12px 40px rgba(0,0,0,0.25);

  /* Typography scale */
  --cx-text-hero:     clamp(2rem, 4vw, 3.5rem);
  --cx-text-section:  clamp(1.25rem, 2.5vw, 1.75rem);

  /* Transition */
  --cx-transition:    0.25s ease;
}
```

---

## 7. Checklist Trước Khi Merge

Trước khi hoàn thiện bất kỳ component nào, kiểm tra:

- [ ] Sticky Order Summary hiển thị đúng trên màn hình < 768px chưa? (nên collapse thành accordion trên mobile)
- [ ] Dark mode có làm đổ sơ đồ ghế không? (test `data-bs-theme="dark"`)
- [ ] Tất cả nút có `aria-label` chưa? (nhất là nút [+]/[-] bắp nước)
- [ ] Fallback sơ đồ ghế có render được không khi `cinemaData.layout.json === null`?
- [ ] Animation có `prefers-reduced-motion` chưa?
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; }
  }
  ```
- [ ] Geolocation error có hiển thị message thân thiện không (không throw raw error)?
- [ ] QR code có generate thành công ở trang kết quả thanh toán không?

---

## Tham khảo nhanh — Thư viện đã dùng

| Thư viện      | Mục đích                  | CDN / Version          |
|---------------|---------------------------|------------------------|
| Bootstrap 5.3 | Grid, Utilities, Components | `bootstrap@5.3.x`    |
| AOS.js 2.3.1  | Scroll animations          | `aos@2.3.1`           |
| QRCode.js     | Sinh mã QR E-ticket        | `qrcode@1.5.3`        |
| Bootstrap Icons | Icon set nhất quán       | `bootstrap-icons@1.11` |
