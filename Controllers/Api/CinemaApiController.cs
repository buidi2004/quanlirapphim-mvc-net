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
        var mapped = cinemas.Select(c => new {
            c.Id, c.Name, c.Slug, c.Province, c.District, c.Address,
            c.Phone, c.Email, lat = c.Latitude, lng = c.Longitude,
            c.ImageUrl, c.OpeningHours, c.Description, c.Facilities, c.IsActive,
            c.CreatedAt, c.Distance
        });
        return Ok(new { success = true, data = mapped });
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
        var mapped = cinemas.Select(c => new {
            c.Id, c.Name, c.Slug, c.Province, c.District, c.Address,
            c.Phone, c.Email, lat = c.Latitude, lng = c.Longitude,
            c.ImageUrl, c.OpeningHours, c.Description, c.Facilities, c.IsActive,
            c.CreatedAt, c.Distance
        });
        return Ok(new { success = true, data = mapped });
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
                    durationMinutes = g.First().Movie?.DurationMinutes ?? 0,
                    genre = g.First().Movie?.Genre ?? "Hành Động",
                    posterUrl = g.First().Movie?.PosterUrl ?? ""
                },
                showtimes = g.Select(st => new
                {
                    id = st.Id,
                    roomName = st.Room?.Name ?? "Phòng chiếu",
                    format = st.Format ?? "2D",
                    startTime = st.StartTime.ToString("HH:mm"),
                    endTime = st.StartTime.AddMinutes(g.First().Movie?.DurationMinutes ?? 120).ToString("HH:mm"),
                    price = st.Price
                }).OrderBy(st => st.startTime).ToList()
            }).ToList();

        // mobile app expects { success: true, data: { date, items } }
        return Ok(ApiResponse<object>.Ok(new { date = showDate.ToString("yyyy-MM-dd"), items = grouped }));
    }

    [HttpGet("global-showtimes")]
    public async Task<IActionResult> GetGlobalShowtimes(string? date = null)
    {
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var cinemas = await cinemaService.GetAllAsync(null);
        var result = new List<object>();

        var groupedByProvince = cinemas.GroupBy(c => c.Province ?? "Khác").ToList();

        foreach (var provinceGroup in groupedByProvince)
        {
            var provinceCinemas = new List<object>();
            foreach (var cinema in provinceGroup)
            {
                var showtimes = await cinemaService.GetShowtimesByDateAsync(cinema.Id, showDate);
                if (!showtimes.Any()) continue;

                var groupedMovies = showtimes
                    .GroupBy(s => s.MovieId)
                    .Select(g => new
                    {
                        id = g.Key,
                        title = g.First().Movie?.Title ?? "Unknown",
                        rating = g.First().Movie?.AgeRating ?? "P",
                        durationMinutes = g.First().Movie?.DurationMinutes ?? 0,
                        times = g.Select(st => new { time = st.StartTime.ToString("HH:mm"), format = st.Format }).OrderBy(t => t.time).ToList()
                    }).ToList();

                if (groupedMovies.Any())
                {
                    provinceCinemas.Add(new
                    {
                        id = cinema.Id,
                        name = cinema.Name,
                        address = cinema.Address,
                        movies = groupedMovies
                    });
                }
            }

            if (provinceCinemas.Any())
            {
                result.Add(new
                {
                    province = provinceGroup.Key,
                    cinemas = provinceCinemas
                });
            }
        }

        return Ok(new { success = true, data = result });
    }
}
