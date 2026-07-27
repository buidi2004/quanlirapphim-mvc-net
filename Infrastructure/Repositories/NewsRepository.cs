using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class NewsRepository(IDbConnection db) : INewsRepository
{
    public async Task<IEnumerable<dynamic>> GetAllAsync(int offset, int limit)
    {
        var sql = "SELECT * FROM news ORDER BY id DESC LIMIT @Limit OFFSET @Offset";
        return await db.QueryAsync<dynamic>(sql, new { Limit = limit, Offset = offset });
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM news");
    }

    public async Task AddAsync(string title, string slug, string excerpt, string content, string? imageUrl)
    {
        var sql = "INSERT INTO news (title, slug, excerpt, content, image_url) VALUES (@Title, @Slug, @Excerpt, @Content, @ImageUrl)";
        await db.ExecuteAsync(sql, new { Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
    }

    public async Task UpdateAsync(int id, string title, string slug, string excerpt, string content, string? imageUrl)
    {
        var sql = @"UPDATE news SET 
                    title = @Title, slug = @Slug, excerpt = @Excerpt, content = @Content, 
                    image_url = COALESCE(@ImageUrl, image_url) 
                    WHERE id = @Id";
        await db.ExecuteAsync(sql, new { Id = id, Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
    }

    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM news WHERE id = @Id", new { Id = id });
    }
}
