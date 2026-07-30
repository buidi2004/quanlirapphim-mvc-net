# Hướng Dẫn Chạy Dự Án Bằng Docker (One-Click)

Tài liệu này hướng dẫn bạn cách bật/tắt toàn bộ hệ sinh thái của dự án (bao gồm **Backend .NET**, **Cơ sở dữ liệu MySQL**, và **Ứng dụng Mobile Expo**) chỉ bằng các câu lệnh cực kỳ đơn giản.

---

## 🟢 1. CÁCH CHẠY DỰ ÁN (Bật dự án)

Để khởi động dự án tối ưu RAM (chỉ chạy **Backend .NET** và **Database MySQL**), bạn chạy lệnh:

```bash
./start-dev.sh
```

**Lệnh mặc định này sẽ làm gì?**

- Bật Database (MySQL).
- Bật Backend (.NET Web App).
- **Tối ưu RAM:** Không bật container Mobile Expo (giúp máy chạy mượt hơn).

---

### 📱 Muốn chạy thêm App Mobile (Expo)?

Nếu bạn cần test cả app Mobile Expo, hãy truyền thêm tham số `mobile`:

```bash
./start-dev.sh mobile
```

Để xem mã QR code cho điện thoại quét:

```bash
docker compose attach mobile
```

*(Bấm `Ctrl + C` để thoát khỏi màn hình xem mã QR/log này).*

---

## 🔴 2. CÁCH TẮT TẤT CẢ (Dừng dự án)

Khi làm việc xong, để giải phóng RAM và tắt toàn bộ dự án an toàn, bạn gõ lệnh sau:

```bash
docker compose down
```

**Lệnh này sẽ làm gì?**

- Tắt sạch sẽ một cách an toàn cả 3 container: `web`, `db`, và `mobile`.
- Xóa các mạng ảo tạm thời được tạo ra.
- **Yên tâm:** Dữ liệu trong Database sẽ **KHÔNG** bị mất (vì đã được lưu trữ an toàn trong ổ đĩa ảo `mysql_data`).

---

## 🛠️ Một Số Lệnh Hữu Ích Khác

- **Xem toàn bộ các container đang chạy:**
  ```bash
  docker ps
  ```
- **Xem bảng điều khiển tài nguyên (RAM/CPU đang tiêu thụ):**
  ```bash
  docker stats
  ```
- **Xem log của Backend (.NET):**
  ```bash
  docker compose logs -f web
  ```
- **Xem log của Database (MySQL):**
  ```bash
  docker compose logs -f db
  ```

---

## 🚀 Mẹo Tối Ưu Hóa RAM (Chống tràn RAM)

Mặc định Docker và WSL2 trên Windows có thể "ăn" rất nhiều RAM. Dự án đã được thiết lập giới hạn RAM an toàn trong `docker-compose.yml`, tuy nhiên bạn nên làm thêm bước sau để giới hạn RAM cho WSL2 không bị tràn:

1. Nhấn `Windows + R`, gõ `%userprofile%` và nhấn Enter.
2. Tạo một file tên là `.wslconfig` (nhớ có dấu chấm ở đầu).
3. Mở file đó bằng Notepad và dán nội dung sau vào:
   ```ini
   [wsl2]
   memory=4GB
   processors=2
   ```
4. Lưu lại, mở PowerShell (quyền Admin) và gõ `wsl --shutdown`. Lần sau khi bạn mở Docker, nó sẽ chạy cực kỳ mượt mà và không bao giờ ngốn quá 4GB RAM!
