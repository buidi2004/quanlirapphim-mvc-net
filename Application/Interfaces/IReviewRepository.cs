using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByMovieIdAsync(int movieId);
    Task<int> AddReviewAsync(Review review);
    Task<IEnumerable<dynamic>> GetAllReviewsAsync(int offset, int limit);
    Task<int> GetTotalReviewsCountAsync();
    Task<dynamic?> GetReviewByIdAsync(int id);
    Task ToggleStatusAsync(int id, bool newStatus);
    Task DeleteReviewAsync(int id);
}
