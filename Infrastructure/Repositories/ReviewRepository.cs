using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class ReviewRepository(IDbConnection db) : IReviewRepository
{
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

    public Task<int> AddReviewAsync(Review review)
    {
        var sql = """
            INSERT INTO reviews (movie_id, user_id, rating, comment)
            VALUES (@MovieId, @UserId, @Rating, @Comment)
        """;
        
        return db.ExecuteAsync(sql, review);
    }

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

    public async Task<int> GetTotalReviewsCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM reviews");
    }

    public async Task<dynamic?> GetReviewByIdAsync(int id)
    {
        return await db.QuerySingleOrDefaultAsync<dynamic>("SELECT * FROM reviews WHERE id = @Id", new { Id = id });
    }

    public async Task ToggleStatusAsync(int id, bool newStatus)
    {
        await db.ExecuteAsync("UPDATE reviews SET is_approved = @NewStatus WHERE id = @Id", new { NewStatus = newStatus ? 1 : 0, Id = id });
    }

    public async Task DeleteReviewAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM reviews WHERE id = @Id", new { Id = id });
    }
}
