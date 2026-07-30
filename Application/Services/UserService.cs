// UserService: Service xu ly cac logic nghiep vu (Business Logic) cho User
using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class UserService(IUserRepository userRepo, IEmailSender emailSender) : IUserService
{
    // Xử lý logic và luồng thực thi cho phương thức AuthenticateAsync
    public async Task<User> AuthenticateAsync(string email, string password)
    {
        var user = await userRepo.FindByEmailAsync(email) ?? await userRepo.FindByUsernameAsync(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new BusinessException("Email/Tên đăng nhập hoặc mật khẩu không chính xác.");
        return user;
    }

    // Xử lý logic và luồng thực thi cho phương thức RegisterAsync
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

    // Xử lý logic và luồng thực thi cho phương thức GetByIdAsync
    public async Task<User> GetByIdAsync(int userId)
    {
        var user = await userRepo.FindByIdAsync(userId);
        return user ?? throw new NotFoundException("Không tìm thấy người dùng.");
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateProfileAsync
    public async Task UpdateProfileAsync(int userId, string? fullName, string? phone,
                                   string? dateOfBirth, string gender, string? city, string? avatarUrl) =>
        await userRepo.UpdateProfileAsync(userId, fullName, phone, dateOfBirth, gender, city, avatarUrl);

    // Xử lý logic và luồng thực thi cho phương thức ChangePasswordAsync
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

    // Xử lý logic và luồng thực thi cho phương thức ForgotPasswordAsync
    public async Task ForgotPasswordAsync(string email)
    {
        var user = await userRepo.FindByEmailAsync(email);
        if (user == null) return; // Không tiết lộ email có tồn tại hay không

        var token  = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        var expiry = DateTime.UtcNow.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss");
        await userRepo.SetResetTokenAsync(user.Id, token, expiry);

        var link    = $"http://localhost:5000/reset-password?token={token}";
        await emailSender.SendEmailAsync(
            email, 
            "Đặt lại mật khẩu - CinemaX", 
            $"Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau: <a href='{link}'>{link}</a>");
    }

    // Xử lý logic và luồng thực thi cho phương thức ResetPasswordAsync
    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var user = await userRepo.FindByResetTokenAsync(token)
            ?? throw new BusinessException("Token không hợp lệ hoặc đã hết hạn.");

        if (newPassword.Length < 8)
            throw new BusinessException("Mật khẩu phải từ 8 ký tự.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await userRepo.UpdatePasswordAsync(user.Id, newHash);
        await userRepo.ClearResetTokenAsync(user.Id);
    }

    // Xử lý logic và luồng thực thi cho phương thức SaveRefreshTokenAsync
    public async Task SaveRefreshTokenAsync(int userId, string? token, string? expiry)
    {
        await userRepo.UpdateRefreshTokenAsync(userId, token, expiry);
    }

    // Xử lý logic và luồng thực thi cho phương thức ValidateRefreshTokenAsync
    public async Task<User> ValidateRefreshTokenAsync(string token)
    {
        var user = await userRepo.FindByRefreshTokenAsync(token);
        if (user == null)
            throw new BusinessException("Refresh token không hợp lệ hoặc đã hết hạn.");
        return user;
    }

    // Xử lý logic và luồng thực thi cho phương thức GetPaginatedUsersAsync
    public async Task<CinemaXNet.Application.ViewModels.PaginatedList<dynamic>> GetPaginatedUsersAsync(int page, int pageSize)
    {
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        var count = await userRepo.GetCountAsync();
        var users = await userRepo.GetAllPaginatedAsync(limit, offset);
        return new CinemaXNet.Application.ViewModels.PaginatedList<dynamic>(users.ToList(), count, page, pageSize);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateRoleAsync
    public async Task UpdateRoleAsync(int userId, string role) => await userRepo.UpdateRoleAsync(userId, role);

    public async Task DeleteAccountAsync(int userId)
    {
        await userRepo.DeleteAsync(userId);
    }
    
    public async Task<User?> FindByEmailAsync(string email)
    {
        return await userRepo.FindByEmailAsync(email);
    }

    public async Task<User?> FindByEmailOrUsernameAsync(string identifier)
    {
        return await userRepo.FindByEmailAsync(identifier) ?? await userRepo.FindByUsernameAsync(identifier);
    }

    public Task RecalculateMemberTierAsync(int userId, System.Data.IDbTransaction? transaction = null) => 
        userRepo.RecalculateMemberTierAsync(userId, transaction);
}
