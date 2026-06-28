using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("admin/scanner")]
public class AdminScannerController(IDbConnection db) : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.PageTitle = "Quét vé Check-in";
        return View();
    }

    [HttpPost("api/scan")]
    public async Task<IActionResult> ScanTicket([FromBody] ScanRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TicketId) || !int.TryParse(request.TicketId, out int ticketId))
        {
            return BadRequest(new { error = "Mã vé không hợp lệ." });
        }

        var sql = """
            SELECT t.id, t.status, t.seat_code, m.title as MovieTitle, s.start_time, s.show_date, r.name as RoomName
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            WHERE t.id = @ticketId
        """;
        var ticket = await db.QueryFirstOrDefaultAsync<dynamic>(sql, new { ticketId });

        if (ticket == null)
            return NotFound(new { error = "Không tìm thấy vé này trên hệ thống." });

        if (ticket.status == "used")
            return BadRequest(new { error = "Vé này đã được sử dụng trước đó!" });

        if (ticket.status == "cancelled")
            return BadRequest(new { error = "Vé này đã bị hủy!" });

        if (ticket.status != "paid")
            return BadRequest(new { error = "Vé này chưa được thanh toán thành công." });

        // Update status to 'used'
        var updateSql = "UPDATE tickets SET status = 'used' WHERE id = @ticketId";
        await db.ExecuteAsync(updateSql, new { ticketId });

        return Json(new { 
            success = true, 
            message = "Check-in thành công!", 
            detail = new {
                movie = ticket.MovieTitle,
                time = ticket.start_time,
                room = ticket.RoomName,
                seat = ticket.seat_code
            }
        });
    }
}

public class ScanRequest
{
    public string TicketId { get; set; } = string.Empty;
}
