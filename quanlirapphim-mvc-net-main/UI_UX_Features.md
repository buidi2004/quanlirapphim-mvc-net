# Tài liệu tính năng UX/UI và Cấu trúc màn hình (Frontend)

Dự án **CinemaXNet** sở hữu hệ thống Frontend được xây dựng bằng Razor Pages (`.cshtml`), kết hợp CSS/JS thuần và các thư viện bên thứ 3 (Bootstrap, jQuery) trong cấu trúc ASP.NET Core MVC Monolith. 

Dưới đây là chi tiết các tính năng UX/UI, logic Frontend và danh sách các màn hình (Screens).

---

## 1. Danh sách các màn hình (Screens)

Các màn hình được chia thành 2 khu vực chính: **Khu vực Khách hàng (User/Public)** và **Khu vực Quản trị (Admin)**.

### 1.1. Khu vực Khách hàng (User/Public Face)
Sử dụng chung bộ khung giao diện `Shared/_Layout.cshtml` (gồm `_Navbar.cshtml` và `_Footer.cshtml`).

*   **Trang chủ (Home):**
    *   `Home/Index.cshtml`: Trang chủ chính, hiển thị banner slider (Carousel), danh sách phim đang chiếu, phim sắp chiếu, tin tức và khuyến mãi nổi bật.
*   **Phim và Rạp (Movies & Cinemas):**
    *   `Movie/Index.cshtml`: Trang danh sách toàn bộ phim.
    *   `Movie/Detail.cshtml`: Trang chi tiết một bộ phim (trailer, tóm tắt, diễn viên, lịch chiếu theo rạp và ngày).
    *   `Cinema/Index.cshtml`: Trang danh sách cụm rạp và thông tin các rạp chiếu.
*   **Xác thực và Tài khoản (Auth & Profile):**
    *   `Auth/Login.cshtml`: Giao diện đăng nhập.
    *   `Auth/Register.cshtml`: Giao diện đăng ký tài khoản mới.
    *   `Auth/ForgotPassword.cshtml` & `Auth/ResetPassword.cshtml`: Luồng quên và khôi phục mật khẩu.
    *   `Profile/Index.cshtml`: Bảng điều khiển tài khoản người dùng cá nhân.
    *   `Profile/Edit.cshtml`: Cập nhật thông tin cá nhân.
    *   `Profile/ChangePassword.cshtml`: Đổi mật khẩu.
    *   `Profile/Transactions.cshtml`: Lịch sử giao dịch, nạp tiền hoặc chi tiêu.
    *   `Movie/MyTickets.cshtml` & `Movie/TicketDetail.cshtml`: Danh sách vé đã mua và chi tiết mã vé (QR Code/Barcode).
*   **Luồng đặt vé & Thanh toán (Booking Flow):**
    *   `Booking/SeatMap.cshtml` (sử dụng component `Shared/_SeatMap.cshtml`): Màn hình hiển thị sơ đồ phòng chiếu và chọn ghế.
    *   `Concession/Index.cshtml` (ước chừng): Màn hình chọn thêm bắp, nước (đồ ăn nhanh).
    *   `Payment/Index.cshtml`: Màn hình kiểm tra lại đơn hàng (hóa đơn) và chọn phương thức thanh toán.
    *   `Payment/Success.cshtml`: Màn hình cảm ơn và xác nhận thanh toán thành công.

### 1.2. Khu vực Quản trị (Admin Dashboard)
Sử dụng bộ khung giao diện riêng `Shared/_AdminLayout.cshtml`.

