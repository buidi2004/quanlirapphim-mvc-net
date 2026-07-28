using System.Text.Json;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CinemaXNet.Infrastructure.Services;

// ImageUploadService: Dịch vụ lưu trữ ảnh tự động linh hoạt
// Nếu cấu hình biến môi trường ImgBB__ApiKey trên Render -> Tự động upload ảnh lên Cloud ImgBB để lưu trữ vĩnh viễn không bị xóa.
// Nếu không cấu hình biến môi trường -> Tự động lưu cục bộ tại wwwroot/uploads.
public class ImageUploadService(IConfiguration configuration, ILogger<ImageUploadService> logger) : IImageUploadService
{
    private static readonly string[] AllowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    public async Task<string?> UploadImageAsync(IFormFile? file, string folderName)
    {
        if (file == null || file.Length == 0) return null;

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExts.Contains(ext))
            throw new InvalidOperationException("Chỉ chấp nhận file ảnh (jpg, png, gif, webp).");

        // 1. Kiểm tra nếu có biến môi trường ImgBB:ApiKey / ImgBB__ApiKey (Cấu hình trên Render Dashboard)
        var imgBbKey = configuration["ImgBB:ApiKey"] ?? configuration["ImgBB__ApiKey"];
        if (!string.IsNullOrWhiteSpace(imgBbKey))
        {
            try
            {
                using var httpClient = new HttpClient();
                using var content = new MultipartFormDataContent();
                using var stream = file.OpenReadStream();
                content.Add(new StreamContent(stream), "image", file.FileName);

                var response = await httpClient.PostAsync($"https://api.imgbb.com/1/upload?key={imgBbKey}", content);
                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonString);
                    var url = doc.RootElement.GetProperty("data").GetProperty("url").GetString();
                    if (!string.IsNullOrEmpty(url))
                    {
                        logger.LogInformation("Upload ảnh lên Cloud ImgBB thành công: {Url}", url);
                        return url;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi upload ảnh lên ImgBB Cloud, chuyển sang lưu cục bộ.");
            }
        }

        // 2. Dự phòng: Lưu ảnh cục bộ vào thư mục wwwroot/uploads/folderName
        var newName = $"{Guid.NewGuid():N}{ext}";
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folderName);
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, newName);
        await using var localStream = System.IO.File.Create(filePath);
        await file.CopyToAsync(localStream);
        return $"/uploads/{folderName}/" + newName;
    }
}
