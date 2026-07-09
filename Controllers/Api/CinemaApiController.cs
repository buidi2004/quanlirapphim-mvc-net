using System;
using System.Linq;
using System.Threading.Tasks;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/cinemas")]
public class CinemaApiController(ICinemaService cinemaService) : ControllerBase
{
    [HttpGet("")]
    public async Task<IActionResult> GetCinemas(string? province = null)
    {
        var cinemas = await cinemaService.GetAllAsync(province);
        return Ok(new { success = true, data = cinemas });
    }

    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        var provinces = await cinemaService.GetAllProvincesAsync();
        return Ok(new { success = true, data = provinces });
    }

    [HttpGet("nearest")]
    public async Task<IActionResult> GetNearestCinemas(double lat, double lng, int limit = 3)
    {
        var cinemas = await cinemaService.FindNearestAsync(lat, lng, limit);
        return Ok(new { success = true, data = cinemas });
    }

    [HttpGet("{id}/showtimes")]
    public async Task<IActionResult> GetCinemaShowtimes(int id, string? date = null)
    {
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await cinemaService.GetShowtimesByDateAsync(id, showDate);

        var grouped = showtimes
            .GroupBy(s => s.MovieId)
            .Select(g => new
            {
                movie = new
                {
                    id = g.First().Movie?.Id ?? g.Key,
                    title = g.First().Movie?.Title ?? "Unknown",
                    duration = g.First().Movie?.DurationMinutes ?? 0,
                    genre = "Hành Động", // fallback if not in Movie entity or if it's there
                    posterUrl = g.First().Movie?.PosterUrl ?? ""
                },
                showtimes = g.Select(st => new
                {
                    id = st.Id,
                    roomName = st.Room?.Name ?? "Phòng chiếu",
                    startTime = st.StartTime.ToString("HH:mm")
                }).OrderBy(st => st.startTime).ToList()
            }).ToList();

        // mobile app expects { success: true, data: grouped }
        return Ok(ApiResponse<object>.Ok(grouped));
    }
}
