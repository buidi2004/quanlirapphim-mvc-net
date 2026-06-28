using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers;

[Authorize]
[Route("booking")]
public class BookingController(
    ITicketService ticketService,
    IMovieService movieService,
    IPromotionService promotionService,
    ICinemaService cinemaService,
    CinemaXNet.Models.Repository.Interfaces.IShowtimeRepository showtimeRepo) : Controller
{
    // GET /booking/{showtimeId}
    [AllowAnonymous]
    [HttpGet("{showtimeId:int}")]
    public async Task<IActionResult> SeatMap(int showtimeId)
    {
        var seatMapVm = await movieService.GetSeatMapViewModelAsync(showtimeId);
        return View(seatMapVm);
    }

    // POST /booking/hold
    [AllowAnonymous]
    [HttpPost("hold")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HoldSeats([FromForm] int showtimeId, [FromForm] List<string> seatCodes, [FromForm] string? guestEmail, [FromForm] string? guestPhone)
    {
        if (seatCodes.Count == 0)
            return Json(new { error = "Vui lòng chọn ít nhất 1 ghế." });

        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
        else if (string.IsNullOrWhiteSpace(guestEmail) || string.IsNullOrWhiteSpace(guestPhone))
        {
            return Json(new { error = "Vui lòng đăng nhập hoặc nhập thông tin khách." });
        }

        try
        {
            var holdResult = await ticketService.HoldSeatsAsync(userId, showtimeId, seatCodes, guestEmail, guestPhone);
            HttpContext.Session.SetString("pending_ticket_ids",
                System.Text.Json.JsonSerializer.Serialize(holdResult.TicketIds));

            return Json(new
            {
                success            = true,
                redirectUrl        = "/booking/concessions",
                expiryTime         = holdResult.ExpiryTime,
                remainingSeconds   = holdResult.GetRemainingSeconds()
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

    // GET /booking/concessions
    [AllowAnonymous]
    [HttpGet("concessions")]
    public IActionResult Concessions()
    {
        var ticketIdsJson = HttpContext.Session.GetString("pending_ticket_ids");
        if (string.IsNullOrEmpty(ticketIdsJson)) return Redirect("/");

        return View();
    }

    // POST /booking/save-concessions
    [AllowAnonymous]
    [HttpPost("save-concessions")]
    [ValidateAntiForgeryToken]
    public IActionResult SaveConcessions([FromForm] string? concessionsData)
    {
        if (!string.IsNullOrEmpty(concessionsData))
        {
            HttpContext.Session.SetString("selected_concessions", concessionsData);
        }
        else
        {
            HttpContext.Session.Remove("selected_concessions");
        }
        return Redirect("/payment");
    }

    // POST /booking/apply-promo (AJAX)
    [AllowAnonymous]
    [HttpPost("apply-promo")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ApplyPromo([FromForm] string code, [FromForm] decimal subtotal)
    {
        try
        {
            var result = await promotionService.ApplyPromotionAsync(code, subtotal);
            return Json(new
            {
                success    = true,
                discount   = result.Discount,
                totalPrice = result.TotalPrice
            });
        }
        catch (BusinessException ex)
        {
            return StatusCode(422, new { error = ex.Message });
        }
    }

    // GET /booking/fast
    [AllowAnonymous]
    [HttpGet("fast")]
    public async Task<IActionResult> Fast()
    {
        ViewBag.PageTitle = "Mua Vé Nhanh — CinemaX";
        var movies = await movieService.GetNowShowingAsync();
        var cinemas = await cinemaService.GetAllAsync();
        ViewBag.Movies = movies;
        ViewBag.Cinemas = cinemas;
        return View();
    }

    // API endpoints for Quick Booking & Matrix
    [AllowAnonymous]
    [HttpGet("/api/quickbooking/cinemas")]
    public async Task<IActionResult> GetCinemasForMovie([FromQuery] int movieId)
    {
        // Currently we just return all cinemas for simplicity in demo
        var cinemas = await cinemaService.GetAllAsync();
        return Json(cinemas.Select(c => new { id = c.Id, name = c.Name }));
    }

    [AllowAnonymous]
    [HttpGet("/api/quickbooking/dates")]
    public IActionResult GetDatesForMovieAndCinema([FromQuery] int movieId, [FromQuery] int cinemaId)
    {
        var dates = new List<object>();
        for(int i=0; i<7; i++) {
            var d = DateTime.Today.AddDays(i);
            dates.Add(new { value = d.ToString("yyyy-MM-dd"), formatted = d.ToString("dd/MM/yyyy") });
        }
        return Json(dates);
    }

    [AllowAnonymous]
    [HttpGet("/api/quickbooking/showtimes")]
    public async Task<IActionResult> GetShowtimes([FromQuery] int movieId, [FromQuery] int cinemaId, [FromQuery] string date)
    {
        var d = DateOnly.Parse(date);
        var showtimes = await showtimeRepo.GetByCinemaAndDateAsync(cinemaId, d);
        // Filter by movie
        var filtered = showtimes.Where(s => s.MovieId == movieId).OrderBy(s => s.StartTime).ToList();

        return Json(filtered.Select(s => new { id = s.Id, time = s.StartTime }));
    }
}
