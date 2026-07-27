using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/notifications")]
public class AdminNotificationsController(INotificationRepository notificationRepo, IUserService userService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 15;
        ViewBag.PageTitle = "Quản lý Thông báo";
        
        var (items, totalCount) = await notificationRepo.GetAllPaginatedAsync(page, pageSize);
        
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return View("~/Views/Admin/Notifications/Index.cshtml", items);
    }

    [HttpGet("create")]
    public IActionResult Create()
    {
        ViewBag.PageTitle = "Gửi thông báo mới";
        return View("~/Views/Admin/Notifications/Create.cshtml");
    }

    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string title, string message, string type, string target, string? email)
    {
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(message))
        {
            TempData["Error"] = "Vui lòng nhập đầy đủ Tiêu đề và Nội dung.";
            return View("~/Views/Admin/Notifications/Create.cshtml");
        }

        try
        {
            if (target == "all")
            {
                await notificationRepo.BroadcastAsync(title, message, type);
                TempData["Success"] = "Đã gửi thông báo đến tất cả người dùng.";
            }
            else if (target == "specific" && !string.IsNullOrWhiteSpace(email))
            {
                var user = await userService.FindByEmailAsync(email);
                if (user == null)
                {
                    TempData["Error"] = "Không tìm thấy người dùng với email này.";
                    return View("~/Views/Admin/Notifications/Create.cshtml");
                }
                await notificationRepo.CreateAsync(title, message, type, user.Id);
                TempData["Success"] = $"Đã gửi thông báo đến {user.Username}.";
            }
            return RedirectToAction(nameof(Index));
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống khi gửi thông báo.";
            return View("~/Views/Admin/Notifications/Create.cshtml");
        }
    }

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
