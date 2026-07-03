using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IShowtimeRepository
{
    Task<Showtime?> FindByIdAsync(int id);
    Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date);
    Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateOnly date);
    Task<IEnumerable<Showtime>> GetAllByDateAsync(DateOnly date);
    
    Task<(IEnumerable<Showtime> Items, int TotalCount)> GetPagedAsync(int page, int pageSize);
    Task<IEnumerable<Movie>> GetAllMoviesAsync();
    Task<IEnumerable<Room>> GetAllRoomsWithCinemaAsync();
    
    Task AddAsync(int movieId, int roomId, string showDate, string startTime, string endTime, decimal price);
    Task UpdateAsync(int id, int movieId, int roomId, string showDate, string startTime, string endTime, decimal price);
    Task DeleteAsync(int id);
}
