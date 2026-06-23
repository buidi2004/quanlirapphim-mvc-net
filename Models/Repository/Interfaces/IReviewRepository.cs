using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByMovieIdAsync(int movieId);
    Task<int> AddReviewAsync(Review review);
}
