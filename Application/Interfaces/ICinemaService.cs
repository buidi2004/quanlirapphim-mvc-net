// ICinemaService: Interface dinh nghia cac phuong thuc Hop dong cho ICinema
﻿using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface ICinemaService
{
    Task<IEnumerable<Cinema>> GetAllAsync(string? province = null);
    Task<IEnumerable<string>> GetAllProvincesAsync();
    Task<Cinema>              GetBySlugAsync(string slug);
    Task<bool>                CheckSlugExistsAsync(string slug, int? excludeId = null);
    Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3);
    Task<IEnumerable<Showtime>> GetShowtimesByDateAsync(int cinemaId, DateOnly date);
    Task<IEnumerable<Showtime>> GetGlobalShowtimesByDateAsync(DateOnly date);
    Task<int> CreateAsync(Cinema cinema);
    Task<int> UpdateAsync(int id, Cinema cinema);
    Task<int> DeleteAsync(int id);
}
