using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.ViewModels;

public class LoginViewModel
{
    [Required(ErrorMessage = "Email không được để trống.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    public string Password { get; set; } = "";

    public string? GeneralError { get; set; }
}
