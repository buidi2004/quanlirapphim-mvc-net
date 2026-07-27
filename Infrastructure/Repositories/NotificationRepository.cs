using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class NotificationRepository(IDbConnection db) : INotificationRepository
{
    public async Task<IEnumerable<dynamic>> GetByUserIdAsync(int userId, int offset = 0, int limit = 20)
    {
        var sql = "SELECT * FROM notifications WHERE user_id = @UserId ORDER BY id DESC LIMIT @Limit OFFSET @Offset";
        return await db.QueryAsync<dynamic>(sql, new { UserId = userId, Limit = limit, Offset = offset });
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        var sql = "UPDATE notifications SET is_read = 1 WHERE id = @Id";
        await db.ExecuteAsync(sql, new { Id = notificationId });
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var sql = "UPDATE notifications SET is_read = 1 WHERE user_id = @UserId";
        await db.ExecuteAsync(sql, new { UserId = userId });
    }

    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAllPaginatedAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        var sql = @"
            SELECT n.*, u.username 
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            ORDER BY n.id DESC 
            LIMIT @Limit OFFSET @Offset";
            
        var items = await db.QueryAsync<dynamic>(sql, new { Limit = pageSize, Offset = offset });
        var count = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM notifications");
        
        return (items, count);
    }

    public Task CreateAsync(string title, string message, string type, int userId)
    {
        var sql = "INSERT INTO notifications (title, message, type, user_id) VALUES (@Title, @Message, @Type, @UserId)";
        return db.ExecuteAsync(sql, new { Title = title, Message = message, Type = type, UserId = userId });
    }

    public Task BroadcastAsync(string title, string message, string type)
    {
        var sql = "INSERT INTO notifications (title, message, type, user_id) SELECT @Title, @Message, @Type, id FROM users";
        return db.ExecuteAsync(sql, new { Title = title, Message = message, Type = type });
    }

    public Task DeleteAsync(int id)
    {
        return db.ExecuteAsync("DELETE FROM notifications WHERE id = @Id", new { Id = id });
    }
}
