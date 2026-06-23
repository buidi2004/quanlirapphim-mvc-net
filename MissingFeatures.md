# Phân tích các Màn hình và Tính năng còn thiếu của CinemaXNet

Sau khi đối chiếu cấu trúc hiện tại của dự án **CinemaXNet** với các nền tảng đặt vé xem phim hiện đại trên thị trường (như CGV, Lotte Cinema, Galaxy Cinema, Fandango...), dưới đây là danh sách các màn hình (Screens) và tính năng (Features) UX/UI mà hệ thống của bạn hiện đang thiếu hoặc có thể bổ sung để nâng cấp trải nghiệm người dùng:

---

## 1. Các Tính năng & Màn hình phía Khách hàng (User/Frontend)

### 1.1. Luồng đặt vé (Booking Flow)
*   **Widget Đặt vé nhanh (Quick Booking Widget):**
    *   *Tính năng:* Một module thả xuống (dropdown) hoặc thanh công cụ gắn cố định trên Trang chủ cho phép người dùng chọn nhanh: `Phim` -> `Rạp` -> `Ngày` -> `Suất chiếu` và nhảy thẳng tới trang chọn ghế.
    *   *Màn hình thiếu:* Component Widget Đặt vé nhanh ở Trang chủ hoặc Header.
*   **Mua vé không cần đăng nhập (Guest Checkout):**
    *   *Tính năng:* Cho phép khách hàng mua vé chỉ bằng cách nhập Email và Số điện thoại mà không bắt buộc phải tạo tài khoản. (Hữu ích để tăng tỉ lệ chuyển đổi).
*   **Đếm ngược thời gian giữ ghế (Booking Timer UI):**
    *   *Tính năng:* Mặc dù BE của bạn đã có `HoldExpiryBackgroundService`, nhưng phía FE cần hiển thị một đồng hồ đếm ngược (VD: 10:00 phút) ở góc màn hình khi người dùng đang ở bước Thanh toán, cảnh báo họ ghế sẽ bị hủy nếu không thanh toán kịp.
*   **Áp dụng Mã giảm giá / Voucher:**
    *   *Tính năng:* Ô nhập mã khuyến mãi (Promo Code) hoặc chọn Voucher có sẵn trong ví ở màn hình `Payment/Index` trước khi chốt tổng tiền.

### 1.2. Trải nghiệm người dùng (UX) & Tương tác
*   **Đăng nhập Mạng xã hội (Social Login):**
    *   *Tính năng:* Nút "Đăng nhập bằng Google / Facebook / Apple" trên màn hình `Auth/Login` và `Auth/Register` để giảm bớt sự phiền hà khi phải nhớ mật khẩu.
*   **Chế độ Tối/Sáng (Dark Mode / Light Mode):**
    *   *Tính năng:* Các trang web rạp chiếu phim thường chuộng giao diện tối (Dark Theme) để tôn lên poster phim. Nút toggle chuyển đổi giao diện sẽ là một điểm cộng lớn về UI.
*   **Đa ngôn ngữ (i18n - Đổi ngôn ngữ EN/VI):**
    *   *Tính năng:* Nút cờ Việt Nam / Anh trên Navbar để chuyển đổi ngôn ngữ toàn trang.
*   **Modal xem Trailer (Video Pop-up):**
    *   *Tính năng:* Khi người dùng bấm "Xem Trailer" ở Trang chủ, video YouTube nên hiện lên ở một cửa sổ nổi (Modal/Lightbox) nền đen thay vì chuyển hướng sang trang khác hoặc nhúng thẳng làm vỡ layout.

### 1.3. Hồ sơ & Thành viên (Loyalty & Profile)
*   **Chương trình Thành viên & Điểm thưởng (Loyalty Program):**
    *   *Tính năng:* Hệ thống tích điểm, phân hạng thành viên (Thành viên Thường, VIP, VVIP). 
    *   *Màn hình thiếu:* Màn hình `Profile/RewardPoints` hiển thị thẻ thành viên dạng Barcode/QR Code ảo để quét khi ra quầy, lịch sử tích/tiêu điểm và danh sách quà tặng quy đổi.
*   **Đánh giá & Bình luận Phim (User Reviews & Ratings):**
    *   *Tính năng:* Dù BE đã có `Admin/Reviews`, nhưng FE cần có UI để người dùng đã xem phim có thể rate (1-5 sao) và viết bình luận ngay dưới màn hình `Movie/Detail`.

---

## 2. Các Tính năng & Màn hình phía Quản trị (Admin/Backend)

*   **Phân quyền chi tiết (Role-Based Access Control - RBAC):**
    *   *Tính năng:* Admin panel hiện tại có vẻ dùng chung, cần chia quyền rõ ràng: `Super Admin` (toàn quyền), `Cinema Manager` (chỉ quản lý rạp của họ), `Ticket Staff` (chỉ soát vé/bán vé tại quầy).
*   **Màn hình Bán vé tại quầy (POS - Point of Sale):**
    *   *Màn hình thiếu:* Một giao diện riêng cho nhân viên rạp (gọn gàng, thao tác nhanh bằng phím tắt/máy quét) để bán vé trực tiếp cho khách walk-in (không phải giao diện Admin phức tạp, cũng không phải giao diện Web cho user).
*   **Quét mã vạch Check-in (Ticket Scanner):**
    *   *Tính năng:* Tính năng (hoặc màn hình web app trên di động) cho nhân viên soát vé dùng camera quét QR Code trên vé của khách để chuyển trạng thái vé thành "Đã sử dụng".
*   **Export Dữ liệu ra Excel/PDF (Audit & Export):**
    *   *Tính năng:* Trong màn hình `Admin/Reports`, thêm nút xuất báo cáo doanh thu ra file Excel (.xlsx) hoặc CSV để kế toán dễ làm việc.

---

## 💡 Tổng kết
Dự án của bạn đã bao phủ tốt luồng cốt lõi (Core Flow: Đăng nhập -> Chọn Phim -> Đặt Ghế -> Thanh Toán -> Quản trị). Để đạt tiêu chuẩn của một trang web bán vé chuyên nghiệp thực tế, bạn nên ưu tiên bổ sung: **Đăng nhập Social, Widget Đặt vé nhanh, Đồng hồ đếm ngược giữ ghế, và Tính năng áp dụng Mã giảm giá.**
