// NotificationService: Service xu ly cac logic nghiep vu (Business Logic) cho Notification
﻿using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class NotificationService(INotificationRepository repo) : INotificationService
{
    // Xử lý logic và luồng thực thi cho phương thức GetUserNotificationsAsync
    public async Task<IEnumerable<dynamic>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
    {
        int offset = (page - 1) * pageSize;
        return await repo.GetByUserIdAsync(userId, offset, pageSize);
    }

    // Xử lý logic và luồng thực thi cho phương thức MarkAsReadAsync
    public async Task MarkAsReadAsync(int notificationId)
    {
        await repo.MarkAsReadAsync(notificationId);
    }

    // Xử lý logic và luồng thực thi cho phương thức MarkAllAsReadAsync
    public async Task MarkAllAsReadAsync(int userId)
    {
        await repo.MarkAllAsReadAsync(userId);
    }
}
