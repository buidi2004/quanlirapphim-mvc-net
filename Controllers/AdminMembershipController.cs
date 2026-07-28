// AdminMembershipController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminMembership
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;
using System.Threading.Tasks;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/membership")]
public class AdminMembershipController(IMembershipService membershipService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Quản lý hạng thành viên";
        var tiers = await membershipService.GetAllTiersAsync();
        return View("~/Views/Admin/Membership/Index.cshtml", tiers);
    }
}
