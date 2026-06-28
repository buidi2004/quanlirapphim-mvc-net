using CinemaXNet.Core.Exceptions;
using CinemaXNet.Core.ValueObjects;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace CinemaXNet.Controllers;

public class ConcessionCartItem
{
    public string id { get; set; } = "";
    public string name { get; set; } = "";
    public int price { get; set; }
    public int qty { get; set; }
}

[Authorize]
[Route("payment")]
public class PaymentController(ITicketService ticketService, IPaymentService paymentService) : Controller
{
    // GET /payment
    [AllowAnonymous]
    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var ticketIds = GetPendingTicketIds();
        if (ticketIds.Count == 0) return Redirect("/");

        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? userId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);
            var confirmVm = await ticketService.BuildConfirmViewModelAsync(ticketIds, userId);

            var concessionsJson = HttpContext.Session.GetString("selected_concessions");
            if (!string.IsNullOrEmpty(concessionsJson))
            {
                var concessions = JsonSerializer.Deserialize<List<ConcessionCartItem>>(concessionsJson);
                ViewBag.Concessions = concessions;
                
                decimal concessionTotal = 0;
                if (concessions != null)
                {
                    foreach(var c in concessions)
                    {
                        concessionTotal += c.qty * c.price;
                    }
                }
                
                // Add to subtotal and total
                confirmVm.Subtotal += concessionTotal;
                confirmVm.TotalPrice = confirmVm.Subtotal - confirmVm.Discount;
            }

            return View(confirmVm);
        }
        catch (BusinessException ex)
        {
            TempData["Error"] = ex.Message;
            return Redirect("/");
        }
    }

    // POST /payment/confirm
    [AllowAnonymous]
    [HttpPost("confirm")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Confirm(
        string paymentMethod,
        decimal? totalPrice,
        string? promotionCode)
    {
        var ticketIds = GetPendingTicketIds();
        if (ticketIds.Count == 0) return Redirect("/");

        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        try
        {
            // Bước 1: Xử lý thanh toán qua Strategy Pattern
            var paymentResult = await paymentService.ProcessAsync(paymentMethod, new PaymentRequest
            {
                Amount           = totalPrice ?? 0,
                OrderDescription = "Đặt vé xem phim CinemaX",
                TicketIds        = ticketIds,
                UserId           = userId
            });

            if (!paymentResult.Success)
                throw new BusinessException("Thanh toán không thành công. Vui lòng thử lại.");

            // Bước 2: Xác nhận + Optimistic Locking
            await ticketService.ConfirmPaymentAsync(ticketIds, userId, paymentMethod, totalPrice, promotionCode);

            // Pass data to success page
            TempData["SuccessTicketIds"] = string.Join(",", ticketIds);

            // Clear session
            HttpContext.Session.Remove("pending_ticket_ids");
            HttpContext.Session.Remove("selected_concessions");

            return RedirectToAction(nameof(Success), new { txn = paymentResult.TransactionId });
        }
        catch (ConcurrencyException ex)
        {
            TempData["Error"] = ex.Message;
            return RedirectToAction("Index", "Movie");
        }
        catch (BusinessException ex)
        {
            TempData["Error"] = ex.Message;
            return RedirectToAction(nameof(Index));
        }
    }

    // GET /payment/success
    [AllowAnonymous]
    [HttpGet("success")]
    public async Task<IActionResult> Success(string txn)
    {
        var idsStr = TempData["SuccessTicketIds"] as string;
        if (string.IsNullOrEmpty(idsStr)) return Redirect("/");
        
        var ticketIds = idsStr.Split(',').Select(int.Parse).ToList();
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int? userId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);
        var confirmVm = await ticketService.BuildConfirmViewModelAsync(ticketIds, userId);
        
        ViewBag.TransactionId = txn;
        return View(confirmVm);
    }

    // ── Helpers ────────────────────────────────────────────────
    private List<int> GetPendingTicketIds()
    {
        var json = HttpContext.Session.GetString("pending_ticket_ids");
        if (string.IsNullOrEmpty(json)) return [];
        return JsonSerializer.Deserialize<List<int>>(json) ?? [];
    }
}
