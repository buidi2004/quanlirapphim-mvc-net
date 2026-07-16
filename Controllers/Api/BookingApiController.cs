using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using CinemaXNet.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

using CinemaXNet.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/booking")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class BookingApiController(
    IMovieService movieService, 
    ITicketService ticketService, 
    IPromotionService promoService,
    IPaymentService paymentService,
    IHubContext<SeatHub> hubContext) : ControllerBase
{
    [HttpGet("seatmap/{showtimeId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeatMap(int showtimeId)
    {
        var vm = await movieService.GetSeatMapViewModelAsync(showtimeId);
        if (vm == null) return NotFound();

        var seats = new List<object>();
        for (int r = 1; r <= vm.TotalRows; r++)
        {
            char rowChar = (char)('A' + r - 1);
            for (int c = 1; c <= vm.SeatsPerRow; c++)
            {
                string code = $"{rowChar}{c}";
                string status = vm.SeatStatuses != null && vm.SeatStatuses.ContainsKey(code) ? vm.SeatStatuses[code] : "available";
                seats.Add(new { code, row = rowChar.ToString(), col = c, status, price = vm.PricePerSeat });
            }
        }

        return Ok(ApiResponse<object>.Ok(new {
            showtimeId = vm.ShowtimeId,
            movieTitle = vm.MovieTitle,
            cinemaName = vm.CinemaName,
            roomName = vm.RoomName,
            showDate = vm.ShowDate.ToString("yyyy-MM-dd"),
            startTime = vm.StartTime,
            basePrice = vm.PricePerSeat,
            seats = seats
        }));
    }

    [HttpGet("concessions")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConcessions([FromServices] IFoodBeverageService foodBeverageService)
    {
        var result = await foodBeverageService.GetPagedAsync(1, 100);
        return Ok(ApiResponse<object>.Ok(result.Items));
    }

    [HttpPost("hold")]
    public async Task<IActionResult> HoldSeats([FromBody] HoldSeatsRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? "guest@cinemax.com";
        var holdResult = await ticketService.HoldSeatsAsync(userId, req.ShowtimeId, req.SeatCodes, email, "0000000000");
        
        // Broadcast to clients in the same showtime group
        await hubContext.Clients.Group(req.ShowtimeId.ToString()).SendAsync("SeatHeld", new {
            SeatCodes = req.SeatCodes
        });

        return Ok(ApiResponse<object>.Ok(new { holdResult }));
    }

    [HttpPost("apply-promo")]
    public async Task<IActionResult> ApplyPromo([FromBody] ApplyPromoRequest req)
    {
        var promo = await promoService.ApplyPromotionAsync(req.PromoCode, (decimal)req.TotalPrice);
        return Ok(ApiResponse<object>.Ok(new { discount = promo.Discount, finalPrice = promo.TotalPrice }));
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmBooking([FromBody] ConfirmBookingRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        // BẢO MẬT: Backend tự tính toán lại tổng tiền từ Database
        var confirmVm = await ticketService.BuildConfirmViewModelAsync(req.TicketIds, userId);
        decimal finalTotalPrice = confirmVm.TotalPrice;

        var concessionTuples = new List<(int FoodBeverageId, int Quantity, decimal Price)>();
        if (req.Concessions != null && req.Concessions.Any())
        {
            var foodBeverageService = HttpContext.RequestServices.GetRequiredService<IFoodBeverageService>();
            foreach (var c in req.Concessions)
            {
                var fb = await foodBeverageService.GetByIdAsync(c.Id);
                if (fb != null)
                {
                    finalTotalPrice += fb.Price * c.Quantity;
                    concessionTuples.Add((fb.Id, c.Quantity, fb.Price));
                }
            }
        }

        if (!string.IsNullOrEmpty(req.PromoCode))
        {
            var promo = await promoService.ApplyPromotionAsync(req.PromoCode, finalTotalPrice);
            finalTotalPrice = promo.TotalPrice;
        }
        
        // Gọi Cổng Thanh Toán thực sự
        var paymentResult = await paymentService.ProcessAsync(req.PaymentMethod, new PaymentRequest
        {
            Amount = finalTotalPrice,
            OrderDescription = "Mua vé qua Mobile App",
            TicketIds = req.TicketIds,
            UserId = userId
        });
        
        if (!paymentResult.Success) 
            throw new BusinessException("Thanh toán không thành công qua cổng thanh toán.");

        // Cập nhật trạng thái vé và ghi nhận giá trị thực tế để tính điểm Loyalty
        var success = await ticketService.ConfirmPaymentAsync(req.TicketIds, userId, req.PaymentMethod, finalTotalPrice, req.PromoCode, concessionTuples);
        if (!success) throw new BusinessException("Cập nhật vé thất bại.");
        
        var transactionId = $"CX-{DateTime.UtcNow:yyyyMMddHHmmss}-{userId}";
        return Ok(ApiResponse<object>.Ok(new {
            transactionId,
            bookingDetail = new {
                movieTitle    = confirmVm.MovieTitle,
                cinemaName    = confirmVm.CinemaName,
                roomName      = confirmVm.RoomName,
                startTime     = confirmVm.StartTime,
                seats         = confirmVm.SelectedSeats,
                subtotal      = confirmVm.TotalPrice,
                discount      = confirmVm.TotalPrice - finalTotalPrice,
                totalPrice    = finalTotalPrice,
                paymentMethod = req.PaymentMethod,
                bookingDate   = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            }
        }, "Đặt vé thành công!"));
    }

    [HttpPost("create-payment-url")]
    public async Task<IActionResult> CreatePaymentUrl([FromBody] ConfirmBookingRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var confirmVm = await ticketService.BuildConfirmViewModelAsync(req.TicketIds, userId);
        decimal finalTotalPrice = confirmVm.TotalPrice;

        if (req.Concessions != null && req.Concessions.Any())
        {
            var foodBeverageService = HttpContext.RequestServices.GetRequiredService<IFoodBeverageService>();
            foreach (var c in req.Concessions)
            {
                var fb = await foodBeverageService.GetByIdAsync(c.Id);
                if (fb != null) finalTotalPrice += fb.Price * c.Quantity;
            }
        }

        if (!string.IsNullOrEmpty(req.PromoCode))
        {
            var promo = await promoService.ApplyPromotionAsync(req.PromoCode, finalTotalPrice);
            finalTotalPrice = promo.TotalPrice;
        }

        var txnRef = $"VNP_{DateTime.UtcNow.Ticks}";
        var returnUrl = "mobileappexpo://payment-result"; // Tương thích với Expo Scheme đã cấu hình
        
        // Host locally
        var requestUrl = $"{Request.Scheme}://{Request.Host}";
        var paymentUrl = $"{requestUrl}/vnpay-sandbox/pay?txnRef={txnRef}&amount={finalTotalPrice}&ticketIds={string.Join(",", req.TicketIds)}&returnUrl={Uri.EscapeDataString(returnUrl)}";

        return Ok(ApiResponse<object>.Ok(new { paymentUrl, txnRef }));
    }

    [HttpPost("status/{txnRef}")]
    public async Task<IActionResult> GetBookingStatus(string txnRef, [FromBody] ConfirmBookingRequest req)
    {
        // Khi VNPay gọi callback hoặc App check status (ở Mock này chúng ta cho App gửi req lên để Confirm luôn)
        // Đây là mock đơn giản thay vì lưu trạng thái transaction vào DB
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var confirmVm = await ticketService.BuildConfirmViewModelAsync(req.TicketIds, userId);
        decimal finalTotalPrice = confirmVm.TotalPrice;

        var concessionTuples = new List<(int FoodBeverageId, int Quantity, decimal Price)>();
        if (req.Concessions != null && req.Concessions.Any())
        {
            var foodBeverageService = HttpContext.RequestServices.GetRequiredService<IFoodBeverageService>();
            foreach (var c in req.Concessions)
            {
                var fb = await foodBeverageService.GetByIdAsync(c.Id);
                if (fb != null)
                {
                    finalTotalPrice += fb.Price * c.Quantity;
                    concessionTuples.Add((fb.Id, c.Quantity, fb.Price));
                }
            }
        }

        if (!string.IsNullOrEmpty(req.PromoCode))
        {
            var promo = await promoService.ApplyPromotionAsync(req.PromoCode, finalTotalPrice);
            finalTotalPrice = promo.TotalPrice;
        }

        // Gọi thẳng ConfirmPaymentAsync (vì đây là mock khi app đã được redirect về success)
        await ticketService.ConfirmPaymentAsync(req.TicketIds, userId, req.PaymentMethod, finalTotalPrice, req.PromoCode, concessionTuples);

        return Ok(ApiResponse<object>.Ok(new {
            transactionId = txnRef,
            status = "paid"
        }));
    }
}

public class HoldSeatsRequest { public int ShowtimeId { get; set; } public List<string> SeatCodes { get; set; } = new(); }
public class ApplyPromoRequest { public string PromoCode { get; set; } = string.Empty; public double TotalPrice { get; set; } }
public class ConfirmBookingRequest { public List<int> TicketIds { get; set; } = new(); public string PaymentMethod { get; set; } = string.Empty; public string PromoCode { get; set; } = string.Empty; public List<ConcessionOrderRequest>? Concessions { get; set; } }
public class ConcessionOrderRequest { public int Id { get; set; } public int Quantity { get; set; } }
