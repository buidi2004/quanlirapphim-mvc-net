using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/cinemas")]
public class AdminCinemasController(ICinemaService cinemaService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        var cinemas = await cinemaService.GetAllAsync();
        // Todo: Add true pagination logic
        return View("~/Views/Admin/Cinemas/Index.cshtml", cinemas);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string name, string address, string province, string? phone)
    {
        try
        {
            var cinema = new Cinema { Name = name, Address = address, Province = province, Phone = phone };
            await cinemaService.CreateAsync(cinema);
            TempData["Success"] = "Thêm rạp thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string name, string address, string province, string? phone)
    {
        try
        {
            var cinema = new Cinema { Name = name, Address = address, Province = province, Phone = phone };
            await cinemaService.UpdateAsync(id, cinema);
            TempData["Success"] = "Cập nhật rạp thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await cinemaService.DeleteAsync(id);
            TempData["Success"] = "Xóa rạp thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
