using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using System.Security.Claims;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin")]
public class AdminController(IMovieService movieService, IAuditLogService auditLogService, IDashboardService dashboardService) : Controller
{
    // GET /admin
    [HttpGet("")]
    public IActionResult Index() => RedirectToAction(nameof(Dashboard));

    // GET /admin/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var stats = await dashboardService.GetDashboardStatsAsync();
        return View(stats);
    }

    // GET /admin/movies
    [HttpGet("movies")]
    public async Task<IActionResult> Movies(int page = 1)
    {
        int pageSize = 10;
        var movies = await movieService.GetAllPaginatedAsync(page, pageSize);
        return View("Movies/Index", movies);
    }

    // POST /admin/movies
    [HttpPost("movies")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> StoreMovie(
        string title, string? genre, string status = "coming_soon",
        int durationMinutes = 0, string? description = null,
        string ageRating = "P", IFormFile? poster = null)
    {
        var errors = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(title))
            errors["title"] = "Tiêu đề không được để trống.";
        if (durationMinutes <= 0)
            errors["duration_minutes"] = "Thời lượng phải lớn hơn 0.";

        // Handle file upload
        string? posterUrl = null;
        if (poster != null && poster.Length > 0)
        {
            var ext      = Path.GetExtension(poster.FileName).ToLowerInvariant();
            var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExts.Contains(ext))
            {
                errors["poster"] = "Chỉ chấp nhận file ảnh (jpg, png, gif, webp).";
            }
            else
            {
                var newName  = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await poster.CopyToAsync(stream);
                posterUrl = "/uploads/" + newName;
            }
        }

        if (errors.Count > 0)
        {
            ViewBag.Errors = errors;
            var movies = await movieService.GetAllPaginatedAsync(1, 10);
            return View("Movies/Index", movies);
        }

        try
        {
            var movie = new CinemaXNet.Domain.Entities.Movie
            {
                Title           = title.Trim(),
                PosterUrl       = posterUrl,
                Genre           = genre?.Trim(),
                Status          = status.Trim(),
                DurationMinutes = durationMinutes,
                Description     = description?.Trim(),
                AgeRating       = ageRating.Trim()
            };

            // Access repo via service — for simplicity inject IMovieService and call via service
            // In a larger project you'd inject IMovieRepository or use a command handler
            await movieService.CreateMovieAsync(movie);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            await auditLogService.LogAsync(userId, "Create", "Movie", movie.Id.ToString(), $"Thêm phim mới: {movie.Title}");

            TempData["Success"] = "Thêm phim mới thành công!";
            return RedirectToAction(nameof(Movies));
        }
        catch (Exception ex)
        {
            ViewBag.Errors = new Dictionary<string, string> { ["general"] = "Lỗi hệ thống: " + ex.Message };
            var movies = await movieService.GetAllPaginatedAsync(1, 10);
            return View("Movies/Index", movies);
        }
    }

    // POST /admin/movies/update
    [HttpPost("movies/update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateMovie(
        int id, string title, string? genre, string status = "coming_soon",
        int durationMinutes = 0, string? description = null,
        string ageRating = "P", IFormFile? poster = null)
    {
        var errors = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(title))
            errors["title"] = "Tiêu đề không được để trống.";
        if (durationMinutes <= 0)
            errors["duration_minutes"] = "Thời lượng phải lớn hơn 0.";

        string? posterUrl = null;
        if (poster != null && poster.Length > 0)
        {
            var ext      = Path.GetExtension(poster.FileName).ToLowerInvariant();
            var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExts.Contains(ext))
                errors["poster"] = "Chỉ chấp nhận file ảnh (jpg, png, gif, webp).";
            else
            {
                var newName  = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await poster.CopyToAsync(stream);
                posterUrl = "/uploads/" + newName;
            }
        }

        if (errors.Count > 0)
        {
            TempData["Error"] = "Vui lòng điền đầy đủ thông tin hợp lệ.";
            return RedirectToAction(nameof(Movies));
        }

        try
        {
            var movie = new CinemaXNet.Domain.Entities.Movie
            {
                Title           = title.Trim(),
                PosterUrl       = posterUrl,
                Genre           = genre?.Trim(),
                Status          = status.Trim(),
                DurationMinutes = durationMinutes,
                Description     = description?.Trim(),
                AgeRating       = ageRating.Trim()
            };

            await movieService.UpdateMovieAsync(id, movie);
            
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            await auditLogService.LogAsync(userId, "Update", "Movie", id.ToString(), $"Cập nhật phim: {movie.Title}");
            
            TempData["Success"] = "Cập nhật phim thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }

        return RedirectToAction(nameof(Movies));
    }

    // POST /admin/movies/delete
    [HttpPost("movies/delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        try
        {
            await movieService.DeleteMovieAsync(id);
            
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            await auditLogService.LogAsync(userId, "Delete", "Movie", id.ToString(), $"Xóa phim ID: {id}");
            
            TempData["Success"] = "Xóa phim thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }

        return RedirectToAction(nameof(Movies));
    }
}
