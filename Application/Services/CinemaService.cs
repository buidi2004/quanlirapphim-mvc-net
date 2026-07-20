using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

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

    public Task<int> CreateAsync(Cinema cinema) =>
        cinemaRepo.CreateAsync(cinema);

    public Task<int> UpdateAsync(int id, Cinema cinema) =>
        cinemaRepo.UpdateAsync(id, cinema);

    public Task<int> DeleteAsync(int id) =>
        cinemaRepo.DeleteAsync(id);
}
