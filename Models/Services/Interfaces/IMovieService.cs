using CinemaXNet.Models.Domain;
using CinemaXNet.ViewModels;

namespace CinemaXNet.Models.Services.Interfaces;

public interface IMovieService
{
    Task<IEnumerable<Movie>> GetNowShowingAsync();
    Task<IEnumerable<Movie>> GetComingSoonAsync();
    Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status);
    Task<IEnumerable<Movie>> GetAllAsync();
    
    Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize);
    Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize);
    
    Task<Movie> GetDetailAsync(int movieId);
    Task<IEnumerable<ShowtimeSummary>> GetShowtimesByDateAsync(int movieId, DateOnly date);
    Task<SeatMapViewModel> GetSeatMapViewModelAsync(int showtimeId);
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<int> CreateMovieAsync(CinemaXNet.Models.Domain.Movie movie);
    Task<int> UpdateMovieAsync(int id, CinemaXNet.Models.Domain.Movie movie);
    Task<int> DeleteMovieAsync(int id);
}
