using System.ComponentModel.DataAnnotations;

namespace CinemaXNet.ViewModels;

public class ProfileEditViewModel
{
    [Display(Name = "Họ và tên")]
    [MaxLength(200)]
    public string? FullName { get; set; }

    [Display(Name = "Số điện thoại")]
    [MaxLength(20)]
    public string? Phone { get; set; }

    [Display(Name = "Ngày sinh")]
    public string? DateOfBirth { get; set; }

    [Display(Name = "Giới tính")]
    public string Gender { get; set; } = "other";

    [Display(Name = "Thành phố")]
    [MaxLength(100)]
    public string? City { get; set; }
}

public class ChangePasswordViewModel
{
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
    [Display(Name = "Mật khẩu hiện tại")]
    public string CurrentPassword { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự.")]
    [Display(Name = "Mật khẩu mới")]
    public string NewPassword { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
    [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [Display(Name = "Xác nhận mật khẩu mới")]
    public string ConfirmPassword { get; set; } = "";

    public string? GeneralError { get; set; }
}

public class ForgotPasswordViewModel
{
    [Required(ErrorMessage = "Vui lòng nhập email.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    [Display(Name = "Email")]
    public string Email { get; set; } = "";
}

public class ResetPasswordViewModel
{
    public string Token { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự.")]
    [Display(Name = "Mật khẩu mới")]
    public string Password { get; set; } = "";

    [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu.")]
    [Compare(nameof(Password), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [Display(Name = "Xác nhận mật khẩu")]
    public string ConfirmPassword { get; set; } = "";

    public string? GeneralError { get; set; }
}
