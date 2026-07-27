---
name: showtime-picker-modal
description: Dựng Modal (popup) to chọn Ngày → Tỉnh/Thành → Định dạng phim → Rạp/Suất chiếu, mở ra khi bấm nút "ĐẶT VÉ" trên poster phim ở trang chủ. Dùng skill này khi người dùng nhắc tới nút "Đặt vé", "popup chọn suất chiếu", "modal đặt vé", hoặc mô tả bố cục lưới ngày + tab tỉnh + tab định dạng + danh sách rạp/giờ chiếu kiểu CGV. Toàn bộ màu sắc, kích thước, khoảng cách trong skill này được đo trực tiếp từ pixel của ảnh chụp thật do người dùng cung cấp — không phải suy đoán — nên bám sát theo đúng token bên dưới để đạt độ giống 100% với ảnh gốc.
---

# Modal chọn suất chiếu (Showtime Picker Modal)

## 1. Hành vi tương tác

- Ở trang chủ, mỗi poster phim có nút **"ĐẶT VÉ"**. Bấm vào → mở một Modal to (chiếm phần lớn màn hình, có overlay tối phía sau, có nút đóng ở góc).
- Bên trong modal có 4 tầng xếp dọc từ trên xuống, theo đúng thứ tự: **Ngày → Tỉnh/Thành → Định dạng phim → Danh sách Rạp/Suất chiếu**.
- Khi đổi bất kỳ tầng lọc nào (ngày/tỉnh/định dạng), chỉ phần "Danh sách Rạp/Suất chiếu" bên dưới cập nhật lại bằng AJAX — không đóng modal, không load lại trang.
- Ngày mặc định = hôm nay, có viền nổi bật để phân biệt với các ngày khác.
- Tỉnh mặc định = tỉnh gần người dùng nhất (geolocation) hoặc tỉnh đầu tiên có suất chiếu.
- Bấm vào 1 nút giờ chiếu → modal này kết thúc vai trò, chuyển sang bước chọn ghế.

## 2. Bảng màu — đo trực tiếp từ ảnh (pixel-accurate)

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-cream` | `#FDFCF0` | Nền toàn bộ modal |
| `--ink-dark` | `#222222` | Nền pill/tab đang chọn, viền ô ngày đang chọn, đường kẻ phân cách (divider), chữ giờ chiếu trong nút, tên loại phòng |
| `--ink-muted` | `#636363` | Chữ tỉnh/thành chưa chọn, tên rạp (cinema name) |
| `--ink-date-number` | `#6E6E6E` | Số ngày lớn trong ô ngày |
| `--border-btn` | `#CBCABE` | Viền các nút giờ chiếu — xám be nhạt, KHÔNG phải viền đen |
| `--surface-selected-date` | `#FFFFFF` | Nền ô ngày đang chọn (nổi bật hơn nền cream xung quanh) |
| `--text-on-dark` | `#FFFFFF` | Chữ trắng trên pill/tab nền tối |

**Lưu ý quan trọng**: hệ thống này KHÔNG dùng đen tuyệt đối `#000000`. "Màu mực" chính là charcoal `#222222`, kết hợp nền be ấm `#FDFCF0`. Có 2 sắc xám khác nhau cho chữ (`#222222` đậm và `#636363` nhạt hơn) chứ không phải chỉ một màu đen duy nhất — giữ đúng 2 sắc này là chi tiết then chốt để giống ảnh gốc 100%, nhiều người hay làm sai thành đen-trắng thuần túy.

## 3. Cấu trúc & kích thước từng phần

### 3.1 Dải chọn ngày
- Lưới các ô ngày cùng kích thước, tự xuống dòng khi hết chỗ ngang (flex-wrap) — không phải carousel cuộn ngang.
- Mỗi ô gồm 2 phần: cột nhỏ bên trái (2 dòng: tháng "07" / thứ "Sun", ~11-12px, màu `--ink-muted`) + số ngày lớn bên phải (~26-28px, đậm, màu `--ink-date-number`).
- Ô đang chọn: viền `--ink-dark` dày ~1.5-2px, bo góc nhẹ (~4-6px), nền đổi sang `--surface-selected-date` (trắng) để nổi bật giữa nền cream.
- Phạm vi: hôm nay + 29 ngày tiếp theo (tổng 30 ngày).
- Dưới dải ngày: 1 đường kẻ ngang `--ink-dark` mỏng (1px), full-width.

