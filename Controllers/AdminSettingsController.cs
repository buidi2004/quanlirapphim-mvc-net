using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin")]
[Route("admin/settings")]
public class AdminSettingsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var rows = await db.QueryAsync<dynamic>("SELECT * FROM settings");
        var settings = new Dictionary<string, string>();
        foreach (var r in rows)
        {
            settings[r.setting_key] = r.setting_value;
        }
        return View("~/Views/Admin/Settings/Index.cshtml", settings);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(IFormCollection form, IFormFile? site_logo)
    {
        try
        {
            var settings = new Dictionary<string, string>();
            foreach (var key in form.Keys)
            {
                if (key != "__RequestVerificationToken" && key != "site_logo")
                {
                    settings[key] = form[key].ToString();
                }
            }

            if (site_logo != null && site_logo.Length > 0)
            {
                var ext = Path.GetExtension(site_logo.FileName);
                var newName = $"logo_{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "settings");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await site_logo.CopyToAsync(stream);
                settings["site_logo"] = "/uploads/settings/" + newName;
            }

            foreach (var kvp in settings)
            {
                // In SQLite, INSERT OR REPLACE works well
                var sql = "INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (@Key, @Value)";
                await db.ExecuteAsync(sql, new { Key = kvp.Key, Value = kvp.Value });
            }

            TempData["Success"] = "Lưu cấu hình thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
