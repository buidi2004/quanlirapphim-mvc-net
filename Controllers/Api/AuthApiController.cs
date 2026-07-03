using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using CinemaXNet.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/auth")]
public class AuthApiController(IUserService userService, IJwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await userService.AuthenticateAsync(req.Email, req.Password);
        var token = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        var expiry = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd HH:mm:ss");
        
        await userService.SaveRefreshTokenAsync(user.Id, refreshToken, expiry);
        
        return Ok(ApiResponse<object>.Ok(new { token, refreshToken, user = new { user.Id, user.Username, user.Email, user.FullName, user.AvatarUrl } }));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var user = await userService.RegisterAsync(req.Username, req.Email, req.Password);
        var token = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        var expiry = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd HH:mm:ss");
        
        await userService.SaveRefreshTokenAsync(user.Id, refreshToken, expiry);

        return Ok(ApiResponse<object>.Ok(new { token, refreshToken, user = new { user.Id, user.Username, user.Email, user.FullName, user.AvatarUrl } }));
    }
    
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest req)
    {
        var user = await userService.ValidateRefreshTokenAsync(req.RefreshToken);
        var newToken = jwtService.GenerateToken(user);
        var newRefreshToken = jwtService.GenerateRefreshToken();
        var expiry = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd HH:mm:ss");
        
        await userService.SaveRefreshTokenAsync(user.Id, newRefreshToken, expiry);
        
        return Ok(ApiResponse<object>.Ok(new { token = newToken, refreshToken = newRefreshToken }));
    }

    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await userService.GetByIdAsync(userId);
        if (user == null) throw new NotFoundException("User not found");
        return Ok(ApiResponse<object>.Ok(new { user = new { user.Id, user.Username, user.Email, user.FullName, user.Phone, user.Gender, user.DateOfBirth, user.AvatarUrl, user.LoyaltyPoints, user.MemberLevel, user.City } }));
    }

    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await userService.UpdateProfileAsync(userId, req.FullName, req.Phone, req.DateOfBirth, req.Gender, req.City, req.AvatarUrl);
        var user = await userService.GetByIdAsync(userId);
        return Ok(ApiResponse<object>.Ok(new { user = new { user.Id, user.Username, user.Email, user.FullName, user.Phone, user.Gender, user.DateOfBirth, user.AvatarUrl, user.LoyaltyPoints, user.MemberLevel, user.City } }));
    }
    
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await userService.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);
        return Ok(ApiResponse<object>.Ok(new { }, "Đổi mật khẩu thành công"));
    }
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await userService.SaveRefreshTokenAsync(userId, null, null);
        return Ok(ApiResponse<object>.Ok(new { }, "Đăng xuất thành công"));
    }
}

public class LoginRequest { public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class RegisterRequest { public string Username { get; set; } = string.Empty; public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class UpdateProfileRequest { public string FullName { get; set; } = string.Empty; public string Phone { get; set; } = string.Empty; public string DateOfBirth { get; set; } = string.Empty; public string Gender { get; set; } = string.Empty; public string City { get; set; } = string.Empty; public string AvatarUrl { get; set; } = string.Empty; }
public class ChangePasswordRequest { public string CurrentPassword { get; set; } = string.Empty; public string NewPassword { get; set; } = string.Empty; }
public class RefreshTokenRequest { public string RefreshToken { get; set; } = string.Empty; }
