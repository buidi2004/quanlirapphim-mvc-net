using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/food-beverages")]
public class AdminFoodBeveragesController(IFoodBeverageService foodBeverageService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var (items, totalCount) = await foodBeverageService.GetPagedAsync(page, pageSize);
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
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

            var foodBeverage = new FoodBeverage
            {
                Name = name,
                Description = description,
                Price = price,
                ImageUrl = imageUrl,
                StockQuantity = stockQuantity
            };
            await foodBeverageService.AddAsync(foodBeverage);
            TempData["Success"] = "Thêm bắp nước thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
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

            var foodBeverage = new FoodBeverage
            {
                Id = id,
                Name = name,
                Description = description,
                Price = price,
                ImageUrl = imageUrl,
                StockQuantity = stockQuantity
            };
            await foodBeverageService.UpdateAsync(foodBeverage);
            TempData["Success"] = "Cập nhật bắp nước thành công!";
        }
        catch (Exception)
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
            await foodBeverageService.DeleteAsync(id);
            TempData["Success"] = "Xóa bắp nước thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
