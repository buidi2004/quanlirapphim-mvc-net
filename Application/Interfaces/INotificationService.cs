namespace CinemaXNet.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<dynamic>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
}
