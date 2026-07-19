using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface IMovieService
{
    Task<IEnumerable<Movie>> GetNowShowingAsync();
    Task<IEnumerable<Movie>> GetComingSoonAsync();
    Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status);
    Task<IEnumerable<Movie>> GetAllAsync();
    
    Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize);
    Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize);
    
    Task<IEnumerable<Movie>> SearchMoviesAsync(string query, string? genre);
    Task<Movie> GetDetailAsync(int movieId);
    Task<IEnumerable<ShowtimeSummary>> GetShowtimesByDateAsync(int movieId, DateOnly date);
    Task<SeatMapViewModel> GetSeatMapViewModelAsync(int showtimeId);
    Task<int> CreateMovieAsync(CinemaXNet.Domain.Entities.Movie movie);
    Task<int> UpdateMovieAsync(int id, CinemaXNet.Domain.Entities.Movie movie);
    Task<int> DeleteMovieAsync(int id);
}
