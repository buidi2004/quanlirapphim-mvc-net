using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers;

[Route("movies")]
public class MovieController(IMovieService movieService, ITicketService ticketService, IReviewRepository reviewRepo) : Controller
{
    // GET /movies
    [HttpGet("")]
    public async Task<IActionResult> Index(string? genre, string status = "now_showing", int page = 1)
    {
        int pageSize = 12;
        var movies = await movieService.GetFilteredPaginatedAsync(genre, status, page, pageSize);
        ViewBag.Genre  = genre;
        ViewBag.Status = status;
        return View(movies);
    }

    // GET /movies/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detail(int id, string? date = null)
    {
        var movie     = await movieService.GetDetailAsync(id);
        var showDate  = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        var reviews   = await reviewRepo.GetByMovieIdAsync(id);
        var viewModel = MovieDetailViewModel.FromMovie(movie, showtimes, reviews);

        ViewBag.SelectedDate = showDate;
        return View(viewModel);
    }

    // GET /my-tickets
    [Authorize]
    [HttpGet("/my-tickets")]
    public async Task<IActionResult> MyTickets()
    {
        var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tickets = await ticketService.GetUserTicketsAsync(userId);
        ViewBag.PageTitle = "Vé của tôi";
        return View(tickets);
    }
}
