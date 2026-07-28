// AdminBannersController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminBanners
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/banners")]
public class AdminBannersController(IBannerService bannerService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index()
    {
        var banners = await bannerService.GetAllBannersAsync();
        return View("~/Views/Admin/Banners/Index.cshtml", banners);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Store
    public async Task<IActionResult> Store(string title, string? description, IFormFile? image, string? linkUrl, int sortOrder = 0, bool isActive = true)
    {
        try
        {
            await bannerService.AddBannerAsync(title, description, image, linkUrl, sortOrder, isActive);
            TempData["Success"] = "Thêm banner thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Update
    public async Task<IActionResult> Update(int id, string title, string? description, IFormFile? image, string? linkUrl, int sortOrder = 0, bool isActive = true)
    {
        try
        {
            await bannerService.UpdateBannerAsync(id, title, description, image, linkUrl, sortOrder, isActive);
            TempData["Success"] = "Cập nhật banner thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Delete
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await bannerService.DeleteBannerAsync(id);
            TempData["Success"] = "Xóa banner thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
