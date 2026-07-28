// VNPayMockController: Controller xu ly cac yeu cau HTTP va dieu huong cho VNPayMock
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[AllowAnonymous]
[Route("vnpay-sandbox")]
public class VNPayMockController() : Controller
{
    [HttpGet("pay")]
    // Xử lý logic và luồng thực thi cho phương thức Pay
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
    // Xử lý logic và luồng thực thi cho phương thức ProcessPay
    public IActionResult ProcessPay(string txnRef, decimal amount, string ticketIds, string returnUrl)
    {
        // Bảo mật: Chặn Open Redirect — chỉ cho phép redirect nội bộ
        if (!Url.IsLocalUrl(returnUrl))
            returnUrl = "/payment/success";
        var redirectUrl = $"{returnUrl}?vnp_TxnRef={txnRef}&vnp_ResponseCode=00&vnp_Amount={amount*100}&ticketIds={ticketIds}";
        return Redirect(redirectUrl);
    }
}
