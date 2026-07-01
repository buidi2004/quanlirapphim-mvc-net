using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("cinemas")]
public class CinemaController(ICinemaService cinemaService) : Controller
{
    // GET /cinemas
    [HttpGet("")]
    public async Task<IActionResult> Index(string? province = null)
    {
        var cinemas   = await cinemaService.GetAllAsync(province);
        var provinces = await cinemaService.GetAllProvincesAsync();

        ViewBag.Cinemas          = cinemas;
        ViewBag.Provinces        = provinces;
        ViewBag.SelectedProvince = province;
        ViewBag.PageTitle        = "Hệ thống rạp — CinemaX";
        return View();
    }

    // GET /cinemas/showtimes
    [HttpGet("showtimes")]
    public async Task<IActionResult> GlobalShowtimes(string? date = null)
    {
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await cinemaService.GetGlobalShowtimesByDateAsync(showDate);
        
        ViewBag.ShowDate = showDate;
        ViewBag.Showtimes = showtimes;
        ViewBag.PageTitle = "Lịch chiếu toàn quốc — CinemaX";
        return View();
    }

    // GET /cinemas/{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug, string? date = null)
    {
        try
        {
            var cinema = await cinemaService.GetBySlugAsync(slug);
            var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
            var showtimes = await cinemaService.GetShowtimesByDateAsync(cinema.Id, showDate);
            
            ViewBag.ShowDate = showDate;
            ViewBag.Showtimes = showtimes.GroupBy(s => s.Movie).ToList();
            ViewBag.PageTitle = $"{cinema.Name} — CinemaX";
            return View(cinema);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }

    // GET /api/cinemas/nearest?lat=...&lng=...
    [HttpGet("/api/cinemas/nearest")]
    public async Task<IActionResult> Nearest(double? lat, double? lng)
    {
        if (!lat.HasValue || !lng.HasValue)
            return BadRequest(new { error = "Thiếu tham số lat hoặc lng" });

        try
        {
            var cinemas = await cinemaService.FindNearestAsync(lat.Value, lng.Value, 3);
            var result = cinemas.Select(c => new
            {
                id       = c.Id,
                name     = c.Name,
                slug     = c.Slug,
                province = c.Province,
                address  = c.GetFullAddress(),
                distance = Math.Round(c.Distance ?? 0, 1),
                imageUrl = c.GetImageUrl()
            });
            return Json(new { success = true, data = result });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Lỗi server khi tìm rạp gần nhất" });
        }
    }
}
