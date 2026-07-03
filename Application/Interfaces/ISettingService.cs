using Microsoft.AspNetCore.Http;

namespace CinemaXNet.Application.Interfaces;

public interface ISettingService
{
    Task<Dictionary<string, string>> GetAllSettingsAsync();
    Task SaveSettingsAsync(IFormCollection form, IFormFile? site_logo);
}
