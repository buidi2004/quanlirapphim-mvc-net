// NewsRepository: Repository dam nhan cac thao tac truy van Database cho News
﻿using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class NewsRepository(IDbConnection db) : INewsRepository
{
    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetAllAsync
    public async Task<IEnumerable<dynamic>> GetAllAsync(int offset, int limit)
    {
        var sql = "SELECT * FROM news ORDER BY id DESC LIMIT @Limit OFFSET @Offset";
        return await db.QueryAsync<dynamic>(sql, new { Limit = limit, Offset = offset });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetTotalCountAsync
    public async Task<int> GetTotalCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM news");
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức AddAsync
    public async Task AddAsync(string title, string slug, string excerpt, string content, string? imageUrl)
    {
        var sql = "INSERT INTO news (title, slug, excerpt, content, image_url) VALUES (@Title, @Slug, @Excerpt, @Content, @ImageUrl)";
        await db.ExecuteAsync(sql, new { Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateAsync
    public async Task UpdateAsync(int id, string title, string slug, string excerpt, string content, string? imageUrl)
    {
        var sql = @"UPDATE news SET 
                    title = @Title, slug = @Slug, excerpt = @Excerpt, content = @Content, 
                    image_url = COALESCE(@ImageUrl, image_url) 
                    WHERE id = @Id";
        await db.ExecuteAsync(sql, new { Id = id, Title = title, Slug = slug, Excerpt = excerpt, Content = content, ImageUrl = imageUrl });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức DeleteAsync
    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM news WHERE id = @Id", new { Id = id });
    }
}
