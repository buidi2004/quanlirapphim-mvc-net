using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/reviews")]
public class AdminReviewsController(IReviewService reviewService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var result = await reviewService.GetAllReviewsAsync(page, pageSize);
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = result.TotalPages;
        return View("~/Views/Admin/Reviews/Index.cshtml", result.Reviews);
    }

    [HttpPost("toggle")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        try
        {
            var result = await reviewService.ToggleReviewStatusAsync(id);
            if (result.Success)
            {
                TempData["Success"] = result.Message;
            }
            else
            {
                TempData["Error"] = result.Message;
            }
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
            await reviewService.DeleteReviewAsync(id);
            TempData["Success"] = "Đã xóa đánh giá!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
