// AdminNewsController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminNews
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/news")]
public class AdminNewsController(INewsService newsService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var result = await newsService.GetAllNewsAsync(page, pageSize);
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = result.TotalPages;
        return View("~/Views/Admin/News/Index.cshtml", result.NewsList);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Store
    public async Task<IActionResult> Store(string title, string excerpt, string content, IFormFile? image)
    {
        try
        {
            await newsService.AddNewsAsync(title, excerpt, content, image);
            TempData["Success"] = "Đăng tin tức thành công!";
        }
        catch (InvalidOperationException ex)
        {
            TempData["Error"] = ex.Message;
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
    public async Task<IActionResult> Update(int id, string title, string excerpt, string content, IFormFile? image)
    {
        try
        {
            await newsService.UpdateNewsAsync(id, title, excerpt, content, image);
            TempData["Success"] = "Cập nhật tin tức thành công!";
        }
        catch (InvalidOperationException ex)
        {
            TempData["Error"] = ex.Message;
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
            await newsService.DeleteNewsAsync(id);
            TempData["Success"] = "Xóa tin tức thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
