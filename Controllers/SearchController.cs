using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("search")]
public class SearchController(IMovieService movieService) : Controller
{
    // GET /search?q=...&genre=...
    [HttpGet("")]
    public async Task<IActionResult> Index(string? q, string? genre)
    {
        var query   = q?.Trim() ?? "";
        var results = Enumerable.Empty<CinemaXNet.Domain.Entities.Movie>();

        if (query.Length > 0)
        {
            results = await movieService.SearchMoviesAsync(query, genre);
        }

        var vm = new SearchViewModel { Query = query, Genre = genre, Results = results };
        ViewBag.PageTitle = query.Length > 0 ? $"Tìm kiếm: {query} — CinemaX" : "Tìm kiếm — CinemaX";
        return View(vm);
    }
}
