using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class CampaignRepository(IDbConnection db) : ICampaignRepository
{
    public async Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset)
    {
        var sql = "SELECT * FROM marketing_campaigns ORDER BY id DESC LIMIT @limit OFFSET @offset";
        return await db.QueryAsync<dynamic>(sql, new { limit, offset });
    }

    public Task<int> GetCountAsync() => db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM marketing_campaigns");

    public Task CreateAsync(dynamic campaign)
    {
        var sql = @"
            INSERT INTO marketing_campaigns (name, type, target_audience, content, status, scheduled_at)
            VALUES (@Name, @Type, @TargetAudience, @Content, 'Scheduled', @ScheduledAt)";
        return db.ExecuteAsync(sql, (object)campaign);
    }
}
