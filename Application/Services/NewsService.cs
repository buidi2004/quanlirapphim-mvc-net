// NewsService: Service xu ly cac logic nghiep vu (Business Logic) cho News
﻿using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class NewsService(INewsRepository newsRepository, IImageUploadService imageUploadService) : INewsService
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
        return await imageUploadService.UploadImageAsync(image, "news");
    }

    // Xử lý logic và luồng thực thi cho phương thức NewsList
    public async Task<(IEnumerable<dynamic> NewsList, int TotalPages)> GetAllNewsAsync(int page = 1, int pageSize = 10)
    {
        int totalCount = await newsRepository.GetTotalCountAsync();
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var newsList = await newsRepository.GetAllAsync(offset, pageSize);
        return (newsList, totalPages);
    }

    // Xử lý logic và luồng thực thi cho phương thức AddNewsAsync
    public async Task AddNewsAsync(string title, string excerpt, string content, IFormFile? image)
    {
        string slug = CreateSlug(title);
        string? imageUrl = await UploadImageAsync(image);
        await newsRepository.AddAsync(title, slug, excerpt, content, imageUrl);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateNewsAsync
    public async Task UpdateNewsAsync(int id, string title, string excerpt, string content, IFormFile? image)
    {
        string slug = CreateSlug(title);
        // Chỉ upload ảnh mới nếu admin có chọn file — tránh gọi Cloudinary không cần thiết
        string? imageUrl = (image != null && image.Length > 0)
            ? await UploadImageAsync(image)
            : null;
        await newsRepository.UpdateAsync(id, title, slug, excerpt, content, imageUrl);
    }

    // Xử lý logic và luồng thực thi cho phương thức DeleteNewsAsync
    public async Task DeleteNewsAsync(int id)
    {
        await newsRepository.DeleteAsync(id);
    }
}
