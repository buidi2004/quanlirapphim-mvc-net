using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/campaigns")]
public class AdminCampaignsController(ICampaignService campaignService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        ViewBag.PageTitle = "Chiến dịch Marketing";
        int pageSize = 10;
        var paginated = await campaignService.GetPaginatedAsync(page, pageSize);
        return View("~/Views/Admin/Campaigns/Index.cshtml", paginated);
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

        await campaignService.CreateAsync(new 
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
