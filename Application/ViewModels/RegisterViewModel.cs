using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.Application.ViewModels;

// RegisterViewModel: Model hứng dữ liệu từ Form Đăng Ký Tài Khoản mới
// Sử dụng DataAnnotations để Validate tự động cả ở phía Server lẫn Client (jQuery Validation)
public class RegisterViewModel
{
    // [Required]: Bắt buộc nhập, không được để trống
    // [StringLength]: Quy định độ dài chuỗi hợp lệ từ 3 đến 100 ký tự
    [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3-100 ký tự.")]
    public string Username { get; set; } = "";

    // [EmailAddress]: Tự động kiểm tra định dạng email chuẩn (phải có ký tự @ và tên miền)
    [Required(ErrorMessage = "Email không được để trống.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    public string Email { get; set; } = "";

    // Mật khẩu bắt buộc từ 6 ký tự trở lên
    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu ít nhất 6 ký tự.")]
    public string Password { get; set; } = "";

    // [Compare("Password")]: So sánh giá trị với trường Password xem người dùng nhập lại mật khẩu có khớp hay không
    [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    public string ConfirmPassword { get; set; } = "";

    // Chứa thông báo lỗi tổng quan từ Server (ví dụ: Email này đã được sử dụng)
    public string? GeneralError { get; set; }
}
