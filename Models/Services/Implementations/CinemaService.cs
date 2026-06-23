using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;

namespace CinemaXNet.Models.Services.Implementations;

public class CinemaService(ICinemaRepository cinemaRepo, IShowtimeRepository showtimeRepo) : ICinemaService
{
    public Task<IEnumerable<Cinema>> GetAllAsync(string? province = null) =>
        cinemaRepo.GetAllAsync(province);

    public Task<IEnumerable<string>> GetAllProvincesAsync() =>
        cinemaRepo.GetAllProvincesAsync();

    public async Task<Cinema> GetBySlugAsync(string slug)
    {
        var cinema = await cinemaRepo.FindBySlugAsync(slug);
        return cinema ?? throw new NotFoundException($"Không tìm thấy rạp '{slug}'");
    }

    public Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3) =>
        cinemaRepo.FindNearestAsync(lat, lng, limit);

    public Task<IEnumerable<Showtime>> GetShowtimesByDateAsync(int cinemaId, DateOnly date) =>
        showtimeRepo.GetByCinemaAndDateAsync(cinemaId, date);

    public Task<IEnumerable<Showtime>> GetGlobalShowtimesByDateAsync(DateOnly date) =>
        showtimeRepo.GetAllByDateAsync(date);
}
