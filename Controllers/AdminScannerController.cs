// AdminScannerController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminScanner
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("admin/scanner")]
public class AdminScannerController(IScannerService scannerService) : Controller
{
    [HttpGet("")]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public IActionResult Index()
    {
        ViewBag.PageTitle = "Quét vé Check-in";
        return View();
    }

    [HttpPost("api/scan")]
    // Xử lý logic và luồng thực thi cho phương thức ScanTicket
    public async Task<IActionResult> ScanTicket([FromBody] ScanRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TicketId))
        {
            return BadRequest(new { error = "Mã vé không hợp lệ." });
        }

        int ticketId = 0;
        string rawInput = request.TicketId.Trim();

        // 1. Giải mã nếu là chuỗi JSON (Từ App Mobile)
        if (rawInput.StartsWith("{"))
        {
            try
            {
                var payload = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.Nodes.JsonObject>(rawInput);
                if (payload != null)
                {
                    if (payload.ContainsKey("code")) ticketId = payload["code"]?.GetValue<int>() ?? 0;
                    else if (payload.ContainsKey("ticketId")) ticketId = payload["ticketId"]?.GetValue<int>() ?? 0;
                    else if (payload.ContainsKey("id")) ticketId = payload["id"]?.GetValue<int>() ?? 0;
                }
            }
            catch { }
        }

        // 2. Linh hoạt trích xuất số ID vé cho mọi định dạng (TICKET:105, CINEMAX-TICKET:105, URL, Số thuần)
        if (ticketId <= 0)
        {
            var match = System.Text.RegularExpressions.Regex.Match(rawInput, @"\d+");
            if (match.Success)
            {
                int.TryParse(match.Value, out ticketId);
            }
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
                ticketId = ticketId,
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
