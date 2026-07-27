using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class BannerRepository(IDbConnection db) : IBannerRepository
{
    public async Task<IEnumerable<dynamic>> GetAllAsync()
    {
        return await db.QueryAsync<dynamic>("SELECT * FROM banners ORDER BY sort_order ASC, id DESC");
    }

    public async Task<IEnumerable<dynamic>> GetActiveAsync()
    {
        return await db.QueryAsync<dynamic>("SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id DESC");
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM banners");
    }

    public async Task AddAsync(string title, string? description, string? imageUrl, string? linkUrl, int sortOrder, bool isActive)
    {
        var sql = @"INSERT INTO banners (title, description, image_url, link_url, sort_order, is_active) 
                    VALUES (@Title, @Description, @ImageUrl, @LinkUrl, @SortOrder, @IsActive)";
        await db.ExecuteAsync(sql, new { Title = title, Description = description, ImageUrl = imageUrl, LinkUrl = linkUrl, SortOrder = sortOrder, IsActive = isActive });
    }

    public async Task UpdateAsync(int id, string title, string? description, string? imageUrl, string? linkUrl, int sortOrder, bool isActive)
    {
        var sql = @"UPDATE banners SET 
                    title = @Title, description = @Description, 
                    image_url = COALESCE(@ImageUrl, image_url), 
                    link_url = @LinkUrl, sort_order = @SortOrder, is_active = @IsActive 
                    WHERE id = @Id";
        await db.ExecuteAsync(sql, new { Id = id, Title = title, Description = description, ImageUrl = imageUrl, LinkUrl = linkUrl, SortOrder = sortOrder, IsActive = isActive });
    }

    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM banners WHERE id = @Id", new { Id = id });
    }
}
