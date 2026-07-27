using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class SettingService(ISettingRepository settingRepository) : ISettingService
{
    public async Task<Dictionary<string, string>> GetAllSettingsAsync()
    {
        var rows = await settingRepository.GetAllAsync();
        var settings = new Dictionary<string, string>();
        foreach (var r in rows)
        {
            settings[r.setting_key] = r.setting_value;
        }
        return settings;
    }

    public async Task SaveSettingsAsync(IFormCollection form, IFormFile? site_logo)
    {
        var settings = new Dictionary<string, string>();
        foreach (var key in form.Keys)
        {
            if (key != "__RequestVerificationToken" && key != "site_logo")
            {
                settings[key] = form[key].ToString();
            }
        }

        if (site_logo != null && site_logo.Length > 0)
        {
            var ext = Path.GetExtension(site_logo.FileName).ToLowerInvariant();
            var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExts.Contains(ext))
                throw new InvalidOperationException("Chỉ chấp nhận file ảnh (jpg, png, gif, webp).");
            var newName = $"logo_{Guid.NewGuid():N}{ext}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "settings");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, newName);
            await using var stream = System.IO.File.Create(filePath);
            await site_logo.CopyToAsync(stream);
            settings["site_logo"] = "/uploads/settings/" + newName;
        }

        foreach (var kvp in settings)
        {
            await settingRepository.AddOrUpdateAsync(kvp.Key, kvp.Value);
        }
    }
}
