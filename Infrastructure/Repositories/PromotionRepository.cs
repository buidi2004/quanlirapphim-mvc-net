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
        var sql = "INSERT INTO promotions (code, title, description, discount_percent, valid_from, valid_to, is_active) VALUES (@Code, @Title, @Description, @DiscountPercent, @ValidFrom, @ValidTo, @IsActive)";
        return db.ExecuteAsync(sql, (object)promo);
    }

    public Task UpdateAsync(dynamic promo)
    {
        var sql = "UPDATE promotions SET code = @Code, title = @Title, description = @Description, discount_percent = @DiscountPercent, valid_from = @ValidFrom, valid_to = @ValidTo, is_active = @IsActive WHERE id = @Id";
        return db.ExecuteAsync(sql, (object)promo);
    }

    public Task DeleteAsync(int id)
    {
        return db.ExecuteAsync("DELETE FROM promotions WHERE id = @Id", new { Id = id });
    }
}
