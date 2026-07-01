using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Data;
using Dapper;

namespace CinemaXNet.Controllers;

[Authorize]
[Route("profile")]
public class ProfileController(IUserService userService, IDbConnection db) : Controller
{
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /profile
    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var userId = GetUserId();
        var user   = await userService.GetByIdAsync(userId);

        // Stats
        var stats = await db.QueryFirstOrDefaultAsync("""
            SELECT COUNT(*) AS TotalTickets, COUNT(DISTINCT s.movie_id) AS TotalMovies
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            WHERE t.user_id = @userId AND t.status = 'paid'
        """, new { userId });

        // Recent tickets
        var recentTickets = await db.QueryAsync("""
            SELECT t.id, t.seat_code AS SeatCode, t.status, t.total_price AS TotalPrice,
                   t.booked_at AS BookedAt, m.title AS MovieTitle, m.poster_url AS PosterUrl,
                   s.show_date AS ShowDate, s.start_time AS StartTime, r.name AS RoomName
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN movies m ON m.id = s.movie_id
            JOIN rooms r ON r.id = s.room_id
            WHERE t.user_id = @userId
            ORDER BY t.booked_at DESC LIMIT 5
        """, new { userId });

        // Member level progress
        var levelThresholds = new Dictionary<string, decimal>
        {
            ["bronze"]  = 0,
            ["silver"]  = 2_000_000,
            ["gold"]    = 5_000_000,
            ["diamond"] = 10_000_000,
        };
        var levels       = levelThresholds.Keys.ToList();
        var currentIdx   = levels.IndexOf(user.MemberLevel);
        var nextIdx      = Math.Min(currentIdx + 1, levels.Count - 1);
        var nextLevel    = levels[nextIdx];
        var nextThreshold    = levelThresholds[nextLevel];
        var currentThreshold = levelThresholds[user.MemberLevel];
        var spent            = user.TotalSpent;
        var levelProgress = nextThreshold > currentThreshold
            ? (double)Math.Min(100, (spent - currentThreshold) / (nextThreshold - currentThreshold) * 100)
            : 100;
        var pointsToNextLevel = Math.Max(0, nextThreshold - spent);

        ViewBag.User              = user;
        ViewBag.Stats             = stats;
        ViewBag.RecentTickets     = recentTickets;
        ViewBag.NextLevel         = nextLevel;
        ViewBag.LevelProgress     = levelProgress;
        ViewBag.PointsToNextLevel = pointsToNextLevel;
        ViewBag.PageTitle         = "Hồ sơ — CinemaX";
        return View();
    }

    // GET /profile/edit
    [HttpGet("edit")]
    public async Task<IActionResult> Edit()
    {
        var user = await userService.GetByIdAsync(GetUserId());
        var vm = new ProfileEditViewModel
        {
            FullName    = user.FullName,
            Phone       = user.Phone,
            DateOfBirth = user.DateOfBirth,
            Gender      = user.Gender,
            City        = user.City,
        };
        ViewBag.User      = user;
        ViewBag.PageTitle = "Chỉnh sửa hồ sơ — CinemaX";
        return View(vm);
    }

    // POST /profile/edit
    [HttpPost("edit")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(ProfileEditViewModel vm, IFormFile? avatar)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.User = await userService.GetByIdAsync(GetUserId());
            return View(vm);
        }

        var userId    = GetUserId();
        string? avatarUrl = null;

        if (avatar != null && avatar.Length > 0)
        {
            var ext       = Path.GetExtension(avatar.FileName);
            var filename  = $"avatar_{userId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{ext}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, filename);
            await using var stream = System.IO.File.Create(filePath);
            await avatar.CopyToAsync(stream);
            avatarUrl = $"/uploads/avatars/{filename}";
        }

        await userService.UpdateProfileAsync(userId, vm.FullName, vm.Phone, vm.DateOfBirth, vm.Gender, vm.City, avatarUrl);
        TempData["Success"] = "Cập nhật hồ sơ thành công!";
        return RedirectToAction(nameof(Index));
    }

    // GET /profile/transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> Transactions(string? status)
    {
        var userId = GetUserId();
        var sql    = """
            SELECT t.id, t.seat_code AS SeatCode, t.status, t.total_price AS TotalPrice,
                   t.booked_at AS BookedAt, t.promotion_code AS PromotionCode,
                   m.title AS MovieTitle, s.show_date AS ShowDate,
                   s.start_time AS StartTime, r.name AS RoomName
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN movies m ON m.id = s.movie_id
            JOIN rooms r ON r.id = s.room_id
            WHERE t.user_id = @userId
        """;

        object param;
        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND t.status = @status";
            param = new { userId, status };
        }
        else
        {
            param = new { userId };
        }
        sql += " ORDER BY t.booked_at DESC";

        var transactions = (await db.QueryAsync(sql, param)).ToList();
        var totalSpent   = transactions
            .Where(t => t.status == "paid")
            .Sum(t => (decimal)t.TotalPrice);

        ViewBag.Transactions = transactions;
        ViewBag.TotalSpent   = totalSpent;
        ViewBag.Filter       = status;
        ViewBag.PageTitle    = "Lịch sử giao dịch — CinemaX";
        return View();
    }

    // GET /profile/change-password
    [HttpGet("change-password")]
    public IActionResult ChangePassword()
    {
        ViewBag.PageTitle = "Đổi mật khẩu — CinemaX";
        return View(new ChangePasswordViewModel());
    }

    // POST /profile/change-password
    [HttpPost("change-password")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangePassword(ChangePasswordViewModel vm)
    {
        if (!ModelState.IsValid) return View(vm);

        try
        {
            await userService.ChangePasswordAsync(GetUserId(), vm.CurrentPassword, vm.NewPassword);
            TempData["Success"] = "Đổi mật khẩu thành công!";
            return RedirectToAction(nameof(Index));
        }
        catch (BusinessException ex)
        {
            vm.GeneralError = ex.Message;
            return View(vm);
        }
    }
}
