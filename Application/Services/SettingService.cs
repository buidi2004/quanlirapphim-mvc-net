// SettingService: Service xu ly cac logic nghiep vu (Business Logic) cho Setting
﻿using Microsoft.AspNetCore.Http;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class SettingService(ISettingRepository settingRepository, IImageUploadService imageUploadService) : ISettingService
{
    // Xử lý logic và luồng thực thi cho phương thức GetAllSettingsAsync
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

    // Xử lý logic và luồng thực thi cho phương thức SaveSettingsAsync
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
            var logoUrl = await imageUploadService.UploadImageAsync(site_logo, "settings");
            if (logoUrl != null)
            {
                settings["site_logo"] = logoUrl;
            }
        }

        foreach (var kvp in settings)
        {
            await settingRepository.AddOrUpdateAsync(kvp.Key, kvp.Value);
        }
    }
}
