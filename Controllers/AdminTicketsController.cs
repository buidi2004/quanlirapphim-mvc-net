using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/tickets")]
public class AdminTicketsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        
        var count = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM tickets");
        
        var sql = """
            SELECT t.id, t.ticket_code, t.status, t.total_price, t.created_at, 
                   u.full_name, u.email, 
                   m.title AS MovieTitle, 
                   s.show_date, s.start_time
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN showtimes s ON t.showtime_id = s.id
            LEFT JOIN movies m ON s.movie_id = m.id
            ORDER BY t.created_at DESC
            LIMIT @limit OFFSET @offset
        """;
        var tickets = await db.QueryAsync<dynamic>(sql, new { limit, offset });
        var paginated = new CinemaXNet.ViewModels.PaginatedList<dynamic>(tickets.ToList(), count, page, pageSize);
        
        return View("~/Views/Admin/Tickets/Index.cshtml", paginated);
    }
}
