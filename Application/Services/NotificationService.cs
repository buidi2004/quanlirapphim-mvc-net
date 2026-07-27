using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class NotificationService(INotificationRepository repo) : INotificationService
{
    public async Task<IEnumerable<dynamic>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
    {
        int offset = (page - 1) * pageSize;
        return await repo.GetByUserIdAsync(userId, offset, pageSize);
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        await repo.MarkAsReadAsync(notificationId);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        await repo.MarkAllAsReadAsync(userId);
    }
}
