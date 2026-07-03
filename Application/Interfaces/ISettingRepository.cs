namespace CinemaXNet.Application.Interfaces;

public interface ISettingRepository
{
    Task<IEnumerable<dynamic>> GetAllAsync();
    Task AddOrUpdateAsync(string key, string value);
}
