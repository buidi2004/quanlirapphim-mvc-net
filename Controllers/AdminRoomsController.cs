using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/rooms")]
public class AdminRoomsController(IRoomService roomService, ILogger<AdminRoomsController> logger) : Controller
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
            if (string.IsNullOrWhiteSpace(name))
            {
                TempData["Error"] = "Tên phòng không được để trống.";
                return RedirectToAction(nameof(Index));
            }
            if (totalRows <= 0 || seatsPerRow <= 0)
            {
                TempData["Error"] = "Số hàng và số ghế phải lớn hơn 0.";
                return RedirectToAction(nameof(Index));
            }

            var room = new Room { CinemaId = cinemaId, Name = name.Trim(), TotalRows = totalRows, SeatsPerRow = seatsPerRow };
            await roomService.AddAsync(room);
            TempData["Success"] = "Thêm phòng thành công!";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error storing room {RoomName}", name);
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
            if (string.IsNullOrWhiteSpace(name))
            {
                TempData["Error"] = "Tên phòng không được để trống.";
                return RedirectToAction(nameof(Index));
            }
            if (totalRows <= 0 || seatsPerRow <= 0)
            {
                TempData["Error"] = "Số hàng và số ghế phải lớn hơn 0.";
                return RedirectToAction(nameof(Index));
            }

            var room = new Room { Id = id, CinemaId = cinemaId, Name = name.Trim(), TotalRows = totalRows, SeatsPerRow = seatsPerRow };
            await roomService.UpdateAsync(room);
            TempData["Success"] = "Cập nhật phòng thành công!";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating room {RoomId}", id);
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
            logger.LogError(ex, "Error deleting room {RoomId}", id);
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
            if (request == null || string.IsNullOrWhiteSpace(request.LayoutJson))
            {
                return BadRequest(new { success = false, error = "Dữ liệu layout trống." });
            }

            // Validate that it's valid JSON format
            using (JsonDocument.Parse(request.LayoutJson))
            {
                // Must be valid JSON array/object representing layout
            }

            await roomService.UpdateLayoutAsync(id, request.LayoutJson);
            return Json(new { success = true, message = "Đã lưu sơ đồ ghế thành công!" });
        }
        catch (JsonException)
        {
            return BadRequest(new { success = false, error = "Dữ liệu sơ đồ ghế không hợp lệ (lỗi JSON)." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving layout for room {RoomId}", id);
            return StatusCode(500, new { success = false, error = "Lỗi hệ thống khi lưu sơ đồ." });
        }
    }
}

public class LayoutSaveRequest
{
    public string LayoutJson { get; set; } = string.Empty;
}
