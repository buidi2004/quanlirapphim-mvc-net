using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class MovieRepository(IDbConnection db) : IMovieRepository
{
    public async Task<Movie?> FindByIdAsync(int id)
    {
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, description, age_rating AS AgeRating, director AS Director, [cast] AS Cast, created_at AS CreatedAt FROM movies WHERE id = @id";
        return await db.QueryFirstOrDefaultAsync<Movie>(sql, new { id });
    }

    public async Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status)
    {
        var sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies WHERE status = @status";
        object param;
        if (genre != null)
        {
            sql += " AND genre = @genre ORDER BY id DESC";
            param = new { status, genre };
        }
        else
        {
            sql += " ORDER BY id DESC";
            param = new { status };
        }
        return await db.QueryAsync<Movie>(sql, param);
    }

    public async Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize)
    {
        var countSql = "SELECT COUNT(*) FROM movies WHERE status = @status";
        var sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies WHERE status = @status";
        
        object param;
        if (genre != null)
        {
            countSql += " AND genre = @genre";
            sql += " AND genre = @genre ORDER BY id DESC LIMIT @limit OFFSET @offset";
            param = new { status, genre, limit = pageSize, offset = (pageIndex - 1) * pageSize };
        }
        else
        {
            sql += " ORDER BY id DESC LIMIT @limit OFFSET @offset";
            param = new { status, limit = pageSize, offset = (pageIndex - 1) * pageSize };
        }
        
        var count = await db.ExecuteScalarAsync<int>(countSql, param);
        var items = await db.QueryAsync<Movie>(sql, param);
        return new PaginatedList<Movie>(items.ToList(), count, pageIndex, pageSize);
    }

    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies ORDER BY id DESC";
        return await db.QueryAsync<Movie>(sql);
    }

    public async Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize)
    {
        const string countSql = "SELECT COUNT(*) FROM movies";
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies ORDER BY id DESC LIMIT @limit OFFSET @offset";
        
        var count = await db.ExecuteScalarAsync<int>(countSql);
        var items = await db.QueryAsync<Movie>(sql, new { limit = pageSize, offset = (pageIndex - 1) * pageSize });
        return new PaginatedList<Movie>(items.ToList(), count, pageIndex, pageSize);
    }

    public async Task<IEnumerable<Movie>> SearchMoviesAsync(string query, string? genre)
    {
        var sql = @"
            SELECT id, title, poster_url AS PosterUrl, genre, status,
                   duration_minutes AS DurationMinutes, age_rating AS AgeRating,
                   director AS Director, [cast] AS Cast
            FROM movies WHERE 1=1
            AND (LOWER(title) LIKE @q OR LOWER(genre) LIKE @q OR LOWER(description) LIKE @q)";

        object param;
        if (!string.IsNullOrEmpty(genre))
        {
            sql += " AND genre = @genre";
            param = new { q = $"%{query.ToLower()}%", genre };
        }
        else
        {
            param = new { q = $"%{query.ToLower()}%" };
        }

        sql += " ORDER BY status ASC, title ASC LIMIT 20";
        return await db.QueryAsync<Movie>(sql, param);
    }

    public async Task<int> CreateAsync(Movie movie)
    {
        const string sql = @"
            INSERT INTO movies (title, poster_url, genre, status, duration_minutes, description, age_rating, director, [cast])
            VALUES (@Title, @PosterUrl, @Genre, @Status, @DurationMinutes, @Description, @AgeRating, @Director, @Cast);
            SELECT last_insert_rowid();";
        return await db.ExecuteScalarAsync<int>(sql, movie);
    }

    public async Task<int> UpdateAsync(int id, Movie movie)
    {
        const string sql = @"
            UPDATE movies 
            SET title = @Title, 
                poster_url = COALESCE(@PosterUrl, poster_url), 
                genre = @Genre, 
                status = @Status, 
                duration_minutes = @DurationMinutes, 
                description = @Description, 
                age_rating = @AgeRating,
                director = @Director,
                [cast] = @Cast
            WHERE id = @Id";
        movie.Id = id;
        return await db.ExecuteAsync(sql, movie);
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM movies WHERE id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id });
    }
}
