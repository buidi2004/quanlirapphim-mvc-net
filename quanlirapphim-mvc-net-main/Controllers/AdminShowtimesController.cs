using System.Data;
using CinemaXNet.Models.Domain;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/showtimes")]
public class AdminShowtimesController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = """
            SELECT s.*, m.title AS MovieTitle, r.name AS RoomName, c.name AS CinemaName 
            FROM showtimes s 
            JOIN movies m ON s.movie_id = m.id 
            JOIN rooms r ON s.room_id = r.id 
            JOIN cinemas c ON r.cinema_id = c.id
            ORDER BY s.show_date DESC, s.start_time DESC
        """;
        var showtimes = await db.QueryAsync<dynamic>(sql);
        
        ViewBag.Movies = await db.QueryAsync<Movie>("SELECT id, title FROM movies ORDER BY id DESC");
        ViewBag.Rooms = await db.QueryAsync<dynamic>("SELECT r.id, r.name, c.name AS CinemaName FROM rooms r JOIN cinemas c ON r.cinema_id = c.id ORDER BY c.name, r.name");
        
        return View("~/Views/Admin/Showtimes/Index.cshtml", showtimes);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        try
        {
            var sql = "INSERT INTO showtimes (movie_id, room_id, show_date, start_time, end_time, price) VALUES (@MovieId, @RoomId, @ShowDate, @StartTime, @EndTime, @Price)";
            await db.ExecuteAsync(sql, new { MovieId = movieId, RoomId = roomId, ShowDate = showDate, StartTime = startTime, EndTime = endTime, Price = price });
            TempData["Success"] = "Thêm suất chiếu thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        try
        {
            var sql = "UPDATE showtimes SET movie_id = @MovieId, room_id = @RoomId, show_date = @ShowDate, start_time = @StartTime, end_time = @EndTime, price = @Price WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, MovieId = movieId, RoomId = roomId, ShowDate = showDate, StartTime = startTime, EndTime = endTime, Price = price });
            TempData["Success"] = "Cập nhật suất chiếu thành công!";
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
            await db.ExecuteAsync("DELETE FROM showtimes WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa suất chiếu thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
