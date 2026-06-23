using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/campaigns")]
public class AdminCampaignsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Chiến dịch Marketing";
        var sql = "SELECT * FROM marketing_campaigns ORDER BY id DESC";
        var campaigns = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/Campaigns/Index.cshtml", campaigns);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(string name, string type, string targetAudience, string content, string scheduledAt)
    {
        if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(content))
        {
            TempData["Error"] = "Tên và nội dung không được để trống.";
            return RedirectToAction(nameof(Index));
        }

        var sql = @"
            INSERT INTO marketing_campaigns (name, type, target_audience, content, status, scheduled_at)
            VALUES (@Name, @Type, @TargetAudience, @Content, 'Scheduled', @ScheduledAt)";
        
        await db.ExecuteAsync(sql, new 
        { 
            Name = name, 
            Type = type, 
            TargetAudience = targetAudience, 
            Content = content, 
            ScheduledAt = scheduledAt 
        });

        TempData["Success"] = "Đã lên lịch chiến dịch thành công!";
        return RedirectToAction(nameof(Index));
    }
}
