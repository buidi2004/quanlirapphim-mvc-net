using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/tickets")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class TicketApiController(ITicketService ticketService) : ControllerBase
{
    [HttpGet("my-tickets")]
    public async Task<IActionResult> GetMyTickets()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tickets = await ticketService.GetUserTicketsAsync(userId);
        return Ok(ApiResponse<object>.Ok(tickets));
    }

    [HttpGet("{id}")]
    public IActionResult GetTicketDetail(int id)
    {
        return Ok(ApiResponse<object>.Ok(new { }, "Not fully implemented yet"));
    }
}
