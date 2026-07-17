using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/showtimes")]
public class AdminShowtimesController(IShowtimeService showtimeService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        
        var (showtimes, totalCount) = await showtimeService.GetPagedAsync(page, pageSize);
        
        ViewBag.Movies = await showtimeService.GetAllMoviesAsync();
        ViewBag.Rooms = await showtimeService.GetAllRoomsWithCinemaAsync();
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return View("~/Views/Admin/Showtimes/Index.cshtml", showtimes);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        try
        {
            await showtimeService.AddAsync(movieId, roomId, showDate, startTime, endTime, price);
            TempData["Success"] = "Thêm suất chiếu thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        try
        {
            await showtimeService.UpdateAsync(id, movieId, roomId, showDate, startTime, endTime, price);
            TempData["Success"] = "Cập nhật suất chiếu thành công!";
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
            await showtimeService.DeleteAsync(id);
            TempData["Success"] = "Xóa suất chiếu thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}

