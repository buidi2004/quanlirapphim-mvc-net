using System.Security.Claims;
using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/auth")]
public class ApiAuthController(IUserService userService, IJwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Email và mật khẩu không được để trống." });

        try
        {
            var user = await userService.AuthenticateAsync(request.Email, request.Password);
            var token = jwtService.GenerateToken(user);

            return Ok(new
            {
                success = true,
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    fullName = user.FullName,
                    phone = user.Phone,
                    avatarUrl = user.GetAvatarUrl(),
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    city = user.City,
                    memberLevel = user.MemberLevel,
                    loyaltyPoints = user.LoyaltyPoints,
                    totalSpent = user.TotalSpent
                }
            });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Username, email và mật khẩu không được để trống." });

        try
        {
            var user = await userService.RegisterAsync(request.Username, request.Email, request.Password);
            var token = jwtService.GenerateToken(user);

            return Ok(new
            {
                success = true,
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    avatarUrl = user.GetAvatarUrl(),
                    memberLevel = user.MemberLevel,
                    loyaltyPoints = user.LoyaltyPoints,
                    totalSpent = user.TotalSpent
                }
            });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "Không tìm thấy thông tin người dùng từ token." });

        try
        {
            var user = await userService.GetByIdAsync(userId);
            return Ok(new
            {
                success = true,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    fullName = user.FullName,
                    phone = user.Phone,
                    avatarUrl = user.GetAvatarUrl(),
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    city = user.City,
                    memberLevel = user.MemberLevel,
                    loyaltyPoints = user.LoyaltyPoints,
                    totalSpent = user.TotalSpent
                }
            });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "Không tìm thấy thông tin người dùng từ token." });

        try
        {
            await userService.UpdateProfileAsync(
                userId,
                request.FullName,
                request.Phone,
                request.DateOfBirth,
                request.Gender ?? "other",
                request.City,
                request.AvatarUrl
            );

            var user = await userService.GetByIdAsync(userId);
            return Ok(new
            {
                success = true,
                message = "Cập nhật hồ sơ thành công.",
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role,
                    fullName = user.FullName,
                    phone = user.Phone,
                    avatarUrl = user.GetAvatarUrl(),
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    city = user.City,
                    memberLevel = user.MemberLevel,
                    loyaltyPoints = user.LoyaltyPoints,
                    totalSpent = user.TotalSpent
                }
            });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "Không tìm thấy thông tin người dùng từ token." });

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { error = "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });

        try
        {
            await userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            return Ok(new { success = true, message = "Đổi mật khẩu thành công." });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? City { get; set; }
    public string? AvatarUrl { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = "";
    public string NewPassword { get; set; } = "";
}
