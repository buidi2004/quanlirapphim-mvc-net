using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/food-beverages")]
public class AdminFoodBeveragesController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = "SELECT * FROM food_beverages ORDER BY id DESC";
        var items = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/FoodBeverages/Index.cshtml", items);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string name, string description, decimal price, int stockQuantity, IFormFile? image)
    {
        try
        {
            string? imageUrl = null;
            if (image != null && image.Length > 0)
            {
                var ext = Path.GetExtension(image.FileName);
                var newName = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "food");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await image.CopyToAsync(stream);
                imageUrl = "/uploads/food/" + newName;
            }

            var sql = "INSERT INTO food_beverages (name, description, price, image_url, stock_quantity) VALUES (@Name, @Description, @Price, @ImageUrl, @StockQuantity)";
            await db.ExecuteAsync(sql, new { Name = name, Description = description, Price = price, ImageUrl = imageUrl, StockQuantity = stockQuantity });
            TempData["Success"] = "Thêm bắp nước thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string name, string description, decimal price, int stockQuantity, IFormFile? image)
    {
        try
        {
            string? imageUrl = null;
            if (image != null && image.Length > 0)
            {
                var ext = Path.GetExtension(image.FileName);
                var newName = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "food");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await image.CopyToAsync(stream);
                imageUrl = "/uploads/food/" + newName;
            }

            var sql = @"UPDATE food_beverages SET 
                        name = @Name, description = @Description, price = @Price, stock_quantity = @StockQuantity,
                        image_url = COALESCE(@ImageUrl, image_url) 
                        WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, Name = name, Description = description, Price = price, StockQuantity = stockQuantity, ImageUrl = imageUrl });
            TempData["Success"] = "Cập nhật bắp nước thành công!";
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
            await db.ExecuteAsync("DELETE FROM food_beverages WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa bắp nước thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
