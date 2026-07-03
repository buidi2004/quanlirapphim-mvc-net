using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Repositories;

public class MembershipRepository(IDbConnection db) : IMembershipRepository
{
    public async Task<IEnumerable<dynamic>> GetAllTiersAsync()
    {
        var sql = "SELECT * FROM membership_tiers ORDER BY min_spent ASC";
        return await db.QueryAsync<dynamic>(sql);
    }
}
