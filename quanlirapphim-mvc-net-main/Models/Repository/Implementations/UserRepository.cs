using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

public class UserRepository(IDbConnection db) : IUserRepository
{
    private const string BaseSelect = @"
        SELECT id, username, email, password_hash AS PasswordHash, role,
               full_name AS FullName, phone, avatar_url AS AvatarUrl,
               date_of_birth AS DateOfBirth, gender, city,
               member_level AS MemberLevel, total_spent AS TotalSpent, loyalty_points AS LoyaltyPoints,
               reset_token AS ResetToken, reset_token_expiry AS ResetTokenExpiry,
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

    public async Task<int> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (username, email, password_hash, role)
            VALUES (@Username, @Email, @PasswordHash, @Role);
            SELECT last_insert_rowid();";
        return await db.ExecuteScalarAsync<int>(sql, user);
    }

    public Task UpdateProfileAsync(int userId, string? fullName, string? phone,
                                   string? dateOfBirth, string gender, string? city, string? avatarUrl)
    {
        var sql = avatarUrl != null
            ? @"UPDATE users SET full_name=@fullName, phone=@phone, date_of_birth=@dateOfBirth,
                    gender=@gender, city=@city, avatar_url=@avatarUrl, updated_at=datetime('now')
                WHERE id=@userId"
            : @"UPDATE users SET full_name=@fullName, phone=@phone, date_of_birth=@dateOfBirth,
                    gender=@gender, city=@city, updated_at=datetime('now')
                WHERE id=@userId";

        return db.ExecuteAsync(sql, new { fullName, phone, dateOfBirth, gender, city, avatarUrl, userId });
    }

    public Task UpdatePasswordAsync(int userId, string newHash) =>
        db.ExecuteAsync(
            "UPDATE users SET password_hash=@newHash, updated_at=datetime('now') WHERE id=@userId",
            new { newHash, userId });

    public Task SetResetTokenAsync(int userId, string token, string expiry) =>
        db.ExecuteAsync(
            "UPDATE users SET reset_token=@token, reset_token_expiry=@expiry WHERE id=@userId",
            new { token, expiry, userId });

    public async Task<User?> FindByResetTokenAsync(string token)
    {
        var sql = BaseSelect + " WHERE reset_token = @token AND reset_token_expiry > datetime('now')";
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
}
