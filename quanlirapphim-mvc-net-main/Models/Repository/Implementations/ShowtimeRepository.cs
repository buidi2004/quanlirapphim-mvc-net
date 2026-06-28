using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

public class ShowtimeRepository(IDbConnection db) : IShowtimeRepository
{
    public async Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateOnly date)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow
            FROM showtimes s
            JOIN rooms r ON r.id = s.room_id
            WHERE s.movie_id = @movieId AND s.show_date = @date
            ORDER BY s.start_time";

        var showtimes = await db.QueryAsync<Showtime, Room, Showtime>(
            sql,
            (showtime, room) => { showtime.Room = room; return showtime; },
            new { movieId, date = date.ToString("yyyy-MM-dd") },
            splitOn: "id"
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
}
