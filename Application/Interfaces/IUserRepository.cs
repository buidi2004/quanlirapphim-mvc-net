using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> FindByIdAsync(int id);
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByUsernameAsync(string username);
    Task<int>   CreateAsync(User user);
    Task        UpdateProfileAsync(int userId, string? fullName, string? phone,
                                   string? dateOfBirth, string gender, string? city, string? avatarUrl);
    Task        UpdatePasswordAsync(int userId, string newHash);
    Task        SetResetTokenAsync(int userId, string token, string expiry);
    Task<User?> FindByResetTokenAsync(string token);
    Task        ClearResetTokenAsync(int userId);
    Task        AddSpentAsync(int userId, decimal amount);

    Task        UpdateRefreshTokenAsync(int userId, string? token, string? expiry);
    Task<User?> FindByRefreshTokenAsync(string token);
    
    Task<IEnumerable<dynamic>> GetAllPaginatedAsync(int limit, int offset);
    Task<int> GetCountAsync();
    Task UpdateRoleAsync(int userId, string role);
    Task DeleteAsync(int userId);
}
