using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/news")]
public class AdminNewsController(IDbConnection db) : Controller
{
    private string CreateSlug(string title)
    {
        string slug = title.ToLower().Trim();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        return slug;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = "SELECT * FROM news ORDER BY id DESC";
        var news = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/News/Index.cshtml", news);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string title, string excerpt, string content, IFormFile? image)
    {
        try
        {
            string slug = CreateSlug(title);
            string? imageUrl = null;

            if (image != null && image.Length > 0)
            {
                var ext = Path.GetExtension(image.FileName);
                var newName = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "news");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await image.CopyToAsync(stream);
                imageUrl = "/uploads/news/" + newName;
            }

            var sql = "INSERT INTO news (title, slug, excerpt, content, image_url) VALUES (@Title, @Slug, @Excerpt, @Content, @ImageUrl)";
            await db.ExecuteAsync(sql, new { Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
            TempData["Success"] = "Đăng tin tức thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string title, string excerpt, string content, IFormFile? image)
    {
        try
        {
            string slug = CreateSlug(title);
            string? imageUrl = null;

            if (image != null && image.Length > 0)
            {
                var ext = Path.GetExtension(image.FileName);
                var newName = $"{Guid.NewGuid():N}{ext}";
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "news");
                Directory.CreateDirectory(uploadDir);
                var filePath = Path.Combine(uploadDir, newName);
                await using var stream = System.IO.File.Create(filePath);
                await image.CopyToAsync(stream);
                imageUrl = "/uploads/news/" + newName;
            }

            var sql = @"UPDATE news SET 
                        title = @Title, slug = @Slug, excerpt = @Excerpt, content = @Content, 
                        image_url = COALESCE(@ImageUrl, image_url) 
                        WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
            TempData["Success"] = "Cập nhật tin tức thành công!";
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
            await db.ExecuteAsync("DELETE FROM news WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa tin tức thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
