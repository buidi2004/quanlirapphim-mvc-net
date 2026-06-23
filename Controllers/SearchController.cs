using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace CinemaXNet.Controllers;

[Route("search")]
public class SearchController(IDbConnection db) : Controller
{
    // GET /search?q=...&genre=...
    [HttpGet("")]
    public async Task<IActionResult> Index(string? q, string? genre)
    {
        var query   = q?.Trim() ?? "";
        var results = Enumerable.Empty<CinemaXNet.Models.Domain.Movie>();

        if (query.Length > 0)
        {
            var sql = @"
                SELECT id, title, poster_url AS PosterUrl, genre, status,
                       duration_minutes AS DurationMinutes, age_rating AS AgeRating
                FROM movies WHERE 1=1
                AND (LOWER(title) LIKE @q OR LOWER(genre) LIKE @q OR LOWER(description) LIKE @q)";

            object param;
            if (!string.IsNullOrEmpty(genre))
            {
                sql += " AND genre = @genre";
                param = new { q = $"%{query.ToLower()}%", genre };
            }
            else
            {
                param = new { q = $"%{query.ToLower()}%" };
            }

            sql += " ORDER BY status ASC, title ASC LIMIT 20";
            results = await db.QueryAsync<CinemaXNet.Models.Domain.Movie>(sql, param);
        }

        var vm = new SearchViewModel { Query = query, Genre = genre, Results = results };
        ViewBag.PageTitle = query.Length > 0 ? $"Tìm kiếm: {query} — CinemaX" : "Tìm kiếm — CinemaX";
        return View(vm);
    }
}
