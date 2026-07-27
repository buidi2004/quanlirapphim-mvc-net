namespace CinemaXNet.Application.Interfaces;

public interface IReviewService
{
    Task<(IEnumerable<dynamic> Reviews, int TotalPages)> GetAllReviewsAsync(int page = 1, int pageSize = 10);
    Task<(bool Success, string Message)> ToggleReviewStatusAsync(int id);
    Task DeleteReviewAsync(int id);
}
