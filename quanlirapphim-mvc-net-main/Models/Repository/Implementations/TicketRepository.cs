using System.Data;
using System.Text;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

public class TicketRepository(IDbConnection db) : ITicketRepository
{
    public async Task<IEnumerable<string>> GetActiveSeatsAsync(int showtimeId, IEnumerable<string> seatCodes)
    {
        var codes = seatCodes.ToList();
        if (!codes.Any()) return [];

        const string sql = @"
            SELECT seat_code FROM tickets
            WHERE showtime_id = @showtimeId
              AND seat_code IN @codes
              AND status IN ('holding', 'paid')";
        return await db.QueryAsync<string>(sql, new { showtimeId, codes });
    }

    public async Task<IDictionary<string, string>> GetActiveTicketsAsync(int showtimeId)
    {
        const string sql = @"
            SELECT seat_code, status FROM tickets
            WHERE showtime_id = @showtimeId AND status IN ('holding', 'paid')";
        var rows = await db.QueryAsync(sql, new { showtimeId });
        return rows.ToDictionary(
            r => (string)r.seat_code,
            r => (string)r.status
        );
    }

    public async Task<int> CreateAsync(Ticket ticket)
    {
        const string sql = @"
            INSERT INTO tickets (showtime_id, user_id, seat_code, status, hold_expiry_time, total_price, version)
            VALUES (@ShowtimeId, @UserId, @SeatCode, @Status, @HoldExpiryTime, @TotalPrice, @Version);
            SELECT last_insert_rowid();";
        return await db.ExecuteScalarAsync<int>(sql, ticket);
    }

    public async Task<Ticket?> FindByIdAsync(int id)
    {
        const string sql = @"
            SELECT id, showtime_id AS ShowtimeId, user_id AS UserId, seat_code AS SeatCode,
                   status, hold_expiry_time AS HoldExpiryTime, total_price AS TotalPrice,
                   promotion_code AS PromotionCode, version, booked_at AS BookedAt
            FROM tickets WHERE id = @id";
        return await db.QueryFirstOrDefaultAsync<Ticket>(sql, new { id });
    }

    public async Task<int> UpdateStatusWithVersionAsync(
        int id, string newStatus, int expectedVersion,
        decimal? totalPrice = null, string? promotionCode = null)
    {
        var sql = new StringBuilder(@"
            UPDATE tickets
            SET status  = @newStatus,
                version = version + 1");

        var param = new DynamicParameters();
        param.Add("newStatus", newStatus);
        param.Add("id", id);
        param.Add("expectedVersion", expectedVersion);

        if (totalPrice.HasValue)
        {
            sql.Append(", total_price = @totalPrice");
            param.Add("totalPrice", totalPrice.Value);
        }
        if (promotionCode != null)
        {
            sql.Append(", promotion_code = @promotionCode");
            param.Add("promotionCode", promotionCode);
        }
        if (newStatus is "paid" or "cancelled")
        {
            sql.Append(", hold_expiry_time = NULL");
        }

        sql.Append(" WHERE id = @id AND version = @expectedVersion");

        return await db.ExecuteAsync(sql.ToString(), param);
    }

    public async Task<int> CancelExpiredHoldsAsync()
    {
        const string sql = @"
            UPDATE tickets
            SET status = 'cancelled', hold_expiry_time = NULL
            WHERE status = 'holding' AND hold_expiry_time < datetime('now')";
        return await db.ExecuteAsync(sql);
    }

    public async Task<IEnumerable<dynamic>> FindByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT t.*, s.show_date, s.start_time, m.title AS movie_title
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN movies m ON m.id = s.movie_id
            WHERE t.user_id = @userId AND t.status = 'paid'
            ORDER BY t.booked_at DESC";
        return await db.QueryAsync(sql, new { userId });
    }

    public async Task<Showtime?> GetShowtimeByTicketIdAsync(int ticketId)
    {
        const string sql = @"
            SELECT s.id, s.movie_id AS MovieId, s.room_id AS RoomId,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price, s.created_at AS CreatedAt,
                   r.id, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow,
                   m.id, m.title, m.poster_url AS PosterUrl, m.genre,
                   m.status, m.duration_minutes AS DurationMinutes, m.description, m.age_rating AS AgeRating, m.created_at AS CreatedAt
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN rooms r ON r.id = s.room_id
            JOIN movies m ON m.id = s.movie_id
            WHERE t.id = @ticketId";

        var result = await db.QueryAsync<Showtime, Room, Movie, Showtime>(
            sql,
            (showtime, room, movie) => { showtime.Room = room; showtime.Movie = movie; return showtime; },
            new { ticketId },
            splitOn: "id,id"
        );
        return result.FirstOrDefault();
    }
}
