using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.Application.ViewModels;

// LoginViewModel: Model hứng dữ liệu từ Form Đăng Nhập
public class LoginViewModel
{
    // [Required]: Đảm bảo người dùng không bỏ trống ô Email / Tên đăng nhập
    [Required(ErrorMessage = "Email hoặc Tên đăng nhập không được để trống.")]
    public string Email { get; set; } = "";

    // [Required]: Đảm bảo người dùng không bỏ trống ô Mật khẩu
    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    public string Password { get; set; } = "";

    // Chứa thông báo lỗi từ Server (ví dụ: Sai email hoặc mật khẩu không đúng)
    public string? GeneralError { get; set; }
}
