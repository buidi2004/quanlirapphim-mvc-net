using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

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
}
