namespace CinemaXNet.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<dynamic>> GetByUserIdAsync(int userId, int offset = 0, int limit = 20);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);

    // Admin methods
    Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAllPaginatedAsync(int page, int pageSize);
    Task CreateAsync(string title, string message, string type, int userId);
    Task BroadcastAsync(string title, string message, string type);
    Task DeleteAsync(int id);
}
