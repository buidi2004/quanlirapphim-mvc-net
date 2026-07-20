using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers;

public class AuthController(IUserService userService) : Controller
{
    // GET /login
    [HttpGet("login")]
    public IActionResult Login(string? returnUrl = null)
    {
        if (User.Identity?.IsAuthenticated == true) return Redirect("/");
        ViewBag.ReturnUrl = returnUrl;
        return View(new LoginViewModel());
    }

    // POST /login
    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel vm, string? returnUrl = null)
    {
        if (!ModelState.IsValid) return View(vm);

        try
        {
            var user = await userService.AuthenticateAsync(vm.Email, vm.Password);
            await SignInUser(user);
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);
            return Redirect("/");
        }
        catch (BusinessException ex)
        {
            vm.GeneralError = ex.Message;
            return View(vm);
        }
    }

    // GET /register
    [HttpGet("register")]
    public IActionResult Register()
    {
        if (User.Identity?.IsAuthenticated == true) return Redirect("/");
        return View(new RegisterViewModel());
    }

    // POST /register
    [HttpPost("register")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        try
        {
            var user = await userService.RegisterAsync(vm.Username, vm.Email, vm.Password);
            await SignInUser(user);
            return Redirect("/");
        }
        catch (BusinessException ex)
        {
            vm.GeneralError = ex.Message;
            return View(vm);
        }
    }

    // POST /logout
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction(nameof(Login));
    }

    // GET /forgot-password
    [HttpGet("forgot-password")]
    public IActionResult ForgotPassword()
    {
        if (User.Identity?.IsAuthenticated == true) return Redirect("/");
        ViewBag.PageTitle = "Quên mật khẩu — CinemaX";
        return View(new ForgotPasswordViewModel());
    }

    // POST /forgot-password
    [HttpPost("forgot-password")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel vm)
    {
        ViewBag.PageTitle = "Quên mật khẩu — CinemaX";
        if (!ModelState.IsValid) return View(vm);

        // Always show success to avoid revealing email existence
        await userService.ForgotPasswordAsync(vm.Email);
        TempData["Success"] = "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư (hoặc file logs/emails.log).";
        return RedirectToAction(nameof(ForgotPassword));
    }

    // GET /reset-password?token=...
    [HttpGet("reset-password")]
    public IActionResult ResetPassword(string? token)
    {
        if (User.Identity?.IsAuthenticated == true) return Redirect("/");
        if (string.IsNullOrEmpty(token))
        {
            TempData["Error"] = "Token không hợp lệ.";
            return RedirectToAction(nameof(ForgotPassword));
        }
        ViewBag.PageTitle = "Đặt lại mật khẩu — CinemaX";
        return View(new ResetPasswordViewModel { Token = token });
    }

    // POST /reset-password
    [HttpPost("reset-password")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ResetPassword(ResetPasswordViewModel vm)
    {
        ViewBag.PageTitle = "Đặt lại mật khẩu — CinemaX";
        if (!ModelState.IsValid) return View(vm);

        try
        {
            await userService.ResetPasswordAsync(vm.Token, vm.Password);
            TempData["Success"] = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.";
            return RedirectToAction(nameof(Login));
        }
        catch (BusinessException ex)
        {
            vm.GeneralError = ex.Message;
            return View(vm);
        }
    }

    // GET /auth/google-login
    [HttpGet("google-login")]
    public IActionResult GoogleLogin(string? returnUrl = null)
    {
        var properties = new AuthenticationProperties { RedirectUri = Url.Action("ExternalLoginCallback", new { returnUrl }) };
        return Challenge(properties, "Google");
    }

    // GET /auth/facebook-login
    [HttpGet("facebook-login")]
    public IActionResult FacebookLogin(string? returnUrl = null)
    {
        var properties = new AuthenticationProperties { RedirectUri = Url.Action("ExternalLoginCallback", new { returnUrl }) };
        return Challenge(properties, "Facebook");
    }

    // GET /auth/external-callback
    [HttpGet("external-callback")]
    public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null)
    {
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (result?.Principal != null)
        {
            var email = result.Principal.FindFirstValue(ClaimTypes.Email);
            var name = result.Principal.FindFirstValue(ClaimTypes.Name);
            if (email != null && name != null)
            {
                try 
                {
                    // Thử đăng ký user mới
                    var randomPassword = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16)) + "A1!";
                    var user = await userService.RegisterAsync(name, email, randomPassword);
                    await SignInUser(user);
                }
                catch
                {
                    // User đã tồn tại → đăng nhập trực tiếp bằng email
                    try
                    {
                        var existingUser = await userService.FindByEmailAsync(email);
                        if (existingUser != null)
                            await SignInUser(existingUser);
                    }
                    catch { /* Nếu vẫn lỗi, redirect về trang chủ */ }
                }
            }
        }
        if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            return Redirect(returnUrl);
        return Redirect("/");
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private async Task SignInUser(CinemaXNet.Domain.Entities.User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
        };
        var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal,
            new AuthenticationProperties { IsPersistent = false });
    }
}
