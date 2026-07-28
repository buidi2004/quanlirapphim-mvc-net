// AdminUsersController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminUsers
﻿using System;
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
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var paginated = await userService.GetPaginatedUsersAsync(page, pageSize);
        return View("~/Views/Admin/Users/Index.cshtml", paginated);
    }

    [HttpPost("update-role")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức UpdateRole
    public async Task<IActionResult> UpdateRole(int id, string role)
    {
        try
        {
            await userService.UpdateRoleAsync(id, role);
            TempData["Success"] = "Cập nhật quyền thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
