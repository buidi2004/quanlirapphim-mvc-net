using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface IMovieRepository
{
    Task<Movie?> FindByIdAsync(int id);
    Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status);
    Task<IEnumerable<Movie>> GetAllAsync();
    
    Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize);
    Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize);
    Task<IEnumerable<Movie>> SearchMoviesAsync(string query, string? genre);
    Task<int> CreateAsync(Movie movie);
    Task<int> UpdateAsync(int id, Movie movie);
    Task<int> DeleteAsync(int id);
}
