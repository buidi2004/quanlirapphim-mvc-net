// BannerService: Service xu ly cac logic nghiep vu (Business Logic) cho Banner
﻿using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class BannerService(IBannerRepository bannerRepository, IImageUploadService imageUploadService) : IBannerService
{
    private async Task<string?> UploadImageAsync(IFormFile? image)
    {
        return await imageUploadService.UploadImageAsync(image, "banners");
    }

    // Xử lý logic và luồng thực thi cho phương thức GetAllBannersAsync
    public async Task<IEnumerable<dynamic>> GetAllBannersAsync()
    {
        return await bannerRepository.GetAllAsync();
    }

    // Xử lý logic và luồng thực thi cho phương thức GetActiveBannersAsync
    public async Task<IEnumerable<dynamic>> GetActiveBannersAsync()
    {
        return await bannerRepository.GetActiveAsync();
    }

    // Xử lý logic và luồng thực thi cho phương thức AddBannerAsync
    public async Task AddBannerAsync(string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive)
    {
        string? imageUrl = await UploadImageAsync(image);
        await bannerRepository.AddAsync(title, description, imageUrl, linkUrl, sortOrder, isActive);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateBannerAsync
    public async Task UpdateBannerAsync(int id, string title, string? description, IFormFile? image, string? linkUrl, int sortOrder, bool isActive)
    {
        // Chỉ upload ảnh mới nếu admin có chọn file — tránh ghi đè null lên ảnh cũ
        string? imageUrl = (image != null && image.Length > 0)
            ? await UploadImageAsync(image)
            : null;
        await bannerRepository.UpdateAsync(id, title, description, imageUrl, linkUrl, sortOrder, isActive);
    }

    // Xử lý logic và luồng thực thi cho phương thức DeleteBannerAsync
    public async Task DeleteBannerAsync(int id)
    {
        await bannerRepository.DeleteAsync(id);
    }
}
