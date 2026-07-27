using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/tickets")]
public class AdminTicketsController(ITicketService ticketService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var (items, count) = await ticketService.GetAdminPaginatedTicketsAsync(page, pageSize);
        
        var paginated = new CinemaXNet.Application.ViewModels.PaginatedList<dynamic>(items.ToList(), count, page, pageSize);
        
        return View("~/Views/Admin/Tickets/Index.cshtml", paginated);
    }
}
