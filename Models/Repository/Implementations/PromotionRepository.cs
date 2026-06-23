using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

public class PromotionRepository(IDbConnection db) : IPromotionRepository
{
    public async Task<Promotion?> FindByCodeAsync(string code)
    {
        const string sql = @"
            SELECT id, code, discount_type AS DiscountType, discount_value AS DiscountValue,
                   max_uses AS MaxUses, used_count AS UsedCount, expires_at AS ExpiresAt, is_active AS IsActive
            FROM promotions WHERE code = @code";
        return await db.QueryFirstOrDefaultAsync<Promotion>(sql, new { code });
    }
}
