using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using CinemaXNet.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/booking")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class BookingApiController(
    IMovieService movieService, 
    ITicketService ticketService, 
    IPromotionService promoService,
    IPaymentService paymentService) : ControllerBase
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
            cinemaName = "CinemaX",
            roomName = vm.RoomName,
            startTime = vm.StartTime,
            basePrice = vm.PricePerSeat,
            seats = seats
        }));
    }

    [HttpPost("hold")]
    public async Task<IActionResult> HoldSeats([FromBody] HoldSeatsRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? "guest@cinemax.com";
        var holdResult = await ticketService.HoldSeatsAsync(userId, req.ShowtimeId, req.SeatCodes, email, "0000000000");
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
        var success = await ticketService.ConfirmPaymentAsync(req.TicketIds, userId, req.PaymentMethod, finalTotalPrice, req.PromoCode);
        if (!success) throw new BusinessException("Cập nhật vé thất bại.");
        
        return Ok(ApiResponse<object>.Ok(new { }, "Đặt vé thành công!"));
    }
}

public class HoldSeatsRequest { public int ShowtimeId { get; set; } public List<string> SeatCodes { get; set; } = new(); }
public class ApplyPromoRequest { public string PromoCode { get; set; } = string.Empty; public double TotalPrice { get; set; } }
public class ConfirmBookingRequest { public List<int> TicketIds { get; set; } = new(); public string PaymentMethod { get; set; } = string.Empty; public string PromoCode { get; set; } = string.Empty; }
