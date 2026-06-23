using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface ICinemaRepository
{
    Task<IEnumerable<Cinema>> GetAllAsync(string? province = null);
    Task<IEnumerable<string>> GetAllProvincesAsync();
    Task<Cinema?> FindBySlugAsync(string slug);
    Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3);
}
