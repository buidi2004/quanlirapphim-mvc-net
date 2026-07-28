// AdminPricingRulesController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminPricingRules
﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/pricing-rules")]
public class AdminPricingRulesController(IPricingRuleService pricingRuleService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index(int page = 1)
    {
        ViewBag.PageTitle = "Quản lý Luật Giá Vé";
        int pageSize = 10;
        var paginated = await pricingRuleService.GetPaginatedAsync(page, pageSize);
        return View("~/Views/Admin/PricingRules/Index.cshtml", paginated);
    }
}
