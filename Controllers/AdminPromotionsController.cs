using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/promotions")]
public class AdminPromotionsController(IPromotionService promotionService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var paginated = await promotionService.GetPaginatedAsync(page, pageSize);
        return View("~/Views/Admin/Promotions/Index.cshtml", paginated);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            await promotionService.CreateAsync(new { Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            TempData["Success"] = "Thêm khuyến mãi thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            await promotionService.UpdateAsync(new { Id = id, Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            TempData["Success"] = "Cập nhật khuyến mãi thành công!";
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
            await promotionService.DeleteAsync(id);
            TempData["Success"] = "Xóa khuyến mãi thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
