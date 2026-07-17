using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class UserRepository(IDbConnection db) : IUserRepository
{
    private const string BaseSelect = @"
        SELECT id, username, email, password_hash AS PasswordHash, role,
               full_name AS FullName, phone, avatar_url AS AvatarUrl,
               date_of_birth AS DateOfBirth, gender, city,
               member_level AS MemberLevel, total_spent AS TotalSpent, loyalty_points AS LoyaltyPoints,
               reset_token AS ResetToken, reset_token_expiry AS ResetTokenExpiry,
               refresh_token AS RefreshToken, refresh_token_expiry AS RefreshTokenExpiry,
               created_at AS CreatedAt, updated_at AS UpdatedAt
        FROM users";

    public async Task<User?> FindByIdAsync(int id)
    {
        var sql = BaseSelect + " WHERE id = @id";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { id });
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        var sql = BaseSelect + " WHERE email = @email";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { email });
    }

    public async Task<User?> FindByUsernameAsync(string username)
    {
        var sql = BaseSelect + " WHERE username = @username";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { username });
    }

    public async Task<int> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (username, email, password_hash, role)
            VALUES (@Username, @Email, @PasswordHash, @Role);
            SELECT LAST_INSERT_ID();";
        return await db.ExecuteScalarAsync<int>(sql, user);
    }

    public Task UpdateProfileAsync(int userId, string? fullName, string? phone,
                                   string? dateOfBirth, string gender, string? city, string? avatarUrl)
    {
        var sql = avatarUrl != null
            ? @"UPDATE users SET full_name=@fullName, phone=@phone, date_of_birth=@dateOfBirth,
                    gender=@gender, city=@city, avatar_url=@avatarUrl, updated_at=NOW()
                WHERE id=@userId"
            : @"UPDATE users SET full_name=@fullName, phone=@phone, date_of_birth=@dateOfBirth,
                    gender=@gender, city=@city, updated_at=NOW()
                WHERE id=@userId";

        return db.ExecuteAsync(sql, new { fullName, phone, dateOfBirth, gender, city, avatarUrl, userId });
    }

    public Task UpdatePasswordAsync(int userId, string newHash) =>
        db.ExecuteAsync(
            "UPDATE users SET password_hash=@newHash, updated_at=NOW() WHERE id=@userId",
            new { newHash, userId });

    public Task SetResetTokenAsync(int userId, string token, string expiry) =>
        db.ExecuteAsync(
            "UPDATE users SET reset_token=@token, reset_token_expiry=@expiry WHERE id=@userId",
            new { token, expiry, userId });

    public async Task<User?> FindByResetTokenAsync(string token)
    {
        var sql = BaseSelect + " WHERE reset_token = @token AND reset_token_expiry > NOW()";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { token });
    }

    public Task ClearResetTokenAsync(int userId) =>
        db.ExecuteAsync(
            "UPDATE users SET reset_token=NULL, reset_token_expiry=NULL WHERE id=@userId",
            new { userId });

    public Task AddSpentAsync(int userId, decimal amount) =>
        db.ExecuteAsync(
            "UPDATE users SET total_spent=total_spent+@amount WHERE id=@userId",
            new { amount, userId });

    public Task UpdateRefreshTokenAsync(int userId, string? token, string? expiry) =>
        db.ExecuteAsync(
            "UPDATE users SET refresh_token=@token, refresh_token_expiry=@expiry WHERE id=@userId",
            new { token, expiry, userId });

    public async Task<User?> FindByRefreshTokenAsync(string token)
    {
        var sql = BaseSelect + " WHERE refresh_token = @token AND refresh_token_expiry > NOW()";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { token });
    }

    public async Task<IEnumerable<dynamic>> GetAllPaginatedAsync(int limit, int offset)
    {
        var sql = "SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC LIMIT @limit OFFSET @offset";
        return await db.QueryAsync<dynamic>(sql, new { limit, offset });
    }

    public Task<int> GetCountAsync() => db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM users");

    public Task UpdateRoleAsync(int userId, string role) =>
        db.ExecuteAsync("UPDATE users SET role = @Role WHERE id = @Id", new { Role = role, Id = userId });

    public async Task DeleteAsync(int userId)
    {
        await db.ExecuteAsync("DELETE FROM tickets WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM reviews WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM audit_logs WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM notifications WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM users WHERE id = @Id", new { Id = userId });
    }
}
