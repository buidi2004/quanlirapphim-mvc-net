using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("admin/scanner")]
public class AdminScannerController(IScannerService scannerService) : Controller
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
        if (string.IsNullOrWhiteSpace(request.TicketId))
        {
            return BadRequest(new { error = "Mã vé không hợp lệ." });
        }

        int ticketId = 0;
        // Kiểm tra xem QR code có phải là chuỗi JSON do Mobile App tạo ra không
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
            catch
            {
                // Fallback nếu JSON lỗi
            }
        }
        else
        {
            int.TryParse(request.TicketId, out ticketId);
        }

        if (ticketId <= 0)
        {
            return BadRequest(new { error = "Mã vé không hợp lệ hoặc sai định dạng." });
        }

        var ticket = await scannerService.GetTicketDetailsForScanAsync(ticketId);

        if (ticket == null)
            return NotFound(new { error = "Không tìm thấy vé này trên hệ thống." });

        if (ticket.status == "used")
            return BadRequest(new { error = "Vé này đã được sử dụng trước đó!" });

        if (ticket.status == "cancelled")
            return BadRequest(new { error = "Vé này đã bị hủy!" });

        if (ticket.status != "paid")
            return BadRequest(new { error = "Vé này chưa được thanh toán thành công." });

        await scannerService.UpdateTicketStatusAsync(ticketId, "used");

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
