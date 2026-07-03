using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class PricingRuleRepository(IDbConnection db) : IPricingRuleRepository
{
    public async Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset)
    {
        var sql = "SELECT * FROM pricing_rules ORDER BY id DESC LIMIT @limit OFFSET @offset";
        return await db.QueryAsync<dynamic>(sql, new { limit, offset });
    }

    public Task<int> GetCountAsync() => db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM pricing_rules");
}