*   **Dashboard:** `Admin/Dashboard.cshtml` (Thống kê tổng quan số liệu doanh thu, vé bán ra, user đăng ký).
*   **Quản lý Hệ thống Rạp:** `Admin/Cinemas`, `Admin/Rooms` (Quản lý cụm rạp và phòng chiếu với sơ đồ ghế).
*   **Quản lý Phim & Lịch chiếu:** `Admin/Movies`, `Admin/Showtimes` (Thêm sửa xóa phim, gán lịch chiếu vào phòng chiếu).
*   **Quản lý Vé & Dịch vụ:** `Admin/Tickets`, `Admin/FoodBeverages` (Quản lý các loại vé, bắp nước, giá cả).
*   **Quản lý Marketing:** `Admin/Promotions`, `Admin/News` (Các chương trình khuyến mãi, bài viết tin tức).
*   **Quản lý Tương tác & Người dùng:** `Admin/Users`, `Admin/Reviews`, `Admin/Contacts` (Quản lý tài khoản khách, xử lý feedback và form liên hệ).
*   **Quản lý Hệ thống & Báo cáo:** `Admin/Reports`, `Admin/Settings` (Báo cáo doanh thu chi tiết, cài đặt tham số hệ thống).

---

## 2. Tính năng UX/UI (User Experience & User Interface)

Các tính năng này được thiết kế để mang lại trải nghiệm mượt mà, trực quan và tăng tỉ lệ chuyển đổi (Conversion Rate) cho quy trình mua vé.

*   **Multi-step Booking Flow (Luồng đặt vé theo bước):** 
    *   UX được chia nhỏ thành các bước rõ ràng: `Chọn phim/suất chiếu` -> `Chọn ghế ngồi` -> `Chọn bắp nước` -> `Thanh toán`. Giúp người dùng không bị ngợp thông tin.
*   **Interactive Seat Map (Sơ đồ ghế ngồi động):**
    *   Render bằng `_SeatMap.cshtml`. Ghế được phân màu rõ ràng (Ghế trống, Ghế đang chọn, Ghế đã bán, Ghế VIP/Thường, Ghế đôi).
    *   Click để chọn/bỏ chọn, tổng tiền được tính toán và hiển thị realtime bằng Javascript bên dưới.
*   **Client-Side Validation (Kiểm tra dữ liệu tức thời):**
    *   Thông qua `_ValidationScriptsPartial.cshtml`, mọi form (đăng nhập, đăng ký, đổi mật khẩu) đều được kiểm tra tính hợp lệ trước khi gửi lên Server, giúp tránh load lại trang không cần thiết và thông báo lỗi ngay tại input đó.
*   **Flash Messages (Thông báo hệ thống):**
    *   Component `_FlashMessage.cshtml` hiển thị các thông báo dạng Toast hoặc Alert ngắn gọn (Ví dụ: "Đăng nhập thành công", "Đã thêm vào giỏ hàng", "Ghế này đã có người đặt") rồi tự động biến mất.
*   **Responsive Design (Tương thích mọi thiết bị):**
    *   Giao diện được thiết kế để tự động co giãn lưới (Grid) hoàn hảo cho Điện thoại (Mobile), Máy tính bảng (Tablet) và Desktop. Navbar tự động chuyển sang Hamburger Menu trên thiết bị di động.
*   **Trải nghiệm Admin tối ưu (Admin UX):**
    *   Sidebar điều hướng ở bên trái, dễ gập mở.
    *   Sử dụng DataTables (hoặc các bảng lưới tương tự) để hiển thị danh sách lớn, có phân trang (pagination), tìm kiếm (search), và lọc dữ liệu (filter) mà không cần load lại toàn bộ trang.

## 3. Kiến trúc Frontend (FE)

Dù là Monolith nhưng FE vẫn được tách biệt tốt bằng các kỹ thuật của ASP.NET Core:
1.  **Partial Views (`_xyz.cshtml`):** Tái sử dụng các đoạn code HTML (ví dụ sơ đồ ghế, navbar, footer) ở nhiều trang khác nhau.
2.  **ViewComponents (nếu có):** Xử lý các logic hiển thị phức tạp độc lập với Controller chính (ví dụ widget danh sách phim top trending bên cột phải).
3.  **Thư mục `wwwroot`:** Nơi chứa toàn bộ Public Assets.
    *   `/js`: File logic xử lý DOM, Gọi API bất đồng bộ (AJAX) để cập nhật giỏ hàng hoặc check trạng thái ghế realtime.
    *   `/css`: Các tệp định dạng stylesheet tùy chỉnh đè lên thư viện gốc.
    *   `/lib`: Quản lý các thư viện NPM/Bower đã được build sẵn (như Bootstrap, jQuery).
