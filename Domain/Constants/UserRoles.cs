namespace CinemaXNet.Domain.Constants;

// UserRoles: Định nghĩa các Hằng số về Vai trò (Phân quyền người dùng)
public static class UserRoles
{
    public const string Admin = "admin"; // Quản trị viên hệ thống (Có full quyền truy cập trang Admin)
    public const string User  = "user";  // Khách hàng thông thường (Quyền đặt vé, xem lịch sử)
}
