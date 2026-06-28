using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/movies")]
public class ApiMovieController(IMovieService movieService, IReviewRepository reviewRepo) : ControllerBase
{
    // GET /api/movies
    [HttpGet("")]
    public async Task<IActionResult> GetMovies(
        [FromQuery] string? genre,
        [FromQuery] string status = "now_showing",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var movies = await movieService.GetFilteredPaginatedAsync(genre, status, page, pageSize);
            return Ok(new
            {
                success = true,
                data = movies.Items,
                pageIndex = movies.PageIndex,
                totalPages = movies.TotalPages,
                hasPreviousPage = movies.HasPreviousPage,
                hasNextPage = movies.HasNextPage
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi hệ thống khi lấy danh sách phim: " + ex.Message });
        }
    }

    // GET /api/movies/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMovieDetail(int id, [FromQuery] string? date = null)
    {
        try
        {
            var movie = await movieService.GetDetailAsync(id);
            var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
            var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
            var reviews = await reviewRepo.GetByMovieIdAsync(id);

            return Ok(new
            {
                success = true,
                movie = new
                {
                    id = movie.Id,
                    title = movie.Title,
                    description = movie.Description,
                    duration = movie.Duration,
                    releaseDate = movie.ReleaseDate,
                    genre = movie.Genre,
                    director = movie.Director,
                    cast = movie.Cast,
                    rating = movie.Rating,
                    posterUrl = movie.PosterUrl,
                    trailerUrl = movie.TrailerUrl,
                    status = movie.Status
                },
                selectedDate = showDate.ToString("yyyy-MM-dd"),
                showtimes = showtimes.Select(s => new
                {
                    id = s.Id,
                    cinemaId = s.CinemaId,
                    cinemaName = s.CinemaName,
                    roomName = s.RoomName,
                    startTime = s.StartTime,
                    endTime = s.EndTime,
                    price = s.Price,
                    availableSeats = s.AvailableSeats
                }),
                reviews = reviews.Select(r => new
                {
                    id = r.Id,
                    userId = r.UserId,
                    username = r.Username,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt
                })
            });
        }
        catch (Exception ex)
        {
            return NotFound(new { error = "Không tìm thấy phim hoặc có lỗi xảy ra: " + ex.Message });
        }
    }

    // GET /api/movies/{id}/showtimes
    [HttpGet("{id:int}/showtimes")]
    public async Task<IActionResult> GetMovieShowtimes(int id, [FromQuery] string? date = null)
    {
        try
        {
            var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
            var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
            return Ok(new
            {
                success = true,
                date = showDate.ToString("yyyy-MM-dd"),
                showtimes = showtimes.Select(s => new
                {
                    id = s.Id,
                    cinemaId = s.CinemaId,
                    cinemaName = s.CinemaName,
                    roomName = s.RoomName,
                    startTime = s.StartTime,
                    endTime = s.EndTime,
                    price = s.Price,
                    availableSeats = s.AvailableSeats
                })
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Lỗi khi lấy lịch chiếu: " + ex.Message });
        }
    }
}
