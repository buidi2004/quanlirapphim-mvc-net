using System.Security.Claims;
using CinemaXNet.Core.Exceptions;
using CinemaXNet.Core.ValueObjects;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/booking")]
public class ApiBookingController(
    ITicketService ticketService,
    IMovieService movieService,
    IPromotionService promotionService,
    IPaymentService paymentService) : ControllerBase
{
    // GET /api/booking/seatmap/{showtimeId}
    [HttpGet("seatmap/{showtimeId:int}")]
    public async Task<IActionResult> GetSeatMap(int showtimeId)
    {
        try
        {
            var seatMapVm = await movieService.GetSeatMapViewModelAsync(showtimeId);
            return Ok(new
            {
                success = true,
                data = new
                {
                    showtimeId = seatMapVm.ShowtimeId,
                    movieTitle = seatMapVm.MovieTitle,
                    cinemaName = seatMapVm.CinemaName,
                    roomName = seatMapVm.RoomName,
                    startTime = seatMapVm.StartTime,
                    basePrice = seatMapVm.BasePrice,
                    seats = seatMapVm.Seats.Select(s => new
                    {
                        code = s.Code,
                        row = s.Row,
                        col = s.Col,
                        status = s.Status,
                        price = s.Price
                    })
                }
            });
        }
        catch (Exception ex)
        {
            return NotFound(new { error = "Không tìm thấy sơ đồ ghế cho suất chiếu này: " + ex.Message });
        }
    }

    // POST /api/booking/hold
    [HttpPost("hold")]
    public async Task<IActionResult> HoldSeats([FromBody] ApiHoldSeatsRequest request)
    {
        if (request == null || request.SeatCodes == null || request.SeatCodes.Count == 0)
            return BadRequest(new { error = "Vui lòng chọn ít nhất 1 ghế." });

        int? userId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out var id))
        {
            userId = id;
        }
        else if (string.IsNullOrWhiteSpace(request.GuestEmail) || string.IsNullOrWhiteSpace(request.GuestPhone))
        {
            return BadRequest(new { error = "Vui lòng đăng nhập hoặc cung cấp thông tin liên hệ khách hàng (Email và Số điện thoại)." });
        }

        try
        {
            var holdResult = await ticketService.HoldSeatsAsync(
                userId,
                request.ShowtimeId,
                request.SeatCodes,
                request.GuestEmail,
                request.GuestPhone
            );

            return Ok(new
            {
                success = true,
                ticketIds = holdResult.TicketIds,
                expiryTime = holdResult.ExpiryTime,
                remainingSeconds = holdResult.GetRemainingSeconds()
            });
        }
        catch (SeatUnavailableException ex)
        {
            return StatusCode(409, new { error = ex.Message });
        }
        catch (BusinessException ex)
        {
            return StatusCode(422, new { error = ex.Message });
        }
    }

    // POST /api/booking/apply-promo
    [HttpPost("apply-promo")]
    public async Task<IActionResult> ApplyPromo([FromBody] ApiApplyPromoRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Code))
            return BadRequest(new { error = "Vui lòng cung cấp mã khuyến mãi." });

        try
        {
            var result = await promotionService.ApplyPromotionAsync(request.Code, request.Subtotal);
            return Ok(new
            {
                success = true,
                discount = result.Discount,
                totalPrice = result.TotalPrice
            });
        }
        catch (BusinessException ex)
        {
            return StatusCode(422, new { error = ex.Message });
        }
    }

    // POST /api/booking/confirm
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmBooking([FromBody] ApiConfirmBookingRequest request)
    {
        if (request == null || request.TicketIds == null || request.TicketIds.Count == 0)
            return BadRequest(new { error = "Không tìm thấy danh sách vé cần thanh toán." });

        int? userId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out var id))
        {
            userId = id;
        }

        try
        {
            // Bước 1: Xử lý thanh toán qua Strategy Pattern
            var paymentResult = await paymentService.ProcessAsync(request.PaymentMethod, new PaymentRequest
            {
                Amount = request.TotalPrice,
                OrderDescription = "Đặt vé xem phim CinemaX qua App Mobile",
                TicketIds = request.TicketIds,
                UserId = userId
            });

            if (!paymentResult.Success)
                throw new BusinessException("Thanh toán không thành công. Vui lòng thử lại.");

            // Bước 2: Xác nhận + Optimistic Locking
            await ticketService.ConfirmPaymentAsync(
                request.TicketIds,
                userId,
                request.PaymentMethod,
                request.TotalPrice,
                request.PromotionCode
            );

            // Trả về thông tin xác nhận đặt vé thành công
            var confirmVm = await ticketService.BuildConfirmViewModelAsync(request.TicketIds, userId);

            return Ok(new
            {
                success = true,
                transactionId = paymentResult.TransactionId,
                bookingDetail = new
                {
                    movieTitle = confirmVm.MovieTitle,
                    cinemaName = confirmVm.CinemaName,
                    roomName = confirmVm.RoomName,
                    startTime = confirmVm.StartTime,
                    seats = confirmVm.Seats,
                    subtotal = confirmVm.Subtotal,
                    discount = confirmVm.Discount,
                    totalPrice = confirmVm.TotalPrice,
                    paymentMethod = confirmVm.PaymentMethod,
                    bookingDate = confirmVm.BookingDate
                }
            });
        }
        catch (ConcurrencyException ex)
        {
            return StatusCode(409, new { error = "Ghế của bạn đã bị người khác đặt mất trong lúc thanh toán. " + ex.Message });
        }
        catch (BusinessException ex)
        {
            return StatusCode(422, new { error = ex.Message });
        }
    }
}

public class ApiHoldSeatsRequest
{
    public int ShowtimeId { get; set; }
    public List<string> SeatCodes { get; set; } = [];
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
}

public class ApiApplyPromoRequest
{
    public string Code { get; set; } = "";
    public decimal Subtotal { get; set; }
}

public class ApiConfirmBookingRequest
{
    public List<int> TicketIds { get; set; } = [];
    public string PaymentMethod { get; set; } = "cash";
    public decimal TotalPrice { get; set; }
    public string? PromotionCode { get; set; }
}
