using CinemaXNet.Application.Interfaces;
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
    public IActionResult GetCinemaShowtimes(int id, string? date = null)
    {
        return Ok(new { success = true, showtimes = new object[] {} });
    }
}
