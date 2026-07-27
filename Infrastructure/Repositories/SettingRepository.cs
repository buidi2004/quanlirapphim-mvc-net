using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class SettingRepository(IDbConnection db) : ISettingRepository
{
    public async Task<IEnumerable<dynamic>> GetAllAsync()
    {
        return await db.QueryAsync<dynamic>("SELECT * FROM settings");
    }

    public async Task AddOrUpdateAsync(string key, string value)
    {
        var sql = "INSERT INTO settings (setting_key, setting_value) VALUES (@Key, @Value) ON DUPLICATE KEY UPDATE setting_value = @Value";
        await db.ExecuteAsync(sql, new { Key = key, Value = value });
    }
}
