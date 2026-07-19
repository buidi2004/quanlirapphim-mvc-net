using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;
using System.Threading.Tasks;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/membership")]
public class AdminMembershipController(IMembershipService membershipService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "Quản lý hạng thành viên";
        var tiers = await membershipService.GetAllTiersAsync();
        return View("~/Views/Admin/Membership/Index.cshtml", tiers);
    }
}
