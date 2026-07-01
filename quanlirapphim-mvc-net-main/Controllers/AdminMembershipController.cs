using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/membership")]
public class AdminMembershipController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Quản lý hạng thành viên";
        var sql = "SELECT * FROM membership_tiers ORDER BY min_spent ASC";
        var tiers = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/Membership/Index.cshtml", tiers);
    }
}
