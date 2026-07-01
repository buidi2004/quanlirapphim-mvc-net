using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/pricing-rules")]
public class AdminPricingRulesController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Quản lý Luật Giá Vé";
        var sql = "SELECT * FROM pricing_rules ORDER BY id DESC";
        var rules = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/PricingRules/Index.cshtml", rules);
    }
}
