using System.Text.Json;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace CinemaXNet.Infrastructure.Services;

// ImageUploadService: Dịch vụ lưu trữ ảnh tự động linh hoạt
// Tự động upload ảnh lên Cloudinary. Nếu không cấu hình -> Tự động lưu cục bộ.
public class ImageUploadService(IConfiguration configuration, ILogger<ImageUploadService> logger) : IImageUploadService
{
    private static readonly string[] AllowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    public async Task<string?> UploadImageAsync(IFormFile? file, string folderName)
    {
        if (file == null || file.Length == 0) return null;

        const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
        if (file.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("Kích thước ảnh không được vượt quá 5MB.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExts.Contains(ext))
            throw new InvalidOperationException("Chỉ chấp nhận file ảnh (jpg, png, gif, webp).");

        // 1. Kiểm tra cấu hình Cloudinary
        var cloudName = configuration["Cloudinary:CloudName"] ?? configuration["Cloudinary__CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"] ?? configuration["Cloudinary__ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"] ?? configuration["Cloudinary__ApiSecret"];

        if (!string.IsNullOrWhiteSpace(cloudName) && !string.IsNullOrWhiteSpace(apiKey) && !string.IsNullOrWhiteSpace(apiSecret))
        {
            try
            {
                Account account = new Account(cloudName, apiKey, apiSecret);
                Cloudinary cloudinary = new Cloudinary(account);
                cloudinary.Api.Secure = true;

                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName,
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                // Kiểm tra kết quả: chấp nhận cả 200 OK lẫn 201 Created
                // SecureUrl != null là dấu hiệu đáng tin cậy nhất để biết upload thành công
                if (uploadResult?.SecureUrl != null)
                {
                    logger.LogInformation("Upload ảnh lên Cloudinary thành công: {Url}", uploadResult.SecureUrl.ToString());
                    return uploadResult.SecureUrl.ToString();
                }

                // Upload xong nhưng không lấy được URL → ném lỗi, không fallback local
                var errorDetail = uploadResult?.Error?.Message ?? $"StatusCode={uploadResult?.StatusCode}";
                logger.LogError("Cloudinary upload không trả về SecureUrl: {Detail}", errorDetail);
                throw new InvalidOperationException($"Upload ảnh thất bại: {errorDetail}");
            }
            catch (InvalidOperationException)
            {
                // Lỗi rõ ràng từ Cloudinary → ném thẳng lên, không fallback local
                throw;
            }
            catch (Exception ex)
            {
                // Lỗi network/timeout → ném lỗi rõ ràng thay vì âm thầm fallback local
                logger.LogError(ex, "Lỗi khi upload ảnh lên Cloudinary.");
                throw new InvalidOperationException("Không thể upload ảnh lên Cloudinary. Vui lòng thử lại sau.", ex);
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

    public async Task DeleteImageAsync(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return;

        // Nếu là URL cloud (Cloudinary / ImgBB), tạm thời không xử lý xóa trên Cloud
        if (imageUrl.StartsWith("http://") || imageUrl.StartsWith("https://"))
        {
            logger.LogInformation("Skip deleting cloud image: {ImageUrl}", imageUrl);
            return;
        }

        // Nếu là local file, xóa từ wwwroot
        try
        {
            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imageUrl.TrimStart('/'));

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                logger.LogInformation("Deleted local image file: {PhysicalPath}", physicalPath);
            }
            else
            {
                logger.LogWarning("Image file not found, skip deletion: {PhysicalPath}", physicalPath);
            }
        }
        catch (Exception ex)
        {
            // Log nhưng không throw - fail gracefully
            logger.LogError(ex, "Error deleting image file: {ImageUrl}", imageUrl);
        }
        await Task.CompletedTask;
    }
}
