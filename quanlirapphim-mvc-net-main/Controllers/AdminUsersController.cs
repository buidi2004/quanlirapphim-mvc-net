using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin")]
[Route("admin/users")]
public class AdminUsersController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        
        var count = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM users");
        var users = await db.QueryAsync<dynamic>("SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC LIMIT @limit OFFSET @offset", new { limit, offset });
        
        var paginated = new CinemaXNet.ViewModels.PaginatedList<dynamic>(users.ToList(), count, page, pageSize);
        return View("~/Views/Admin/Users/Index.cshtml", paginated);
    }

    [HttpPost("update-role")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateRole(int id, string role)
    {
        try
        {
            await db.ExecuteAsync("UPDATE users SET role = @Role WHERE id = @Id", new { Role = role, Id = id });
            TempData["Success"] = "Cập nhật quyền thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
