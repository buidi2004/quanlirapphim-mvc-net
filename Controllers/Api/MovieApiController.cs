// MovieApiController: Controller xu ly cac yeu cau HTTP va dieu huong cho MovieApi
﻿using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using CinemaXNet.Application.DTOs;
using CinemaXNet.Domain.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using AutoMapper;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/movies")]
public class MovieApiController(IMovieService movieService, IReviewRepository reviewRepo, ITicketRepository ticketRepo, IMapper mapper) : ControllerBase
{
    [HttpGet("")]
    [ResponseCache(Duration = 300)] // Cache for 5 mins to optimize mobile load
    public async Task<IActionResult> GetMovies(string status = MovieStatus.NowShowing, int page = 1, string? genre = null)
    {
        var movies = await movieService.GetFilteredPaginatedAsync(genre, status, page, 20);
        var dtos = mapper.Map<IEnumerable<MovieSummaryDto>>(movies.Items);
        return Ok(PagedResponse<MovieSummaryDto>.Ok(dtos, movies.PageIndex, movies.TotalPages, movies.HasPreviousPage, movies.HasNextPage));
    }

    // GET /api/movies/box-office
    [HttpGet("box-office")]
    [ResponseCache(Duration = 300)] // Cache for 5 mins
    public async Task<IActionResult> GetBoxOffice()
    {
        var nowShowing = await movieService.GetNowShowingAsync();
        var boxOffice = nowShowing.Take(7).Select(m => new
        {
            id = m.Id,
            title = m.Title,
            ageRating = string.IsNullOrEmpty(m.AgeRating) ? "P" : m.AgeRating,
            duration = m.DurationMinutes,
            releaseDate = m.CreatedAt.ToString("yyyy-MM-dd") // Mock release date for now
        });
        
        return Ok(new { statusCode = 200, data = boxOffice });
    }


    [HttpGet("{id}")]
    // Xử lý logic và luồng thực thi cho phương thức GetMovieDetail
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
    // Xử lý logic và luồng thực thi cho phương thức GetMovieShowtimes
    public async Task<IActionResult> GetMovieShowtimes(int id, string? date = null)
    {
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        return Ok(ApiResponse<object>.Ok(new { date = showDate.ToString("yyyy-MM-dd"), showtimes }));
    }

    public class ReviewRequest
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = "";
    }

    [HttpPost("{id}/reviews")]
    [Authorize]
    // Xử lý logic và luồng thực thi cho phương thức AddReview
    public async Task<IActionResult> AddReview(int id, [FromBody] ReviewRequest req)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            return Unauthorized(ApiResponse<object>.Fail("Invalid user token"));

        var hasWatched = await ticketRepo.HasUserWatchedMovieAsync(userId, id);
        if (!hasWatched)
            return BadRequest(ApiResponse<object>.Fail("Bạn cần mua vé và xem phim này trước khi đánh giá."));

        var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "User";

        var review = new CinemaXNet.Domain.Entities.Review
        {
            MovieId = id,
            UserId = userId,
            Rating = req.Rating,
            Comment = req.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await reviewRepo.AddReviewAsync(review);
        return Ok(ApiResponse<object>.Ok(new { message = "Đánh giá thành công" }));
    }
}
