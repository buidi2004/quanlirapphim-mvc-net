using System.Data;
using System.Security.Claims;
using CinemaXNet.Models.Domain;
using CinemaXNet.ViewModels;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize]
[Route("my-tickets")]
public class TicketController(IDbConnection db) : Controller
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> TicketDetail(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
            return NotFound();
        }

        // Generate ticket code if missing
        if (string.IsNullOrEmpty(viewModel.PromotionCode))
        {
            // Just using PromotionCode field temporarily to store TicketCode for view if needed.
            // Wait, actually Ticket does not have TicketCode in DB.
            // In PHP, it generated 'CX-' + hash. I put that in the view: 
            // !string.IsNullOrEmpty(Model.PromotionCode) ? Model.PromotionCode : "CX-" ...
        }

        // Try to get cinema name
        try
        {
            var cinemaName = await db.QueryFirstOrDefaultAsync<string>("""
                SELECT c.name FROM cinemas c
                JOIN rooms r ON r.cinema_id = c.id
                WHERE r.id = (SELECT room_id FROM showtimes WHERE id = @ShowtimeId)
            """, new { ShowtimeId = viewModel.Ticket.ShowtimeId });
            
            viewModel.CinemaName = cinemaName ?? "CinemaX";
        }
        catch
        {
            viewModel.CinemaName = "CinemaX";
        }

        return View("~/Views/Movie/TicketDetail.cshtml", viewModel);
    }
}
