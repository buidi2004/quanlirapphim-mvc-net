using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CinemaXNet.Core.Exceptions;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("admin/pos")]
public class AdminPosController(IMovieService movieService, ITicketService ticketService) : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.PageTitle = "POS Bán vé tại quầy";
        return View();
    }

    [HttpGet("api/movies")]
    public async Task<IActionResult> GetMoviesToday()
    {
        var movies = await movieService.GetNowShowingAsync();
        return Json(movies);
    }

    [HttpGet("api/showtimes/{movieId}")]
    public async Task<IActionResult> GetShowtimes(int movieId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var tomorrow = today.AddDays(1);
        
        var showtimesToday = await movieService.GetShowtimesByDateAsync(movieId, today);
        var showtimesTomorrow = await movieService.GetShowtimesByDateAsync(movieId, tomorrow);

        var dict = new Dictionary<string, object>();
        if (showtimesToday.Any()) dict[today.ToString("dd/MM/yyyy")] = showtimesToday;
        if (showtimesTomorrow.Any()) dict[tomorrow.ToString("dd/MM/yyyy")] = showtimesTomorrow;

        return Json(dict);
    }

    [HttpGet("api/seatmap/{showtimeId}")]
    public async Task<IActionResult> GetSeatMap(int showtimeId)
    {
        var seatMapVm = await movieService.GetSeatMapViewModelAsync(showtimeId);
        return Json(seatMapVm);
    }

    [HttpPost("api/checkout")]
    public async Task<IActionResult> Checkout([FromBody] PosCheckoutRequest request)
    {
        if (request.SeatCodes == null || request.SeatCodes.Count == 0)
            return BadRequest(new { error = "Vui lòng chọn ghế." });

        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        try
        {
            var holdResult = await ticketService.HoldSeatsAsync(userId, request.ShowtimeId, request.SeatCodes, "guest@cinemax.com", "0000000000");
            
            bool success = await ticketService.ConfirmPaymentAsync(holdResult.TicketIds, userId, "cash_pos", null, null);

            if (success)
            {
                return Json(new { success = true, message = "Thanh toán thành công!", ticketIds = holdResult.TicketIds });
            }
            return BadRequest(new { error = "Lỗi khi xác nhận thanh toán." });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class PosCheckoutRequest
{
    public int ShowtimeId { get; set; }
    public List<string> SeatCodes { get; set; } = new();
}
