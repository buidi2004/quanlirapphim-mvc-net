using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin")]
[Route("admin/users")]
public class AdminUsersController(IUserService userService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var paginated = await userService.GetPaginatedUsersAsync(page, pageSize);
        return View("~/Views/Admin/Users/Index.cshtml", paginated);
    }

    [HttpPost("update-role")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateRole(int id, string role)
    {
        try
        {
            await userService.UpdateRoleAsync(id, role);
            TempData["Success"] = "Cập nhật quyền thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
