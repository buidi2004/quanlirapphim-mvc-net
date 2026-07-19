using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.Application.ViewModels;

public class LoginViewModel
{
    [Required(ErrorMessage = "Email hoặc Tên đăng nhập không được để trống.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    public string Password { get; set; } = "";

    public string? GeneralError { get; set; }
}
