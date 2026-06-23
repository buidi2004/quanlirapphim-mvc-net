using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/refunds")]
public class AdminRefundsController(IDbConnection db) : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.PageTitle = "Quản lý Hoàn / Hủy vé";
        return View();
    }

    [HttpGet("api/search")]
    public async Task<IActionResult> SearchTickets([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { error = "Vui lòng nhập thông tin tìm kiếm." });
        }

        var sql = """
            SELECT t.id as TicketId, t.seat_code as SeatCode, t.status as Status, t.total_price as TotalPrice, t.booked_at as BookedAt,
                   m.title as MovieTitle, s.start_time as StartTime, s.show_date as ShowDate, r.name as RoomName,
                   u.email as UserEmail, u.phone as UserPhone, u.full_name as UserName
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN users u ON t.user_id = u.id
            WHERE (t.id::TEXT = @query OR u.email LIKE @queryLike OR u.phone LIKE @queryLike)
              AND t.status IN ('paid', 'holding', 'used', 'cancelled')
            ORDER BY t.booked_at DESC
            LIMIT 20
        """;
        
        // SQLite doesn't support ::TEXT cast easily, so we use CAST
        sql = """
            SELECT t.id as TicketId, t.seat_code as SeatCode, t.status as Status, t.total_price as TotalPrice, t.booked_at as BookedAt,
                   m.title as MovieTitle, s.start_time as StartTime, s.show_date as ShowDate, r.name as RoomName,
                   u.email as UserEmail, u.phone as UserPhone, u.full_name as UserName
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN users u ON t.user_id = u.id
            WHERE (CAST(t.id AS TEXT) = @query OR u.email LIKE @queryLike OR u.phone LIKE @queryLike)
            ORDER BY t.booked_at DESC
            LIMIT 20
        """;

        var tickets = await db.QueryAsync<dynamic>(sql, new { query = query, queryLike = $"%{query}%" });
        return Json(tickets);
    }

    [HttpPost("api/cancel")]
    public async Task<IActionResult> CancelTicket([FromBody] CancelRequest request)
    {
        if (request.TicketId <= 0)
        {
            return BadRequest(new { error = "Mã vé không hợp lệ." });
        }

        var ticket = await db.QueryFirstOrDefaultAsync<dynamic>("SELECT id, status FROM tickets WHERE id = @id", new { id = request.TicketId });
        
        if (ticket == null) return NotFound(new { error = "Không tìm thấy vé." });
        if (ticket.status == "cancelled") return BadRequest(new { error = "Vé này đã bị hủy trước đó." });
        if (ticket.status == "used") return BadRequest(new { error = "Vé này đã được sử dụng, không thể hoàn/hủy." });

        var updateSql = "UPDATE tickets SET status = 'cancelled' WHERE id = @id";
        await db.ExecuteAsync(updateSql, new { id = request.TicketId });

        // Optionally, log the reason (would require an audit log table)
        // string reason = request.Reason;

        return Json(new { success = true, message = "Đã hủy vé thành công. Vui lòng tiến hành hoàn tiền cho khách nếu cần." });
    }
}

public class CancelRequest
{
    public int TicketId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
