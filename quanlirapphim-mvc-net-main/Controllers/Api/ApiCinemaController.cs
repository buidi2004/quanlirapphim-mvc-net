using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/cinemas")]
public class ApiCinemaController(ICinemaService cinemaService) : ControllerBase
{
    // GET /api/cinemas
    [HttpGet("")]
    public async Task<IActionResult> GetCinemas([FromQuery] string? province = null)
    {
        try
        {
            var cinemas = await cinemaService.GetAllAsync(province);
            var result = cinemas.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                slug = c.Slug,
                province = c.Province,
                address = c.GetFullAddress(),
                imageUrl = c.GetImageUrl(),
                lat = c.Latitude,
                lng = c.Longitude
            });
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi lấy danh sách rạp: " + ex.Message });
        }
    }

    // GET /api/cinemas/provinces
    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        try
        {
            var provinces = await cinemaService.GetAllProvincesAsync();
            return Ok(new { success = true, data = provinces });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi lấy danh sách tỉnh/thành: " + ex.Message });
        }
    }

    // GET /api/cinemas/nearest?lat=...&lng=...
    [HttpGet("nearest")]
    public async Task<IActionResult> GetNearestCinemas([FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] int limit = 3)
    {
        if (!lat.HasValue || !lng.HasValue)
            return BadRequest(new { error = "Yêu cầu cung cấp tọa độ lat và lng." });

        try
        {
            var cinemas = await cinemaService.FindNearestAsync(lat.Value, lng.Value, limit);
            var result = cinemas.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                slug = c.Slug,
                province = c.Province,
                address = c.GetFullAddress(),
                distance = Math.Round(c.Distance ?? 0, 1),
                imageUrl = c.GetImageUrl(),
                lat = c.Latitude,
                lng = c.Longitude
            });
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi tìm rạp gần nhất: " + ex.Message });
        }
    }

    // GET /api/cinemas/{id:int}/showtimes
    [HttpGet("{id:int}/showtimes")]
    public async Task<IActionResult> GetCinemaShowtimes(int id, [FromQuery] string? date = null)
    {
        try
        {
            var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
            var showtimes = await cinemaService.GetShowtimesByDateAsync(id, showDate);
            var result = showtimes.GroupBy(s => s.Movie).Select(g => new
            {
                movie = new
                {
                    id = g.Key.Id,
                    title = g.Key.Title,
                    duration = g.Key.DurationMinutes, // Changed from Duration
                    genre = g.Key.Genre,
                    posterUrl = g.Key.PosterUrl
                },
                showtimes = g.Select(s => new
                {
                    id = s.Id,
                    roomName = s.Room?.Name ?? "",
                    startTime = s.StartTime,
                    endTime = s.StartTime.AddMinutes(g.Key.DurationMinutes), // Calculated
                    price = s.Price
                })
            });

            return Ok(new
            {
                success = true,
                date = showDate.ToString("yyyy-MM-dd"),
                data = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi lấy lịch chiếu của rạp: " + ex.Message });
        }
    }
}
