// AdminSettingsController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminSettings
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin")]
[Route("admin/settings")]
public class AdminSettingsController(ISettingService settingService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index()
    {
        var settings = await settingService.GetAllSettingsAsync();
        return View("~/Views/Admin/Settings/Index.cshtml", settings);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Save
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
