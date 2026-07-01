# Cấu trúc chức năng dự án CinemaXNet

Dự án **CinemaXNet** được xây dựng theo kiến trúc **Monolith** sử dụng **ASP.NET Core MVC** (C#). Dữ liệu được lưu trữ thông qua cơ sở dữ liệu SQLite (`cinema_db.db`) và có khả năng sử dụng Dapper hoặc ADO.NET thuần (dựa trên các `TypeHandler` tự định nghĩa).

Dưới đây là tài liệu tổng quan về toàn bộ cấu trúc chức năng của phần Backend (BE) và Frontend (FE).

---

## 1. Backend (BE) - Cấu trúc thư mục & Chức năng

Backend được tổ chức theo mô hình Layered Architecture bao gồm Controller, Service (Business Logic), Repository (Data Access) và Domain Models.

### 1.1. Controllers (`/Controllers`)
Lớp điều hướng và xử lý HTTP Request, chia làm 2 phần chính:
*   **Admin (Quản trị viên):** 
    *   `AdminCinemasController`, `AdminRoomsController`: Quản lý cụm rạp và phòng chiếu.
    *   `AdminMoviesController` (nếu có), `AdminShowtimesController`: Quản lý phim và lịch chiếu.
    *   `AdminTicketsController`, `AdminUsersController`: Quản lý vé và người dùng.
    *   `AdminFoodBeveragesController`: Quản lý đồ ăn/thức uống.
    *   `AdminPromotionsController`: Quản lý các chương trình khuyến mãi.
    *   `AdminReportsController`: Báo cáo thống kê.
    *   `AdminNewsController`, `AdminReviewsController`, `AdminContactsController`, `AdminSettingsController`: Quản lý tin tức, đánh giá, liên hệ và cài đặt hệ thống.
*   **Public/User (Khách hàng & Người dùng):**
    *   `HomeController`: Trang chủ.
    *   `AuthController`, `ProfileController`: Đăng nhập, đăng ký, và quản lý hồ sơ người dùng.
    *   `CinemaController`, `MovieController`: Hiển thị thông tin hệ thống rạp và danh sách/chi tiết phim.
    *   `BookingController`, `TicketController`, `PaymentController`: Luồng đặt vé, chọn ghế, hiển thị vé và thanh toán.
    *   `ConcessionController`: Mua thêm đồ ăn/thức uống khi đặt vé.
    *   `PromotionController`, `NewsController`, `ReviewsController`, `ContactController`, `ExperienceController`, `PageController`, `SearchController`: Các chức năng tương tác và thông tin phụ trợ.

### 1.2. Domain Models (`/Models/Domain`)
Các thực thể lõi (Entities) map trực tiếp với các bảng trong Database:
*   `Cinema.cs`, `Room.cs`: Rạp chiếu và Phòng chiếu.
*   `Movie.cs`: Phim.
*   `Showtime.cs`: Lịch chiếu phim.
*   `Ticket.cs`: Vé máy/Vé đã đặt.
*   `User.cs`: Người dùng.
*   `Promotion.cs`: Khuyến mãi.
*   `Review.cs`: Đánh giá phản hồi.

### 1.3. Repositories (`/Models/Repository`)
Lớp giao tiếp với Database (Data Access Layer), cung cấp các Interfaces và Implementations tương ứng để thực hiện các thao tác CRUD:
*   `ICinemaRepository`, `IMovieRepository`, `IShowtimeRepository`, `ITicketRepository`, `IUserRepository`, `IPromotionRepository`, `IReviewRepository`.

### 1.4. Services (`/Models/Services` & `/Services`)
*   **Business Logic Services (`/Models/Services`):** Xử lý logic nghiệp vụ, nằm giữa Controllers và Repositories.
    *   `ICinemaService`, `IMovieService`, `ITicketService`, `IUserService`, `IPaymentService`, `IPromotionService`.
*   **Background Services (`/Services`):** Các tiến trình chạy ngầm.
    *   `HoldExpiryBackgroundService`: Background Job (có thể dùng để đếm ngược, hủy ghế tạm giữ nếu người dùng không thanh toán sau khoảng thời gian nhất định).

### 1.5. ViewModels (`/ViewModels`)
Các class DTO (Data Transfer Object) dùng để vận chuyển dữ liệu giữa Controllers và Views một cách an toàn và gọn nhẹ:
*   `LoginViewModel`, `RegisterViewModel`, `ProfileViewModels`: Liên quan tới xác thực.
*   `MovieDetailViewModel`, `SeatMapViewModel`, `TicketDetailViewModel`, `BookingConfirmViewModel`: Hiển thị chi tiết phim và luồng đặt vé.
*   `DashboardStats`: Thống kê cho Admin dashboard.
*   `MiscViewModels`: Các models phụ trợ khác.

### 1.6. Data Access & Core (`/Data` & `/Core`)
*   **Data:** 
    *   `DatabaseInitializer.cs`: Khởi tạo và seed dữ liệu ban đầu cho DB.
    *   `DateOnlyTypeHandler.cs`, `TimeOnlyTypeHandler.cs`: Custom Handlers xử lý kiểu dữ liệu ngày/giờ (Dapper).
*   **Core:** Chứa các thành phần chung như `Exceptions` (xử lý lỗi) và `ValueObjects`.

---

## 2. Frontend (FE) - Cấu trúc thư mục & Chức năng

Do là kiến trúc Monolith MVC, Frontend được xây dựng trực tiếp bên trong project thông qua cơ chế Razor Views (`.cshtml`) kết hợp với các tài nguyên tĩnh (`wwwroot`).

### 2.1. Views (`/Views`)
Giao diện người dùng (UI) được render từ phía Server, nhóm theo từng chức năng (Controllers):
*   **Admin:** `/Views/Admin` (Chứa toàn bộ các trang quản trị).
*   **Auth:** `/Views/Auth` (Trang Login/Register).
*   **Booking & Payment:** `/Views/Booking`, `/Views/Payment`, `/Views/Concession` (Giao diện chọn suất chiếu, chọn ghế, chọn đồ ăn, thanh toán).
*   **Main Flow:** `/Views/Home`, `/Views/Movie`, `/Views/Cinema`, `/Views/Promotion` (Giao diện hiển thị trang chủ, danh sách phim, chi tiết phim, rạp chiếu, khuyến mãi).
*   **User Area:** `/Views/Profile` (Thông tin cá nhân, lịch sử giao dịch).
*   **Shared:** `/Views/Shared` (Chứa các components dùng chung như Layout header, footer, sidebar, pagination, v.v.).

### 2.2. Static Assets (`/wwwroot`)
Thư mục phục vụ các file tĩnh cho trình duyệt tải về:
*   `/css`: Các file định dạng CSS cho ứng dụng.
*   `/js`: Các file mã script Javascript (xử lý client-side logic, ví dụ: chọn ghế realtime, validate form).
*   `/assets`: Lưu trữ hình ảnh tĩnh (ảnh phim, banner, icon).
*   `/lib`: Chứa các thư viện bên thứ 3 (Bootstrap, jQuery, FontAwesome,...).

---

## Tóm tắt luồng hoạt động (Workflow)

1. **Người dùng (FE)** gửi HTTP Request thông qua giao diện Razor (Views).
2. **Controller (BE)** tiếp nhận Request, thực hiện validate ban đầu qua `ViewModels`.
3. Controller gọi xuống **Service (BLL)** để thực hiện các quy tắc và nghiệp vụ logic.
4. Service gọi xuống **Repository (DAL)** để lấy/cập nhật dữ liệu vào **Database (SQLite)**.
5. Service trả kết quả lại cho Controller, Controller binding dữ liệu vào `ViewModels` và trả về `Views` cho người dùng.
