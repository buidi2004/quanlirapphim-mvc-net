# CinemaX - Tài liệu Tổng hợp Kiến trúc Backend

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc hệ thống, cấu trúc mã nguồn, và các luồng xử lý nghiệp vụ cốt lõi của dự án **CinemaX**.

---

## 1. Công nghệ sử dụng (Tech Stack)

- **Framework:** ASP.NET Core MVC (.NET 8 / 10).
- **Ngôn ngữ:** C# (hỗ trợ các tính năng mới như Primary Constructors).
- **Cơ sở dữ liệu:** SQLite (Gọn nhẹ, được cấu hình bật chế độ `WAL` và Foreign Key enforcement).
- **ORM:** Dapper (Micro-ORM hiệu năng cao, viết SQL truy vấn trực tiếp).
- **Authentication:** ASP.NET Core Cookie Authentication (Hỗ trợ Role-based: `admin`, `cinema_manager`, `staff`, `user`).
- **Dependency Injection (DI):** Tích hợp sẵn của ASP.NET Core (`IServiceCollection`).
- **Background Tasks:** Sử dụng `IHostedService` / `BackgroundService`.

---

## 2. Kiến trúc & Cấu trúc Thư mục

Hệ thống được thiết kế theo mô hình **N-Tier Architecture (Kiến trúc đa tầng)** với Repository Pattern và Service Layer.

- `Controllers/`: Nơi tiếp nhận Request từ người dùng (Web & Admin), điều hướng logic và trả về Views hoặc JSON.
- `Models/`
  - `Domain/`: Chứa các POCO classes (Thực thể) ánh xạ 1-1 với các bảng trong cơ sở dữ liệu.
  - `Repository/`: Chứa các Interface (`IRepository`) và Implementations (`Repository`) sử dụng Dapper để tương tác trực tiếp với Database.
  - `Services/`: Chứa các Business Logic Layer (BLL). Đây là nơi các quy tắc nghiệp vụ phức tạp được thực thi, gọi một hoặc nhiều Repositories.
- `ViewModels/`: Chứa các Data Transfer Objects (DTO) dùng để giao tiếp dữ liệu giữa Controller và Views (Đầu vào form & Đầu ra hiển thị).
- `Services/`: Chứa các Background Services chạy ngầm (`HoldExpiryBackgroundService`, `MarketingBackgroundService`).
- `Data/`: Chứa `DatabaseInitializer.cs` phụ trách tạo Schema và Seed dữ liệu ban đầu.

---

## 3. Các Luồng Nghiệp vụ (Business Flows) Quan Trọng

### 3.1. Luồng Đặt vé & Giữ chỗ (Booking & Concurrency)
- **Cơ chế giữ chỗ:** Khi người dùng chọn ghế, hệ thống tạo bản ghi vé với trạng thái `holding` và gắn `HoldExpiryTime` (ví dụ 15 phút). Ghế này sẽ bị khóa với các người dùng khác.
- **Xử lý tranh chấp (Concurrency):** Sử dụng cơ chế **Optimistic Concurrency Control** thông qua trường `version` trong bảng `tickets`. Nếu 2 người cùng submit mua 1 ghế, ai query update `version` khớp trước sẽ thắng, người sau sẽ nhận lỗi.
- **Dọn dẹp ghế hết hạn:** `HoldExpiryBackgroundService` chạy ngầm mỗi 1 phút để tự động hủy các vé `holding` đã quá hạn.

### 3.2. Luồng Thanh toán & CRM (Loyalty)
Xử lý tập trung tại `TicketService.ConfirmPaymentAsync` sử dụng **Database Transaction** để đảm bảo tính toàn vẹn (ACID):
1. Đổi trạng thái vé sang `paid`.
2. Kiểm tra nếu có mã khuyến mãi (`promotion_code`), ghi nhận số lượt dùng.
3. Cộng dồn số tiền vào `total_spent` và quy đổi ra `loyalty_points` (Ví dụ 1,000 VND = 1 điểm).
4. Đánh giá lại tổng chi tiêu để tự động nâng `member_level` cho User (Bronze ➔ Silver ➔ Gold ➔ Diamond).

### 3.3. Luồng Định giá Động (Dynamic Pricing)
- `DynamicPricingService` chịu trách nhiệm can thiệp vào quá trình lấy giá vé.
- Giá được tự động điều chỉnh (+/- tiền mặt hoặc %) dựa trên **Khung giờ chiếu** (`TimeOfDay`) hoặc **Ngày trong tuần** (`DayOfWeek`).
- Logic này được gọi đồng nhất tại cả màn hình hiển thị danh sách, sơ đồ rạp và lúc checkout để đảm bảo giá chính xác.

### 3.4. Luồng Marketing Automation
- `MarketingBackgroundService` chạy ngầm mỗi phút.
- Quét các chiến dịch marketing có trạng thái `Scheduled` và đến giờ.
- Truy xuất tập khách hàng (Tất cả, VIP, Inactive), mô phỏng việc gửi Email/SMS, đếm số lượng gửi và chuyển trạng thái sang `Sent`.

---

## 4. Thiết kế Database Schema (Core Tables)

1. **Người Dùng (Users):** Quản lý thông tin, vai trò, bảo mật, và điểm thành viên.
2. **Cụm Rạp (Cinemas) & Phòng Chiếu (Rooms):** Thiết kế mạng lưới rạp chiếu, `rooms` chứa `layout_json` (bản đồ ghế ngồi).
3. **Phim (Movies) & Suất Chiếu (Showtimes):** Lịch chiếu gắn với Rạp và Phim.
4. **Đơn Vé (Tickets):** Bảng quan trọng nhất, liên kết User, Showtime và giữ trạng thái thanh toán.
5. **Cấu hình Nâng cao:** 
   - `promotions` (Khuyến mãi thẻ)
   - `membership_tiers` (Hạng thẻ CRM)
   - `pricing_rules` (Luật giá tự động)
   - `marketing_campaigns` (Chiến dịch thông báo ngầm)
   - `audit_logs` (Nhật ký thao tác hệ thống)

---

## 5. Tiêu chuẩn Mã nguồn & Bảo mật

- **Ngăn chặn SQL Injection:** 100% truy vấn qua Dapper sử dụng Parameterized Queries (`@ParamName`).
- **Bảo mật Mật khẩu:** Băm mật khẩu (Hashing) bằng thuật toán **BCrypt** (`BCrypt.Net-Next`).
- **CSRF Protection:** Các form POST đều yêu cầu `@Html.AntiForgeryToken()` và validation `[ValidateAntiForgeryToken]` tại Controller.
- **XSS Prevention:** Views được render thông qua Razor Engine tự động encode HTML.

---

*Tài liệu này phản ánh kiến trúc của CinemaX tính đến thời điểm hoàn tất Phase 4.*
