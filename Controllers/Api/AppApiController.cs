using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;

namespace CinemaXNet.Controllers.Api;

// [ApiController]: Đánh dấu class này là một API Controller, giúp tự động kiểm tra tính hợp lệ của dữ liệu (ModelState) và suy luận nguồn tham số (như lấy từ Body, Query).
[ApiController]
// [Route("api/app")]: Định nghĩa đường dẫn gốc cho toàn bộ các API trong file này. Ví dụ: domain.com/api/app/...
[Route("api/app")]
// [AllowAnonymous]: Cho phép người dùng chưa đăng nhập (khách) cũng có thể gọi được các API trong class này (trừ khi bên trong hàm có kiểm tra riêng).
[AllowAnonymous]
public class AppApiController(IPromotionService promoService, INewsService newsService, INotificationService notificationService) : ControllerBase
{
    // API Lấy danh sách Khuyến mãi
    // Sử dụng [HttpGet] để quy định phương thức HTTP cho API này là GET. Đường dẫn đầy đủ sẽ là: GET /api/app/promotions
    [HttpGet("promotions")]
    public async Task<IActionResult> GetPromotions()
    {
        // Gọi Service để lấy 100 khuyến mãi (Phân trang page 1, limit 100)
        // Vì sao dùng Service? Để giấu logic kết nối Database khỏi Controller, giúp Controller luôn nhẹ nhàng và dễ đọc.
        var result = await promoService.GetPaginatedAsync(1, 100);
        
        // Trả về JSON theo định dạng chuẩn (ApiResponse) để Mobile/Frontend dễ dàng xử lý.
        return Ok(ApiResponse<object>.Ok(result.Items));
    }

    // API Lấy danh sách Tin tức
    // Đường dẫn: GET /api/app/news
    [HttpGet("news")]
    public async Task<IActionResult> GetNews()
    {
        // Lấy dữ liệu tin tức từ Database thông qua Service
        var result = await newsService.GetAllNewsAsync(1, 100);
        
        // Vì sao phải Map (Select) lại dữ liệu ở đây?
        // 1. Dapper trả về các dynamic properties thường dùng "snake_case" (như image_url).
        // 2. Client (Mobile App) thường dùng chuẩn "camelCase" (như imageUrl).
        // => Việc map lại giúp App Mobile không bị lỗi khi parse JSON và giấu đi các trường dữ liệu dư thừa không cần thiết.
        var news = result.NewsList.Select(n => new {
            id = n.id,
            title = n.title,
            summary = n.excerpt,
            imageUrl = n.image_url,
            date = n.created_at,
            isFeatured = false // Hardcode mặc định không nổi bật
        });
        
        // Trả kết quả thành công với HTTP 200 (Ok)
        return Ok(ApiResponse<object>.Ok(news));
    }

    // API Lấy danh sách Thông báo của người dùng
    // Đường dẫn: GET /api/app/notifications
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        // Kiểm tra xem người dùng đã đăng nhập (mang theo token) hay chưa.
        // Vì sao phải kiểm tra thủ công? Vì ở trên cùng ta đã dùng [AllowAnonymous], nên ở đây phải tự check.
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            // Trả về HTTP 401 Unauthorized nếu chưa đăng nhập
            return Unauthorized(ApiResponse<object>.Fail("Vui lòng đăng nhập để xem thông báo."));
        }
        
        // Trích xuất ID của User từ Claims (dữ liệu được giải mã từ JWT Token hoặc Cookie).
        // ClaimTypes.NameIdentifier thường chứa UserID.
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        // Gọi Service lấy danh sách 50 thông báo gần nhất của người dùng này
        var result = await notificationService.GetUserNotificationsAsync(userId, 1, 50);
        
        // Tiếp tục Map dữ liệu để đổi tên cột và chuyển kiểu dữ liệu is_read (từ int ở DB sang bool cho Frontend dễ xài).
        var notifs = result.Select(n => new {
            id = n.id,
            title = n.title,
            message = n.message,
            time = n.created_at,
            type = n.type,
            isRead = Convert.ToInt32(n.is_read) == 1 // Convert sang boolean (True/False)
        });
        
        return Ok(ApiResponse<object>.Ok(notifs));
    }
}
