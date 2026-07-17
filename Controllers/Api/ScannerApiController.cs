using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers.Api;

[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("api/scanner")]
[ApiController]
public class ScannerApiController(IScannerService scannerService) : ControllerBase
{
    [HttpPost("scan")]
    public async Task<IActionResult> ScanTicket([FromBody] ScanRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TicketId))
        {
            return BadRequest(new { success = false, message = "Mã vé không hợp lệ." });
        }

        int ticketId = 0;
        if (request.TicketId.Trim().StartsWith("{"))
        {
            try
            {
                var payload = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.Nodes.JsonObject>(request.TicketId);
                if (payload != null && payload.ContainsKey("code"))
                {
                    ticketId = payload["code"]?.GetValue<int>() ?? 0;
                }
            }
            catch { }
        }
        else
        {
            int.TryParse(request.TicketId, out ticketId);
        }

        if (ticketId <= 0)
        {
            return BadRequest(new { success = false, message = "Mã vé không hợp lệ hoặc sai định dạng." });
        }

        var ticket = await scannerService.GetTicketDetailsForScanAsync(ticketId);

        if (ticket == null)
            return NotFound(new { success = false, message = "Không tìm thấy vé này trên hệ thống." });

        if (ticket.status == "used")
            return BadRequest(new { success = false, message = "Vé này đã được sử dụng trước đó!" });

        if (ticket.status == "cancelled")
            return BadRequest(new { success = false, message = "Vé này đã bị hủy!" });

        if (ticket.status != "paid")
            return BadRequest(new { success = false, message = "Vé này chưa được thanh toán thành công." });

        await scannerService.UpdateTicketStatusAsync(ticketId, "used");

        return Ok(new { 
            success = true, 
            message = "Check-in thành công!", 
            data = new {
                movie = ticket.MovieTitle,
                time = ticket.start_time,
                room = ticket.RoomName,
                seat = ticket.seat_code
            }
        });
    }

    [HttpPost("scan-concession")]
    public async Task<IActionResult> ScanConcession([FromBody] ScanRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TicketId))
            return BadRequest(new { success = false, message = "Mã vé không hợp lệ." });

        int ticketId = 0;
        if (request.TicketId.Trim().StartsWith("{"))
        {
            try
            {
                var payload = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.Nodes.JsonObject>(request.TicketId);
                if (payload != null && payload.ContainsKey("code"))
                {
                    ticketId = payload["code"]?.GetValue<int>() ?? 0;
                }
            }
            catch { }
        }
        else
        {
            int.TryParse(request.TicketId, out ticketId);
        }

        if (ticketId <= 0)
            return BadRequest(new { success = false, message = "Mã vé không hợp lệ hoặc sai định dạng." });

        var ticket = await scannerService.GetTicketDetailsForScanAsync(ticketId);

        if (ticket == null)
            return NotFound(new { success = false, message = "Không tìm thấy vé này trên hệ thống." });

        if (ticket.status != "paid" && ticket.status != "used")
            return BadRequest(new { success = false, message = "Vé này chưa được thanh toán thành công." });

        if (ticket.ConcessionCount == 0)
            return BadRequest(new { success = false, message = "Khách hàng không đặt bắp nước trong đơn hàng này!" });

        if (ticket.concession_status == "delivered")
            return BadRequest(new { success = false, message = "Bắp nước của vé này đã được nhận trước đó!" });

        await scannerService.UpdateConcessionStatusAsync(ticketId, "delivered");

        return Ok(new { 
            success = true, 
            message = "Giao bắp nước thành công!", 
            data = new {
                movie = ticket.MovieTitle,
                seat = ticket.seat_code
            }
        });
    }
}
