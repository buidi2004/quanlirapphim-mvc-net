// CinemaService: Service xu ly cac logic nghiep vu (Business Logic) cho Cinema
﻿using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class CinemaService(ICinemaRepository cinemaRepo, IShowtimeRepository showtimeRepo) : ICinemaService
{
    // Xử lý logic và luồng thực thi cho phương thức GetAllAsync
    public Task<IEnumerable<Cinema>> GetAllAsync(string? province = null) =>
        cinemaRepo.GetAllAsync(province);

    // Xử lý logic và luồng thực thi cho phương thức GetAllProvincesAsync
    public Task<IEnumerable<string>> GetAllProvincesAsync() =>
        cinemaRepo.GetAllProvincesAsync();

    // Xử lý logic và luồng thực thi cho phương thức GetBySlugAsync
    public async Task<Cinema> GetBySlugAsync(string slug)
    {
        var cinema = await cinemaRepo.FindBySlugAsync(slug);
        return cinema ?? throw new NotFoundException($"Không tìm thấy rạp '{slug}'");
    }

    // Xử lý logic và luồng thực thi cho phương thức FindNearestAsync
    public Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3) =>
        cinemaRepo.FindNearestAsync(lat, lng, limit);

    // Xử lý logic và luồng thực thi cho phương thức GetShowtimesByDateAsync
    public Task<IEnumerable<Showtime>> GetShowtimesByDateAsync(int cinemaId, DateOnly date) =>
        showtimeRepo.GetByCinemaAndDateAsync(cinemaId, date);

    // Xử lý logic và luồng thực thi cho phương thức GetGlobalShowtimesByDateAsync
    public Task<IEnumerable<Showtime>> GetGlobalShowtimesByDateAsync(DateOnly date) =>
        showtimeRepo.GetAllByDateAsync(date);

    // Xử lý logic và luồng thực thi cho phương thức CreateAsync
    public Task<int> CreateAsync(Cinema cinema) =>
        cinemaRepo.CreateAsync(cinema);

    // Xử lý logic và luồng thực thi cho phương thức UpdateAsync
    public Task<int> UpdateAsync(int id, Cinema cinema) =>
        cinemaRepo.UpdateAsync(id, cinema);

    // Xử lý logic và luồng thực thi cho phương thức DeleteAsync
    public Task<int> DeleteAsync(int id) =>
        cinemaRepo.DeleteAsync(id);
}
