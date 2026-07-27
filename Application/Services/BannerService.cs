using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class BannerService(IBannerRepository bannerRepository) : IBannerService
{
    private static readonly string[] AllowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    private async Task<string?> UploadImageAsync(IFormFile? image)
    {
        if (image != null && image.Length > 0)
        {
            var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!AllowedImageExts.Contains(ext))
                throw new InvalidOperationException("Chỉ chấp nhận file ảnh (jpg, png, gif, webp).");
            var newName = $"{Guid.NewGuid():N}{ext}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "banners");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, newName);
            await using var stream = System.IO.File.Create(filePath);
            await image.CopyToAsync(stream);
            return "/uploads/banners/" + newName;
        }
        return null;
    }

    public async Task<IEnumerable<dynamic>> GetAllBannersAsync()
    {
        return await bannerRepository.GetAllAsync();
    }

    public async Task<IEnumerable<dynamic>> GetActiveBannersAsync()
    {
        return await bannerRepository.GetActiveAsync();
    }

    public async Task AddBannerAsync(string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive)
    {
        string? imageUrl = await UploadImageAsync(image);
        await bannerRepository.AddAsync(title, description, imageUrl, linkUrl, sortOrder, isActive);
    }

    public async Task UpdateBannerAsync(int id, string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive)
    {
        string? imageUrl = await UploadImageAsync(image);
        await bannerRepository.UpdateAsync(id, title, description, imageUrl, linkUrl, sortOrder, isActive);
    }

    public async Task DeleteBannerAsync(int id)
    {
        await bannerRepository.DeleteAsync(id);
    }
}
