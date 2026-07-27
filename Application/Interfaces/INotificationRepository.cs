namespace CinemaXNet.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<dynamic>> GetByUserIdAsync(int userId, int offset = 0, int limit = 20);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
}
