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
    public async Task<IActionResult> GetTicketDetail(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var detail = await ticketService.GetTicketDetailAsync(id, userId);
        if (detail == null) return NotFound(ApiResponse<object>.Fail("Không tìm thấy vé."));
        
        var flatDetail = new {
            id = detail.Ticket.Id,
            showtimeId = detail.Ticket.ShowtimeId,
            movieId = detail.MovieId,
            seatCode = detail.Ticket.SeatCode,
            status = detail.Ticket.Status,
            totalPrice = detail.Ticket.TotalPrice,
            bookedAt = detail.Ticket.BookedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            movieTitle = detail.MovieTitle,
            posterUrl = detail.PosterUrl,
            ageRating = detail.AgeRating,
            durationMinutes = detail.DurationMinutes,
            showDate = detail.ShowDate,
            startTime = detail.StartTime,
            roomName = detail.RoomName,
            cinemaName = detail.CinemaName,
            ticketCode = "CX" + detail.Ticket.Id.ToString().PadLeft(6, '0')
        };
        
        return Ok(ApiResponse<object>.Ok(flatDetail));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromServices] IUserService userService)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await userService.GetByIdAsync(userId);
        
        if (user == null) return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng."));
        
        var currentYear = DateTime.UtcNow.Year;
        // Mặc định lấy TotalSpent của user làm Tổng chi tiêu (đơn giản hoá). 
        // Trong thực tế có thể filter theo năm từ bảng tickets.
        var totalSpent = user.TotalSpent;
        
        return Ok(ApiResponse<object>.Ok(new { 
            year = currentYear,
            totalSpent = totalSpent 
        }));
    }
}
