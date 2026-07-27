using System.Data;
using System.Security.Claims;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.ViewModels;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize]
[Route("my-tickets")]
public class TicketController(ITicketService ticketService) : Controller
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> TicketDetail(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var viewModel = await ticketService.GetTicketDetailAsync(id, userId);

        if (viewModel == null)
        {
            return NotFound();
        }

        return View("~/Views/Movie/TicketDetail.cshtml", viewModel);
    }
}
