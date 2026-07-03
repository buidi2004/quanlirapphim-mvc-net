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
        var sql = "INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (@Key, @Value)";
        await db.ExecuteAsync(sql, new { Key = key, Value = value });
    }
}
