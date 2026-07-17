using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/rooms")]
public class AdminRoomsController(IRoomService roomService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        ViewBag.PageTitle = "Quản lý Phòng chiếu";
        
        var (rooms, totalCount) = await roomService.GetPagedRoomsAsync(page, pageSize);
        var cinemas = await roomService.GetAllCinemasAsync();
        
        ViewBag.Cinemas = cinemas;
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return View("~/Views/Admin/Rooms/Index.cshtml", rooms);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(int cinemaId, string name, int totalRows, int seatsPerRow)
    {
        try
        {
            var room = new Room { CinemaId = cinemaId, Name = name, TotalRows = totalRows, SeatsPerRow = seatsPerRow };
            await roomService.AddAsync(room);
            TempData["Success"] = "Thêm phòng thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, int cinemaId, string name, int totalRows, int seatsPerRow)
    {
        try
        {
            var room = new Room { Id = id, CinemaId = cinemaId, Name = name, TotalRows = totalRows, SeatsPerRow = seatsPerRow };
            await roomService.UpdateAsync(room);
            TempData["Success"] = "Cập nhật phòng thành công!";
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
            await roomService.DeleteAsync(id);
            TempData["Success"] = "Xóa phòng thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    // --- Phase 3: Visual Seat Map Builder ---

    [HttpGet("builder/{id}")]
    public async Task<IActionResult> LayoutBuilder(int id)
    {
        var room = await roomService.GetByIdAsync(id);
        if (room == null) return NotFound();

        ViewBag.PageTitle = $"Sơ đồ ghế: {room.Name}";
        return View("~/Views/Admin/Rooms/LayoutBuilder.cshtml", room);
    }

    [HttpPost("api/builder/{id}")]
    public async Task<IActionResult> SaveLayout(int id, [FromBody] LayoutSaveRequest request)
    {
        try
        {
            await roomService.UpdateLayoutAsync(id, request.LayoutJson);
            return Json(new { success = true, message = "Đã lưu sơ đồ ghế thành công!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class LayoutSaveRequest
{
    public string LayoutJson { get; set; } = string.Empty;
}
