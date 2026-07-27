using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ShowtimeService(IShowtimeRepository repository, ITicketRepository ticketRepository) : IShowtimeService
{
    public Task<Showtime?> FindByIdAsync(int id) => repository.FindByIdAsync(id);
    public Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date) => repository.GetByMovieAndDateAsync(movieId, date);
    public Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateOnly date) => repository.GetByCinemaAndDateAsync(cinemaId, date);
    public Task<IEnumerable<Showtime>> GetAllByDateAsync(DateOnly date) => repository.GetAllByDateAsync(date);
    
    public Task<(IEnumerable<Showtime> Items, int TotalCount)> GetPagedAsync(int page, int pageSize) => repository.GetPagedAsync(page, pageSize);
    public Task<IEnumerable<Movie>> GetAllMoviesAsync() => repository.GetAllMoviesAsync();
    public Task<IEnumerable<Room>> GetAllRoomsWithCinemaAsync() => repository.GetAllRoomsWithCinemaAsync();
    
    public async Task AddAsync(int movieId, int roomId, string showDate, string startTime, string format, decimal price) => 
        await repository.AddAsync(movieId, roomId, showDate, startTime, format, price);
        
    public async Task UpdateAsync(int id, int movieId, int roomId, string showDate, string startTime, string format, decimal price) => 
        await repository.UpdateAsync(id, movieId, roomId, showDate, startTime, format, price);
    public async Task DeleteAsync(int id)
    {
        if (await ticketRepository.HasActiveTicketsForShowtimeAsync(id))
            throw new CinemaXNet.Domain.Exceptions.BusinessException("Không thể xóa suất chiếu này vì đã có vé được thanh toán.");
        await repository.DeleteAsync(id);
    }
}
