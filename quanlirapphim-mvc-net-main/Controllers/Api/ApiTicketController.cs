using System.Data;
using System.Security.Claims;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("api/tickets")]
public class ApiTicketController(IDbConnection db, ITicketService ticketService) : ControllerBase
{
    // GET /api/tickets/my-tickets
    [HttpGet("my-tickets")]
    public async Task<IActionResult> MyTickets()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "Không xác định được danh tính người dùng." });

        try
        {
            var tickets = await ticketService.GetUserTicketsAsync(userId);
            return Ok(new { success = true, data = tickets });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi hệ thống khi lấy danh sách vé: " + ex.Message });
        }
    }

    // GET /api/tickets/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTicketDetail(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "Không xác định được danh tính người dùng." });

        try
        {
            var sql = """
                SELECT t.*, 
                       m.title AS MovieTitle, m.poster_url AS PosterUrl, m.age_rating AS AgeRating, m.duration_minutes AS DurationMinutes,
                       s.show_date AS ShowDate, s.start_time AS StartTime, s.price,
                       r.name AS RoomName
                FROM tickets t
                JOIN showtimes s ON s.id = t.showtime_id
                JOIN movies m ON m.id = s.movie_id
                JOIN rooms r ON r.id = s.room_id
                WHERE t.id = @Id AND t.user_id = @UserId
            """;

            var result = await db.QueryAsync<Ticket, TicketDetailViewModel, TicketDetailViewModel>(
                sql,
                (ticket, vm) =>
                {
                    vm.Ticket = ticket;
                    return vm;
                },
                new { Id = id, UserId = userId },
                splitOn: "MovieTitle"
            );

            var viewModel = result.FirstOrDefault();

            if (viewModel == null)
            {
                return NotFound(new { error = "Không tìm thấy vé hoặc vé không thuộc quyền sở hữu của bạn." });
            }

            // Get cinema name
            string cinemaName = "CinemaX";
            try
            {
                cinemaName = await db.QueryFirstOrDefaultAsync<string>("""
                    SELECT c.name FROM cinemas c
                    JOIN rooms r ON r.cinema_id = c.id
                    WHERE r.id = (SELECT room_id FROM showtimes WHERE id = @ShowtimeId)
                """, new { ShowtimeId = viewModel.Ticket.ShowtimeId }) ?? "CinemaX";
            }
            catch
            {
                // Fallback to default
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = viewModel.Ticket.Id,
                    showtimeId = viewModel.Ticket.ShowtimeId,
                    seatCode = viewModel.Ticket.SeatCode,
                    status = viewModel.Ticket.Status,
                    totalPrice = viewModel.Ticket.TotalPrice,
                    bookedAt = viewModel.Ticket.BookedAt,
                    movieTitle = viewModel.MovieTitle,
                    posterUrl = viewModel.PosterUrl,
                    ageRating = viewModel.AgeRating,
                    durationMinutes = viewModel.DurationMinutes,
                    showDate = viewModel.ShowDate,
                    startTime = viewModel.StartTime,
                    roomName = viewModel.RoomName,
                    cinemaName = cinemaName,
                    ticketCode = !string.IsNullOrEmpty(viewModel.Ticket.PromotionCode) ? viewModel.Ticket.PromotionCode : $"CX-{viewModel.Ticket.Id:D6}"
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi lấy thông tin chi tiết vé: " + ex.Message });
        }
    }
}
