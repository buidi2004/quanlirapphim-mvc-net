using Microsoft.AspNetCore.Http;

namespace CinemaXNet.Application.Interfaces;

// IImageUploadService: Interface hợp đồng cho dịch vụ lưu trữ ảnh (Hỗ trợ Cloud ImgBB & Local Storage)
public interface IImageUploadService
{
    Task<string?> UploadImageAsync(IFormFile? file, string folderName);
}
