using Microsoft.AspNetCore.Http;

namespace CinemaXNet.Application.Interfaces;

public interface IBannerService
{
    Task<IEnumerable<dynamic>> GetAllBannersAsync();
    Task<IEnumerable<dynamic>> GetActiveBannersAsync();
    Task AddBannerAsync(string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive);
    Task UpdateBannerAsync(int id, string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive);
    Task DeleteBannerAsync(int id);
}
