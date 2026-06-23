using CinemaXNet.Models.Domain;
using CinemaXNet.ViewModels;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface IMovieRepository
{
    Task<Movie?> FindByIdAsync(int id);
    Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status);
    Task<IEnumerable<Movie>> GetAllAsync();
    
    Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize);
    Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize);

    Task<int> CreateAsync(Movie movie);
    Task<int> UpdateAsync(int id, Movie movie);
    Task<int> DeleteAsync(int id);
}
