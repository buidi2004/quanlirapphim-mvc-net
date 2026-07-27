using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin")]
[Route("admin/settings")]
public class AdminSettingsController(ISettingService settingService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var settings = await settingService.GetAllSettingsAsync();
        return View("~/Views/Admin/Settings/Index.cshtml", settings);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(IFormCollection form, IFormFile? site_logo)
    {
        try
        {
            await settingService.SaveSettingsAsync(form, site_logo);
            TempData["Success"] = "Lưu cấu hình thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
