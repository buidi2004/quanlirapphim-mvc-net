using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class ShowtimeRepository(IDbConnection db) : IShowtimeRepository
{
    public async Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.cinema_id AS CinemaId, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow,
                   c.id, c.name, c.province, c.district, c.address, c.slug
            FROM showtimes s
            JOIN rooms r ON r.id = s.room_id
            JOIN cinemas c ON c.id = r.cinema_id
            WHERE s.movie_id = @movieId AND s.show_date = @date
            ORDER BY s.start_time";

        var showtimes = await db.QueryAsync<Showtime, Room, Cinema, Showtime>(
            sql,
            (showtime, room, cinema) => 
            { 
                room.Cinema = cinema; 
                showtime.Room = room; 
                return showtime; 
            },
            new { movieId, date = date.ToString("yyyy-MM-dd") },
            splitOn: "id,id"
        );
        return showtimes;
    }

    public async Task<Showtime?> FindByIdAsync(int id)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow,
                   m.id, m.title, m.poster_url AS PosterUrl, m.genre,
                   m.status, m.duration_minutes AS DurationMinutes, m.description, m.age_rating AS AgeRating, m.created_at AS CreatedAt
            FROM showtimes s
            JOIN rooms r ON r.id = s.room_id
            JOIN movies m ON m.id = s.movie_id
            WHERE s.id = @id";

        var result = await db.QueryAsync<Showtime, Room, Movie, Showtime>(
            sql,
            (showtime, room, movie) => { showtime.Room = room; showtime.Movie = movie; return showtime; },
            new { id },
            splitOn: "id,id"
        );
        return result.FirstOrDefault();
    }

    public async Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateOnly date)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.cinema_id AS CinemaId, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow,
                   m.id, m.title, m.poster_url AS PosterUrl, m.genre,
                   m.status, m.duration_minutes AS DurationMinutes, m.description, m.age_rating AS AgeRating, m.created_at AS CreatedAt
            FROM showtimes s
            JOIN rooms r ON r.id = s.room_id
            JOIN movies m ON m.id = s.movie_id
            WHERE r.cinema_id = @cinemaId AND s.show_date = @date
            ORDER BY m.title, s.start_time";

        var showtimes = await db.QueryAsync<Showtime, Room, Movie, Showtime>(
            sql,
            (showtime, room, movie) => { showtime.Room = room; showtime.Movie = movie; return showtime; },
            new { cinemaId, date = date.ToString("yyyy-MM-dd") },
            splitOn: "id,id"
        );
        return showtimes;
    }

    public async Task<IEnumerable<Showtime>> GetAllByDateAsync(DateOnly date)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.cinema_id AS CinemaId, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow,
                   c.id, c.name, c.province, c.district, c.address, c.slug,
                   m.id, m.title, m.poster_url AS PosterUrl, m.genre,
                   m.status, m.duration_minutes AS DurationMinutes, m.description, m.age_rating AS AgeRating, m.created_at AS CreatedAt
            FROM showtimes s
            JOIN rooms r ON r.id = s.room_id
            JOIN cinemas c ON c.id = r.cinema_id
            JOIN movies m ON m.id = s.movie_id
            WHERE s.show_date = @date
            ORDER BY c.province, c.name, m.title, s.start_time";

        var showtimes = await db.QueryAsync<Showtime, Room, Cinema, Movie, Showtime>(
            sql,
            (showtime, room, cinema, movie) => 
            { 
                room.Cinema = cinema;
                showtime.Room = room; 
                showtime.Movie = movie; 
                return showtime; 
            },
            new { date = date.ToString("yyyy-MM-dd") },
            splitOn: "id,id,id"
        );
        return showtimes;
    }

    public async Task<(IEnumerable<Showtime> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        var countSql = "SELECT COUNT(*) FROM showtimes";
        var totalCount = await db.ExecuteScalarAsync<int>(countSql);

        var sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId, s.show_date AS ShowDate, s.start_time AS StartTime, s.price,
                   m.id, m.title,
                   r.id, r.name,
                   c.id, c.name
            FROM showtimes s 
            JOIN movies m ON s.movie_id = m.id 
            JOIN rooms r ON s.room_id = r.id 
            JOIN cinemas c ON r.cinema_id = c.id
            ORDER BY s.show_date DESC, s.start_time DESC
            LIMIT @PageSize OFFSET @Offset
        ";

        var showtimes = await db.QueryAsync<Showtime, Movie, Room, Cinema, Showtime>(
            sql,
            (showtime, movie, room, cinema) =>
            {
                room.Cinema = cinema;
                showtime.Movie = movie;
                showtime.Room = room;
                return showtime;
            },
            new { Offset = offset, PageSize = pageSize },
            splitOn: "id,id,id"
        );

        return (showtimes, totalCount);
    }

    public async Task<IEnumerable<Movie>> GetAllMoviesAsync()
    {
        return await db.QueryAsync<Movie>("SELECT id, title FROM movies ORDER BY id DESC");
    }

    public async Task<IEnumerable<Room>> GetAllRoomsWithCinemaAsync()
    {
        var sql = @"
            SELECT r.id, r.name, c.id, c.name 
            FROM rooms r 
            JOIN cinemas c ON r.cinema_id = c.id 
            ORDER BY c.name, r.name";
        return await db.QueryAsync<Room, Cinema, Room>(
            sql,
            (room, cinema) =>
            {
                room.Cinema = cinema;
                return room;
            },
            splitOn: "id"
        );
    }

    public async Task AddAsync(int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        var sql = "INSERT INTO showtimes (movie_id, room_id, show_date, start_time, end_time, price) VALUES (@MovieId, @RoomId, @ShowDate, @StartTime, @EndTime, @Price)";
        await db.ExecuteAsync(sql, new { MovieId = movieId, RoomId = roomId, ShowDate = showDate, StartTime = startTime, EndTime = endTime, Price = price });
    }

    public async Task UpdateAsync(int id, int movieId, int roomId, string showDate, string startTime, string endTime, decimal price)
    {
        var sql = "UPDATE showtimes SET movie_id = @MovieId, room_id = @RoomId, show_date = @ShowDate, start_time = @StartTime, end_time = @EndTime, price = @Price WHERE id = @Id";
        await db.ExecuteAsync(sql, new { Id = id, MovieId = movieId, RoomId = roomId, ShowDate = showDate, StartTime = startTime, EndTime = endTime, Price = price });
    }

    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM showtimes WHERE id = @Id", new { Id = id });
    }
}
