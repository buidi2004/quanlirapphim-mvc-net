using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Services.Interfaces;

public interface ICinemaService
{
    Task<IEnumerable<Cinema>> GetAllAsync(string? province = null);
    Task<IEnumerable<string>> GetAllProvincesAsync();
    Task<Cinema>              GetBySlugAsync(string slug);
    Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3);
    Task<IEnumerable<Showtime>> GetShowtimesByDateAsync(int cinemaId, DateOnly date);
    Task<IEnumerable<Showtime>> GetGlobalShowtimesByDateAsync(DateOnly date);
}
