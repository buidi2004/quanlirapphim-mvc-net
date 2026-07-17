using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[AllowAnonymous]
[Route("vnpay-sandbox")]
public class VNPayMockController(ITicketService ticketService) : Controller
{
    [HttpGet("pay")]
    public IActionResult Pay(string txnRef, decimal amount, string ticketIds, string returnUrl)
    {
        ViewBag.TxnRef = txnRef;
        ViewBag.Amount = amount;
        ViewBag.TicketIds = ticketIds;
        ViewBag.ReturnUrl = returnUrl;
        return View("~/Views/VNPayMock/Pay.cshtml");
    }

    [HttpPost("process-pay")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ProcessPay(string txnRef, decimal amount, string ticketIds, string returnUrl)
    {
        var redirectUrl = $"{returnUrl}?vnp_TxnRef={txnRef}&vnp_ResponseCode=00&vnp_Amount={amount*100}&ticketIds={ticketIds}";
        return Redirect(redirectUrl);
    }
}
