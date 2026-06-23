using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.ViewModels;

public class RegisterViewModel
{
    [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3-100 ký tự.")]
    public string Username { get; set; } = "";

    [Required(ErrorMessage = "Email không được để trống.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu ít nhất 6 ký tự.")]
    public string Password { get; set; } = "";

    [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    public string ConfirmPassword { get; set; } = "";

    public string? GeneralError { get; set; }
}
