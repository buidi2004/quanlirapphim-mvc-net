// ReviewRepository: Repository dam nhan cac thao tac truy van Database cho Review
﻿using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class ReviewRepository(IDbConnection db) : IReviewRepository
{
    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetByMovieIdAsync
    public async Task<IEnumerable<Review>> GetByMovieIdAsync(int movieId)
    {
        var sql = """
            SELECT r.*, u.username
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.movie_id = @MovieId
            ORDER BY r.created_at DESC
        """;

        return await db.QueryAsync<Review, User, Review>(
            sql,
            (review, user) =>
            {
                review.User = user;
                return review;
            },
            new { MovieId = movieId },
            splitOn: "username"
        );
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức AddReviewAsync
    public Task<int> AddReviewAsync(Review review)
    {
        var sql = """
            INSERT INTO reviews (movie_id, user_id, rating, comment)
            VALUES (@MovieId, @UserId, @Rating, @Comment)
        """;
        
        return db.ExecuteAsync(sql, review);
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetAllReviewsAsync
    public async Task<IEnumerable<dynamic>> GetAllReviewsAsync(int offset, int limit)
    {
        var sql = """
            SELECT r.*, u.full_name, m.title AS movie_title
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN movies m ON r.movie_id = m.id
            ORDER BY r.created_at DESC
            LIMIT @Limit OFFSET @Offset
        """;
        return await db.QueryAsync<dynamic>(sql, new { Limit = limit, Offset = offset });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetTotalReviewsCountAsync
    public async Task<int> GetTotalReviewsCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reviews");
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetReviewByIdAsync
    public async Task<dynamic?> GetReviewByIdAsync(int id)
    {
        return await db.QuerySingleOrDefaultAsync<dynamic>("SELECT * FROM reviews WHERE id = @Id", new { Id = id });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức ToggleStatusAsync
    public async Task ToggleStatusAsync(int id, bool newStatus)
    {
        await db.ExecuteAsync("UPDATE reviews SET is_approved = @NewStatus WHERE id = @Id", new { NewStatus = newStatus ? 1 : 0, Id = id });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức DeleteReviewAsync
    public async Task DeleteReviewAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM reviews WHERE id = @Id", new { Id = id });
    }
}
