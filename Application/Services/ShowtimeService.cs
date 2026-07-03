using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ShowtimeService(IShowtimeRepository repository) : IShowtimeService
{
    public Task<Showtime?> FindByIdAsync(int id) => repository.FindByIdAsync(id);
    public Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date) => repository.GetByMovieAndDateAsync(movieId, date);
    public Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateOnly date) => repository.GetByCinemaAndDateAsync(cinemaId, date);
    public Task<IEnumerable<Showtime>> GetAllByDateAsync(DateOnly date) => repository.GetAllByDateAsync(date);
    
    public Task<(IEnumerable<Showtime> Items, int TotalCount)> GetPagedAsync(int page, int pageSize) => repository.GetPagedAsync(page, pageSize);
    public Task<IEnumerable<Movie>> GetAllMoviesAsync() => repository.GetAllMoviesAsync();
    public Task<IEnumerable<Room>> GetAllRoomsWithCinemaAsync() => repository.GetAllRoomsWithCinemaAsync();
    
    public Task AddAsync(int movieId, int roomId, string showDate, string startTime, string endTime, decimal price) => repository.AddAsync(movieId, roomId, showDate, startTime, endTime, price);
    public Task UpdateAsync(int id, int movieId, int roomId, string showDate, string startTime, string endTime, decimal price) => repository.UpdateAsync(id, movieId, roomId, showDate, startTime, endTime, price);
    public Task DeleteAsync(int id) => repository.DeleteAsync(id);
}
