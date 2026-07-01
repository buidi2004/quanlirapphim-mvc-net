using System.Security.Claims;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize]
[Route("[controller]")]
public class ReviewsController(IReviewRepository reviewRepo) : Controller
{
    [HttpPost("Submit")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit(int MovieId, int Rating, string Comment)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var review = new Review
        {
            MovieId = MovieId,
            UserId = userId,
            Rating = Rating,
            Comment = Comment
        };

        await reviewRepo.AddReviewAsync(review);

        // Redirect back to the movie detail page
        return Redirect($"/movies/{MovieId}");
    }
}
