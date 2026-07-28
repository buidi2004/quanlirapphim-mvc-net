using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

// [Authorize]: Yêu cầu quyền admin hoặc cinema_manager mới được phép gửi thông báo.
[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/notifications")]
// AdminNotificationsController: Quản lý tính năng gửi thông báo (Push Notification/System Alert) cho người dùng
public class AdminNotificationsController(INotificationRepository notificationRepo, IUserService userService) : Controller
{
    // Hiển thị danh sách các thông báo đã gửi
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 15;
        ViewBag.PageTitle = "Quản lý Thông báo";
        
        // Trả về Tuple (Danh sách thông báo, Tổng số lượng để tính số trang)
        var (items, totalCount) = await notificationRepo.GetAllPaginatedAsync(page, pageSize);
        
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return View("~/Views/Admin/Notifications/Index.cshtml", items);
    }

    // Hiển thị Form Soạn thông báo mới
    [HttpGet("create")]
    public IActionResult Create()
    {
        ViewBag.PageTitle = "Gửi thông báo mới";
        return View("~/Views/Admin/Notifications/Create.cshtml");
    }

    // Xử lý Gửi (Lưu) thông báo vào Database
    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string title, string message, string type, string target, string? email)
    {
        // 1. Kiểm tra đầu vào cơ bản
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(message))
        {
            TempData["Error"] = "Vui lòng nhập đầy đủ Tiêu đề và Nội dung.";
            return View("~/Views/Admin/Notifications/Create.cshtml");
        }

        try
        {
            // 2. Nếu chọn mục tiêu (target) là "Tất cả" (all)
            if (target == "all")
            {
                // Hàm BroadcastAsync sẽ chèn 1 bản ghi vào DB, nhưng gán user_id = NULL 
                // (Sau đó App/Web sẽ lấy ra và tự động hiển thị cho mọi User)
                await notificationRepo.BroadcastAsync(title, message, type);
                TempData["Success"] = "Đã gửi thông báo đến tất cả người dùng.";
            }
            // 3. Nếu chọn gửi cho "Cá nhân cụ thể" (specific)
            else if (target == "specific" && !string.IsNullOrWhiteSpace(email))
            {
                // Phải tìm User bằng Email trước
                var user = await userService.FindByEmailAsync(email);
                if (user == null)
                {
                    TempData["Error"] = "Không tìm thấy người dùng với email này.";
                    return View("~/Views/Admin/Notifications/Create.cshtml"); // Trả lại Form kèm báo lỗi
                }
                // Tạo thông báo dành riêng cho User ID này
                await notificationRepo.CreateAsync(title, message, type, user.Id);
                TempData["Success"] = $"Đã gửi thông báo đến {user.Username}.";
            }
            // Quay về danh sách sau khi gửi xong
            return RedirectToAction(nameof(Index));
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống khi gửi thông báo.";
            return View("~/Views/Admin/Notifications/Create.cshtml");
        }
    }

    // Xóa một thông báo đã gửi
    [HttpPost("delete/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await notificationRepo.DeleteAsync(id);
            TempData["Success"] = "Xóa thông báo thành công.";
        }
        catch (Exception)
        {
            TempData["Error"] = "Lỗi khi xóa thông báo.";
        }
        return RedirectToAction(nameof(Index));
    }
}
