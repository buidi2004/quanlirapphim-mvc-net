using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class UserService(IUserRepository userRepo) : IUserService
{
    public async Task<User> AuthenticateAsync(string email, string password)
    {
        var user = await userRepo.FindByEmailAsync(email) ?? await userRepo.FindByUsernameAsync(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new BusinessException("Email/Tên đăng nhập hoặc mật khẩu không chính xác.");
        return user;
    }

    public async Task<User> RegisterAsync(string username, string email, string password, string fullName = "", string phone = "")
    {
        var existing = await userRepo.FindByEmailAsync(email);
        if (existing != null)
            throw new BusinessException("Email đã được sử dụng.");

        var user = new User
        {
            Username     = username,
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role         = "user",
            FullName     = fullName,
            Phone        = phone
        };

        var id = await userRepo.CreateAsync(user);
        return await userRepo.FindByIdAsync(id) ?? throw new BusinessException("Lỗi tạo tài khoản.");
    }

    public async Task<User> GetByIdAsync(int userId)
    {
        var user = await userRepo.FindByIdAsync(userId);
        return user ?? throw new NotFoundException("Không tìm thấy người dùng.");
    }

    public Task UpdateProfileAsync(int userId, string? fullName, string? phone,
                                   string? dateOfBirth, string gender, string? city, string? avatarUrl) =>
        userRepo.UpdateProfileAsync(userId, fullName, phone, dateOfBirth, gender, city, avatarUrl);

    public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await userRepo.FindByIdAsync(userId)
            ?? throw new BusinessException("Không tìm thấy người dùng.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new BusinessException("Mật khẩu hiện tại không đúng.");

        if (newPassword.Length < 8)
            throw new BusinessException("Mật khẩu mới phải có ít nhất 8 ký tự.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await userRepo.UpdatePasswordAsync(userId, newHash);
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await userRepo.FindByEmailAsync(email);
        if (user == null) return; // Không tiết lộ email có tồn tại hay không

        var token  = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        var expiry = DateTime.UtcNow.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss");
        await userRepo.SetResetTokenAsync(user.Id, token, expiry);

        // Log reset link thay vì gửi email thật
        var logDir  = Path.Combine(Directory.GetCurrentDirectory(), "logs");
        Directory.CreateDirectory(logDir);
        var logFile = Path.Combine(logDir, "emails.log");
        var link    = $"http://localhost:5000/reset-password?token={token}";
        await File.AppendAllTextAsync(logFile,
            $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Password Reset for {email}: {link}\n");
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var user = await userRepo.FindByResetTokenAsync(token)
            ?? throw new BusinessException("Token không hợp lệ hoặc đã hết hạn.");

        if (newPassword.Length < 6)
            throw new BusinessException("Mật khẩu phải từ 6 ký tự.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await userRepo.UpdatePasswordAsync(user.Id, newHash);
        await userRepo.ClearResetTokenAsync(user.Id);
    }

    public Task SaveRefreshTokenAsync(int userId, string? token, string? expiry)
    {
        return userRepo.UpdateRefreshTokenAsync(userId, token, expiry);
    }

    public async Task<User> ValidateRefreshTokenAsync(string token)
    {
        var user = await userRepo.FindByRefreshTokenAsync(token);
        if (user == null)
            throw new BusinessException("Refresh token không hợp lệ hoặc đã hết hạn.");
        return user;
    }

    public async Task<CinemaXNet.Application.ViewModels.PaginatedList<dynamic>> GetPaginatedUsersAsync(int page, int pageSize)
    {
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        var count = await userRepo.GetCountAsync();
        var users = await userRepo.GetAllPaginatedAsync(limit, offset);
        return new CinemaXNet.Application.ViewModels.PaginatedList<dynamic>(users.ToList(), count, page, pageSize);
    }

    public Task UpdateRoleAsync(int userId, string role) => userRepo.UpdateRoleAsync(userId, role);

    public Task DeleteAccountAsync(int userId) => userRepo.DeleteAsync(userId);
}
