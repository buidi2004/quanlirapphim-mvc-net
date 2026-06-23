using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Services.Interfaces;

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
}
