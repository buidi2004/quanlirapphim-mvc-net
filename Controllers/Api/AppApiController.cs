using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/app")]
[AllowAnonymous]
public class AppApiController(IPromotionService promoService, INewsService newsService, INotificationService notificationService) : ControllerBase
{
    [HttpGet("promotions")]
    public async Task<IActionResult> GetPromotions()
    {
        var result = await promoService.GetPaginatedAsync(1, 100);
        return Ok(ApiResponse<object>.Ok(result.Items));
    }

    [HttpGet("news")]
    public async Task<IActionResult> GetNews()
    {
        var result = await newsService.GetAllNewsAsync(1, 100);
        // Map Dapper dynamic rows to camelCase for mobile
        var news = result.NewsList.Select(n => new {
            id = n.id,
            title = n.title,
            summary = n.excerpt,
            imageUrl = n.image_url,
            date = n.created_at,
            isFeatured = false
        });
        return Ok(ApiResponse<object>.Ok(news));
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(ApiResponse<object>.Fail("Vui lòng đăng nhập để xem thông báo."));
        }
        
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await notificationService.GetUserNotificationsAsync(userId, 1, 50);
        var notifs = result.Select(n => new {
            id = n.id,
            title = n.title,
            message = n.message,
            time = n.created_at,
            type = n.type,
            isRead = Convert.ToInt32(n.is_read) == 1
        });
        return Ok(ApiResponse<object>.Ok(notifs));
    }
}