### 3.2 Tab chọn Tỉnh/Thành
- Tỉnh đang chọn: dạng pill, nền `--ink-dark`, chữ `--text-on-dark`, bo góc nhỏ (~4-6px, không tròn hẳn), padding ngang rộng hơn bình thường.
- Các tỉnh còn lại: chữ thường không nền, màu `--ink-muted`, không in đậm.
- Danh sách tự xuống dòng khi hết chiều ngang.
- Dưới tab tỉnh: đường kẻ ngang phân cách như trên.

### 3.3 Tab chọn định dạng phim
- Dạng pill bo tròn rõ (`border-radius` lớn, ~18-20px).
- Đang chọn: nền `--ink-dark`, chữ trắng.
- Chưa chọn: nền cream (trong suốt), viền `--ink-dark` mỏng 1px, chữ `--ink-dark`.
- Nhãn build động theo dữ liệu, ví dụ: "2D Phụ Đề Việt", "IMAX2D Phụ Đề Việt", "4DX2D Phụ Đề Việt".
- Dưới tab định dạng: đường kẻ ngang đậm/rõ hơn 2 đường kẻ phía trên (ngăn cách phần "bộ lọc" và phần "kết quả").

### 3.4 Danh sách Rạp & suất chiếu
Lặp lại cho từng rạp có suất chiếu phù hợp bộ lọc:

1. Tên rạp — đậm, ~18-20px, màu `--ink-muted` (không phải đen tuyệt đối).
2. Tên loại phòng (vd "Rạp 2D", "Rạp LAMOUR") — nhỏ hơn (~14px), màu `--ink-dark`, ngay dưới tên rạp. **Một rạp có thể có nhiều loại phòng** → lặp cặp (tên loại phòng + hàng nút giờ) nhiều lần trong cùng khối rạp trước khi sang rạp tiếp theo.
3. Hàng nút giờ chiếu: hình chữ nhật bo góc nhẹ (~4px), viền `--border-btn`, nền cream, chữ `--ink-dark` đậm, kích thước ~65-75px × ~28-30px, cách nhau ~10-12px, tự xuống dòng khi hết chỗ.
4. Sau mỗi khối rạp: đường kẻ ngang mỏng phân cách với rạp kế tiếp.

## 4. Khung HTML/CSS tham khảo

```html
<div class="showtime-modal">
  <div class="date-strip"><!-- lặp ô ngày --></div>
  <hr class="divider" />
  <div class="province-tabs"><!-- lặp tỉnh --></div>
  <hr class="divider" />
  <div class="format-tabs"><!-- lặp định dạng --></div>
  <hr class="divider divider-strong" />
  <div class="cinema-list">
    <div class="cinema-block">
      <h3 class="cinema-name">CGV Hùng Vương Plaza</h3>
      <div class="room-group">
        <div class="room-label">Rạp 2D</div>
        <div class="time-slots">
          <button class="time-btn">10:20</button>
          <button class="time-btn">13:40</button>
        </div>
      </div>
      <!-- nếu rạp có nhiều loại phòng, lặp thêm .room-group -->
    </div>
    <hr class="divider" />
    <!-- lặp .cinema-block tiếp theo -->
  </div>
</div>
```

```css
.showtime-modal { background: #FDFCF0; }
.divider { border: none; border-top: 1px solid #222222; margin: 16px 0; }
.date-cell.selected { background: #FFFFFF; border: 1.5px solid #222222; border-radius: 4px; }
.province-tab.selected, .format-tab.selected { background: #222222; color: #FFFFFF; border-radius: 6px; }
.format-tab { border-radius: 18px; border: 1px solid #222222; color: #222222; }
.cinema-name { color: #636363; font-weight: 700; }
.room-label { color: #222222; font-size: 14px; }
.time-btn { border: 1px solid #CBCABE; border-radius: 4px; color: #222222; background: transparent; padding: 6px 12px; }
```

## 5. Kết nối với luồng đã thiết kế trước đó

Modal này chính là phần UI cho bước "Chọn suất chiếu" trong luồng Tỉnh → Rạp → Ngày → Suất đã bàn trước đó, chỉ khác:

- Kích hoạt bằng nút **ĐẶT VÉ** ở trang chủ (poster phim) thay vì phải vào trang Detail trước.
- Là Modal, không phải trang riêng → cần 1 AJAX endpoint trả về danh sách rạp/suất theo `(MovieId, Ngày, TỉnhId, Định dạng)` để cập nhật phần 3.4 mà không load lại trang.
- Tận dụng lại `ShowtimeSummary` đã có field `Province` — cần bổ sung thêm field `Format` (2D/IMAX/4DX) và `RoomTypeName` để nhóm đúng như ảnh mẫu.