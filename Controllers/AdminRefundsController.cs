using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/refunds")]
public class AdminRefundsController(IRefundService refundService) : Controller
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

        var tickets = await refundService.SearchTicketsAsync(query);
        return Json(tickets);
    }

    [HttpPost("api/cancel")]
    public async Task<IActionResult> CancelTicket([FromBody] CancelRequest request)
    {
        if (request.TicketId <= 0)
        {
            return BadRequest(new { error = "Mã vé không hợp lệ." });
        }

        var ticket = await refundService.GetTicketStatusAsync(request.TicketId);
        
        if (ticket == null) return NotFound(new { error = "Không tìm thấy vé." });
        if (ticket.status == "cancelled") return BadRequest(new { error = "Vé này đã bị hủy trước đó." });
        if (ticket.status == "used") return BadRequest(new { error = "Vé này đã được sử dụng, không thể hoàn/hủy." });

        await refundService.CancelTicketAsync(request.TicketId, request.Reason);

        return Json(new { success = true, message = "Đã hủy vé thành công. Vui lòng tiến hành hoàn tiền cho khách nếu cần." });
    }
}

public class CancelRequest
{
    public int TicketId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
