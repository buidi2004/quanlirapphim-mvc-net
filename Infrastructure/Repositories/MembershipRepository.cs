// MembershipRepository: Repository dam nhan cac thao tac truy van Database cho Membership
﻿using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Repositories;

public class MembershipRepository(IDbConnection db) : IMembershipRepository
{
    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetAllTiersAsync
    public async Task<IEnumerable<dynamic>> GetAllTiersAsync()
    {
        var sql = "SELECT * FROM membership_tiers ORDER BY min_spent ASC";
        return await db.QueryAsync<dynamic>(sql);
    }
}
