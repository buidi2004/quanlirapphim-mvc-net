using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/promotions")]
public class AdminPromotionsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = "SELECT * FROM promotions ORDER BY id DESC";
        var promos = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/Promotions/Index.cshtml", promos);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            var sql = "INSERT INTO promotions (code, title, description, discount_percent, valid_from, valid_to, is_active) VALUES (@Code, @Title, @Description, @DiscountPercent, @ValidFrom, @ValidTo, @IsActive)";
            await db.ExecuteAsync(sql, new { Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            TempData["Success"] = "Thêm khuyến mãi thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            var sql = "UPDATE promotions SET code = @Code, title = @Title, description = @Description, discount_percent = @DiscountPercent, valid_from = @ValidFrom, valid_to = @ValidTo, is_active = @IsActive WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            TempData["Success"] = "Cập nhật khuyến mãi thành công!";
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
            await db.ExecuteAsync("DELETE FROM promotions WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa khuyến mãi thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
