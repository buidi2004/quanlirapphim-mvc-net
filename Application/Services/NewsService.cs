using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class NewsService(INewsRepository newsRepository) : INewsService
{
    private string CreateSlug(string title)
    {
        string slug = title.ToLower().Trim();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        return slug;
    }

    private async Task<string?> UploadImageAsync(IFormFile? image)
    {
        if (image != null && image.Length > 0)
        {
            var ext = Path.GetExtension(image.FileName);
            var newName = $"{Guid.NewGuid():N}{ext}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "news");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, newName);
            await using var stream = System.IO.File.Create(filePath);
            await image.CopyToAsync(stream);
            return "/uploads/news/" + newName;
        }
        return null;
    }

    public async Task<(IEnumerable<dynamic> NewsList, int TotalPages)> GetAllNewsAsync(int page = 1, int pageSize = 10)
    {
        int totalCount = await newsRepository.GetTotalCountAsync();
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var newsList = await newsRepository.GetAllAsync(offset, pageSize);
        return (newsList, totalPages);
    }

    public async Task AddNewsAsync(string title, string excerpt, string content, IFormFile? image)
    {
        string slug = CreateSlug(title);
        string? imageUrl = await UploadImageAsync(image);
        await newsRepository.AddAsync(title, slug, excerpt, content, imageUrl);
    }

    public async Task UpdateNewsAsync(int id, string title, string excerpt, string content, IFormFile? image)
    {
        string slug = CreateSlug(title);
        string? imageUrl = await UploadImageAsync(image);
        await newsRepository.UpdateAsync(id, title, slug, excerpt, content, imageUrl);
    }

    public async Task DeleteNewsAsync(int id)
    {
        await newsRepository.DeleteAsync(id);
    }
}
