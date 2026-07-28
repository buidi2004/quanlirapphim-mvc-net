using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

// MovieRepository: Đảm nhận toàn bộ các thao tác đọc/ghi dữ liệu liên quan đến Phim trong MySQL Database bằng thư viện Dapper.
public class MovieRepository(IDbConnection db) : IMovieRepository
{
    // Tìm phim theo ID
    public async Task<Movie?> FindByIdAsync(int id)
    {
        // Dùng Cú pháp Aliasing ("column AS Property") để Dapper map tên cột snake_case của MySQL sang PascalCase của C#
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, description, age_rating AS AgeRating, director AS Director, `cast` AS `Cast`, created_at AS CreatedAt FROM movies WHERE id = @id";
        return await db.QueryFirstOrDefaultAsync<Movie>(sql, new { id });
    }

    // Lọc danh sách phim theo Thể loại và Trạng thái (đang chiếu / sắp chiếu)
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

    // Lấy danh sách phim có Phân trang (Phục vụ giao diện Danh sách phim của khách hàng)
    public async Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize)
    {
        var countSql = "SELECT COUNT(*) FROM movies WHERE status = @status";
        var sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies WHERE status = @status";
        
        object param;
        if (genre != null)
        {
            countSql += " AND genre = @genre";
            sql += " AND genre = @genre ORDER BY id DESC LIMIT @limit OFFSET @offset";
            // LIMIT & OFFSET: Thuật toán phân trang SQL tiêu chuẩn (OFFSET = (Số trang - 1) * Kích thước trang)
            param = new { status, genre, limit = pageSize, offset = (pageIndex - 1) * pageSize };
        }
        else
        {
            sql += " ORDER BY id DESC LIMIT @limit OFFSET @offset";
            param = new { status, limit = pageSize, offset = (pageIndex - 1) * pageSize };
        }
        
        // 1. Đếm tổng số bản ghi thỏa điều kiện
        var count = await db.ExecuteScalarAsync<int>(countSql, param);
        // 2. Lấy danh sách phim của trang hiện tại
        var items = await db.QueryAsync<Movie>(sql, param);
        return new PaginatedList<Movie>(items.ToList(), count, pageIndex, pageSize);
    }

    // Lấy toàn bộ danh sách phim (không phân trang)
    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies ORDER BY id DESC";
        return await db.QueryAsync<Movie>(sql);
    }

    // Phân trang danh sách phim phục vụ trang Quản lý Phim Admin
    public async Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize)
    {
        const string countSql = "SELECT COUNT(*) FROM movies";
        const string sql = "SELECT id, title, poster_url AS PosterUrl, genre, status, duration_minutes AS DurationMinutes, age_rating AS AgeRating, created_at AS CreatedAt FROM movies ORDER BY id DESC LIMIT @limit OFFSET @offset";
        
        var count = await db.ExecuteScalarAsync<int>(countSql);
        var items = await db.QueryAsync<Movie>(sql, new { limit = pageSize, offset = (pageIndex - 1) * pageSize });
        return new PaginatedList<Movie>(items.ToList(), count, pageIndex, pageSize);
    }

    // Tìm kiếm phim theo từ khóa (Search bar)
    public async Task<IEnumerable<Movie>> SearchMoviesAsync(string query, string? genre)
    {
        var sql = @"
            SELECT id, title, poster_url AS PosterUrl, genre, status,
                   duration_minutes AS DurationMinutes, age_rating AS AgeRating,
                   director AS Director, `cast` AS `Cast`
            FROM movies WHERE 1=1
            AND (LOWER(title) LIKE @q OR LOWER(genre) LIKE @q OR LOWER(description) LIKE @q)";

        object param;
        if (!string.IsNullOrEmpty(genre))
        {
            sql += " AND genre = @genre";
            // Dùng @q với dấu % bao quanh để tìm kiếm chứa từ khóa (LIKE %query%), Dapper tự động escape chống SQL Injection
            param = new { q = $"%{query.ToLower()}%", genre };
        }
        else
        {
            param = new { q = $"%{query.ToLower()}%" };
        }

        sql += " ORDER BY status ASC, title ASC LIMIT 20";
        return await db.QueryAsync<Movie>(sql, param);
    }

    // Thêm mới Phim
    public async Task<int> CreateAsync(Movie movie)
    {
        const string sql = @"
            INSERT INTO movies (title, poster_url, genre, status, duration_minutes, description, age_rating, director, `cast`)
            VALUES (@Title, @PosterUrl, @Genre, @Status, @DurationMinutes, @Description, @AgeRating, @Director, @Cast);
            SELECT LAST_INSERT_ID();"; // Trả về ID tự tăng vừa chèn
        return await db.ExecuteScalarAsync<int>(sql, movie);
    }

    // Cập nhật thông tin Phim
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
                `cast` = @Cast
            WHERE id = @Id";
        movie.Id = id;
        return await db.ExecuteAsync(sql, movie);
    }

    // Xóa Phim
    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM movies WHERE id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id });
    }
}
