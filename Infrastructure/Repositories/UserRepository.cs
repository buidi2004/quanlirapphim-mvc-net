using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

// UserRepository: Chịu trách nhiệm giao tiếp trực tiếp với cơ sở dữ liệu bảng 'users'.
// Pattern Repository giúp tách biệt hoàn toàn câu lệnh SQL ra khỏi logic nghiệp vụ (Services).
// Kế thừa IUserRepository (Interface) để hỗ trợ tiêm phụ thuộc (Dependency Injection) và dễ dàng viết Unit Test sau này.
public class UserRepository(IDbConnection db) : IUserRepository
{
    // Cố định sẵn một chuỗi BaseSelect dùng chung cho các hàm tìm kiếm (giúp code không bị lặp lại).
    // Đặt tên bí danh (AS) bằng chuẩn PascalCase để Dapper tự động map vào các thuộc tính tương ứng của Class User.
    private const string BaseSelect = @"
        SELECT id, username, email, password_hash AS PasswordHash, role,
               full_name AS FullName, phone, avatar_url AS AvatarUrl,
               date_of_birth AS DateOfBirth, gender, city,
               member_level AS MemberLevel, total_spent AS TotalSpent, loyalty_points AS LoyaltyPoints,
               reset_token AS ResetToken, reset_token_expiry AS ResetTokenExpiry,
               refresh_token AS RefreshToken, refresh_token_expiry AS RefreshTokenExpiry,
               created_at AS CreatedAt, updated_at AS UpdatedAt
        FROM users";

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức FindByIdAsync
    public async Task<User?> FindByIdAsync(int id)
    {
        // 1. Nối chuỗi SQL cơ bản với điều kiện WHERE
        var sql = BaseSelect + " WHERE id = @id";
        
        // 2. Sử dụng Dapper QueryFirstOrDefaultAsync: Lấy dòng dữ liệu đầu tiên khớp điều kiện, hoặc trả về null nếu không thấy.
        // Truyền new { id } (Tham số hóa/Parameterized Query) để CHỐNG TẤN CÔNG SQL INJECTION.
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { id });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức FindByEmailAsync
    public async Task<User?> FindByEmailAsync(string email)
    {
        var sql = BaseSelect + " WHERE email = @email";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { email });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức FindByUsernameAsync
    public async Task<User?> FindByUsernameAsync(string username)
    {
        var sql = BaseSelect + " WHERE username = @username";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { username });
    }

    // Hàm tạo tài khoản mới. Trả về ID của user vừa được tạo.
    public async Task<int> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (username, email, password_hash, role)
            VALUES (@Username, @Email, @PasswordHash, @Role);
            SELECT LAST_INSERT_ID();"; // Lệnh của MySQL để lấy ID (khóa chính tự tăng) của dòng vừa Insert.
            
        // ExecuteScalarAsync: Thực thi câu lệnh và trả về đúng 1 giá trị duy nhất (ở đây là ID vừa tạo ra).
        return await db.ExecuteScalarAsync<int>(sql, user);
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateProfileAsync
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

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdatePasswordAsync
    public Task UpdatePasswordAsync(int userId, string newHash) =>
        db.ExecuteAsync(
            "UPDATE users SET password_hash=@newHash, updated_at=NOW() WHERE id=@userId",
            new { newHash, userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức SetResetTokenAsync
    public Task SetResetTokenAsync(int userId, string token, string expiry) =>
        db.ExecuteAsync(
            "UPDATE users SET reset_token=@token, reset_token_expiry=@expiry WHERE id=@userId",
            new { token, expiry, userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức FindByResetTokenAsync
    public async Task<User?> FindByResetTokenAsync(string token)
    {
        var sql = BaseSelect + " WHERE reset_token = @token AND reset_token_expiry > NOW()";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { token });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức ClearResetTokenAsync
    public Task ClearResetTokenAsync(int userId) =>
        db.ExecuteAsync(
            "UPDATE users SET reset_token=NULL, reset_token_expiry=NULL WHERE id=@userId",
            new { userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức AddSpentAsync
    public Task AddSpentAsync(int userId, decimal amount) =>
        db.ExecuteAsync(
            "UPDATE users SET total_spent=total_spent+@amount WHERE id=@userId",
            new { amount, userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateRefreshTokenAsync
    public Task UpdateRefreshTokenAsync(int userId, string? token, string? expiry) =>
        db.ExecuteAsync(
            "UPDATE users SET refresh_token=@token, refresh_token_expiry=@expiry WHERE id=@userId",
            new { token, expiry, userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức FindByRefreshTokenAsync
    public async Task<User?> FindByRefreshTokenAsync(string token)
    {
        var sql = BaseSelect + " WHERE refresh_token = @token AND refresh_token_expiry > NOW()";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { token });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetAllPaginatedAsync
    public async Task<IEnumerable<dynamic>> GetAllPaginatedAsync(int limit, int offset)
    {
        var sql = "SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC LIMIT @limit OFFSET @offset";
        return await db.QueryAsync<dynamic>(sql, new { limit, offset });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetCountAsync
    public Task<int> GetCountAsync() => db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM users");

    public Task UpdateRoleAsync(int userId, string role) =>
        db.ExecuteAsync("UPDATE users SET role = @Role WHERE id = @Id", new { Role = role, Id = userId });

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức DeleteAsync
    public async Task DeleteAsync(int userId)
    {
        await db.ExecuteAsync("DELETE FROM tickets WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM reviews WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM audit_logs WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM notifications WHERE user_id = @Id", new { Id = userId });
        await db.ExecuteAsync("DELETE FROM users WHERE id = @Id", new { Id = userId });
    }

    // Hàm tính toán và cập nhật hạng thành viên (Vàng, Bạc, Đồng...)
    // Hàm này nhận thêm tham số IDbTransaction để có thể chạy bên trong một Transaction (nhằm đảm bảo tính toàn vẹn dữ liệu)
    public async Task RecalculateMemberTierAsync(int userId, System.Data.IDbTransaction? transaction = null)
    {
        // 1. Lấy tổng số tiền đã chi tiêu
        var currentSpent = await db.ExecuteScalarAsync<double>(
            "SELECT total_spent FROM users WHERE id = @UserId", 
            new { UserId = userId }, transaction);

        // 2. Lấy tổng số vé ĐÃ THANH TOÁN thành công
        var totalTickets = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM tickets WHERE user_id = @UserId AND status = 'paid'", 
            new { UserId = userId }, transaction);

        // 3. Truy vấn bảng 'membership_tiers' để tìm ra hạng cao nhất mà người dùng này đạt điều kiện.
        var newTier = await db.QueryFirstOrDefaultAsync<string>(@"
            SELECT name FROM membership_tiers 
            WHERE min_spent <= @Spent AND min_tickets <= @Tickets
            ORDER BY min_spent DESC, min_tickets DESC LIMIT 1", 
            new { Spent = currentSpent, Tickets = totalTickets }, transaction);

        // 4. Nếu tìm được hạng mới thì cập nhật vào bảng users
        if (!string.IsNullOrEmpty(newTier))
        {
            await db.ExecuteAsync(
                "UPDATE users SET member_level = @Tier WHERE id = @UserId", 
                new { Tier = newTier, UserId = userId }, transaction);
        }
    }
}
