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
}
