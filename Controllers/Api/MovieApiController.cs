using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using CinemaXNet.Application.DTOs;
using CinemaXNet.Domain.Constants;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/movies")]
public class MovieApiController(IMovieService movieService, IReviewRepository reviewRepo, IMapper mapper) : ControllerBase
{
    [HttpGet("")]
    [ResponseCache(Duration = 300)] // Cache for 5 mins to optimize mobile load
    public async Task<IActionResult> GetMovies(string status = MovieStatus.NowShowing, int page = 1, string? genre = null)
    {
        var movies = await movieService.GetFilteredPaginatedAsync(genre, status, page, 20);
        var dtos = mapper.Map<IEnumerable<MovieSummaryDto>>(movies.Items);
        return Ok(PagedResponse<MovieSummaryDto>.Ok(dtos, movies.PageIndex, movies.TotalPages, movies.HasPreviousPage, movies.HasNextPage));
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieDetail(int id, string? date = null)
    {
        var movie = await movieService.GetDetailAsync(id);
        if (movie == null) return NotFound(ApiResponse<object>.Fail("Không tìm thấy phim."));
        
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        var reviews = await reviewRepo.GetByMovieIdAsync(id);
        
        return Ok(ApiResponse<object>.Ok(new { movie, selectedDate = showDate.ToString("yyyy-MM-dd"), showtimes, reviews }));
    }

    [HttpGet("{id}/showtimes")]
    public async Task<IActionResult> GetMovieShowtimes(int id, string? date = null)
    {
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        return Ok(ApiResponse<object>.Ok(new { date = showDate.ToString("yyyy-MM-dd"), showtimes }));
    }
}
