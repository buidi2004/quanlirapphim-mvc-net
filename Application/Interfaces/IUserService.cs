using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IUserService
{
    Task<User> AuthenticateAsync(string email, string password);
    Task<User> RegisterAsync(string username, string email, string password);
    Task<User> GetByIdAsync(int userId);
    Task       UpdateProfileAsync(int userId, string? fullName, string? phone,
                                  string? dateOfBirth, string gender, string? city, string? avatarUrl);
    Task       ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task       ForgotPasswordAsync(string email);
    Task       ResetPasswordAsync(string token, string newPassword);
    
    Task       SaveRefreshTokenAsync(int userId, string? token, string? expiry);
    Task<User> ValidateRefreshTokenAsync(string token);
    
    Task<CinemaXNet.Application.ViewModels.PaginatedList<dynamic>> GetPaginatedUsersAsync(int page, int pageSize);
    Task UpdateRoleAsync(int userId, string role);
}
