using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

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

    public async Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset)
    {
        var sql = "SELECT * FROM promotions ORDER BY id DESC LIMIT @limit OFFSET @offset";
        return await db.QueryAsync<dynamic>(sql, new { limit, offset });
    }

    public Task<int> GetCountAsync() => db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM promotions");

    public Task CreateAsync(dynamic promo)
    {
        var sql = "INSERT INTO promotions (code, discount_type, discount_value, max_uses, expires_at, is_active) VALUES (@Code, @DiscountType, @DiscountValue, @MaxUses, @ExpiresAt, @IsActive)";
        return db.ExecuteAsync(sql, (object)promo);
    }

    public Task UpdateAsync(dynamic promo)
    {
        var sql = "UPDATE promotions SET code = @Code, discount_type = @DiscountType, discount_value = @DiscountValue, max_uses = @MaxUses, expires_at = @ExpiresAt, is_active = @IsActive WHERE id = @Id";
        return db.ExecuteAsync(sql, (object)promo);
    }

    public Task DeleteAsync(int id)
    {
        return db.ExecuteAsync("DELETE FROM promotions WHERE id = @Id", new { Id = id });
    }
}
