using System.Data;
using CinemaXNet.Models.Domain;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/rooms")]
public class AdminRoomsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Quản lý Phòng chiếu";
        var sql = """
            SELECT r.*, c.name AS CinemaName 
            FROM rooms r 
            JOIN cinemas c ON r.cinema_id = c.id 
            ORDER BY r.id DESC
        """;
        var rooms = await db.QueryAsync<dynamic>(sql);
        var cinemas = await db.QueryAsync<Cinema>("SELECT id, name FROM cinemas ORDER BY name");
        ViewBag.Cinemas = cinemas;
        return View("~/Views/Admin/Rooms/Index.cshtml", rooms);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(int cinemaId, string name, int totalRows, int seatsPerRow)
    {
        try
        {
            var sql = "INSERT INTO rooms (cinema_id, name, total_rows, seats_per_row) VALUES (@CinemaId, @Name, @TotalRows, @SeatsPerRow)";
            await db.ExecuteAsync(sql, new { CinemaId = cinemaId, Name = name, TotalRows = totalRows, SeatsPerRow = seatsPerRow });
            TempData["Success"] = "Thêm phòng thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, int cinemaId, string name, int totalRows, int seatsPerRow)
    {
        try
        {
            var sql = "UPDATE rooms SET cinema_id = @CinemaId, name = @Name, total_rows = @TotalRows, seats_per_row = @SeatsPerRow WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, CinemaId = cinemaId, Name = name, TotalRows = totalRows, SeatsPerRow = seatsPerRow });
            TempData["Success"] = "Cập nhật phòng thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await db.ExecuteAsync("DELETE FROM rooms WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa phòng thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    // --- Phase 3: Visual Seat Map Builder ---

    [HttpGet("builder/{id}")]
    public async Task<IActionResult> LayoutBuilder(int id)
    {
        var room = await db.QueryFirstOrDefaultAsync<dynamic>("SELECT * FROM rooms WHERE id = @Id", new { Id = id });
        if (room == null) return NotFound();

        ViewBag.PageTitle = $"Sơ đồ ghế: {room.name}";
        return View("~/Views/Admin/Rooms/LayoutBuilder.cshtml", room);
    }

    [HttpPost("api/builder/{id}")]
    public async Task<IActionResult> SaveLayout(int id, [FromBody] LayoutSaveRequest request)
    {
        try
        {
            await db.ExecuteAsync("UPDATE rooms SET layout_json = @LayoutJson WHERE id = @Id", new { Id = id, LayoutJson = request.LayoutJson });
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
