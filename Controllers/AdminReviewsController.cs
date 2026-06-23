using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/reviews")]
public class AdminReviewsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = """
            SELECT r.*, u.full_name, m.title AS movie_title
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN movies m ON r.movie_id = m.id
            ORDER BY r.created_at DESC
        """;
        var reviews = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/Reviews/Index.cshtml", reviews);
    }

    [HttpPost("toggle")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        try
        {
            var review = await db.QuerySingleOrDefaultAsync<dynamic>("SELECT is_approved FROM reviews WHERE id = @Id", new { Id = id });
            if (review != null)
            {
                // In SQLite, bool is stored as 1/0 or true/false depending on the driver, but typically int 0 or 1.
                // Assuming it's numeric in this DB:
                bool currentStatus = review.is_approved == 1 || review.is_approved == true || review.is_approved == "1";
                bool newStatus = !currentStatus;
                await db.ExecuteAsync("UPDATE reviews SET is_approved = @NewStatus WHERE id = @Id", new { NewStatus = newStatus, Id = id });
                TempData["Success"] = newStatus ? "Đã duyệt đánh giá!" : "Đã ẩn đánh giá!";
            }
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
            await db.ExecuteAsync("DELETE FROM reviews WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Đã xóa đánh giá!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
