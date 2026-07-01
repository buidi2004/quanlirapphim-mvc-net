using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface IShowtimeRepository
{
    Task<Showtime?> FindByIdAsync(int id);
    Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date);
    Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateOnly date);
    Task<IEnumerable<Showtime>> GetAllByDateAsync(DateOnly date);
}
