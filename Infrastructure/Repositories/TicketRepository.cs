using System.Data;
using System.Text;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

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

    public async Task<IDictionary<int, int>> GetActiveTicketCountsAsync(IEnumerable<int> showtimeIds)
    {
        var ids = showtimeIds.ToList();
        if (!ids.Any()) return new Dictionary<int, int>();

        const string sql = @"
            SELECT showtime_id, COUNT(*) as cnt FROM tickets
            WHERE showtime_id IN @ids AND status IN ('holding', 'paid')
            GROUP BY showtime_id";
        
        var rows = await db.QueryAsync(sql, new { ids });
        return rows.ToDictionary(
            r => (int)r.showtime_id,
            r => (int)r.cnt
        );
    }

    public async Task<int> CreateAsync(Ticket ticket)
    {
        const string sql = @"
            INSERT INTO tickets (showtime_id, user_id, seat_code, status, hold_expiry_time, total_price, version)
            VALUES (@ShowtimeId, @UserId, @SeatCode, @Status, @HoldExpiryTime, @TotalPrice, @Version);
            SELECT LAST_INSERT_ID();";
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
            WHERE status = 'holding' AND hold_expiry_time < NOW()";
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

    public async Task<(int TotalTickets, int TotalMovies)> GetUserTicketStatsAsync(int userId)
    {
        var sql = """
            SELECT COUNT(*) AS TotalTickets, COUNT(DISTINCT s.movie_id) AS TotalMovies
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            WHERE t.user_id = @userId AND t.status = 'paid'
        """;
        var result = await db.QueryFirstOrDefaultAsync(sql, new { userId });
        return (result?.TotalTickets == null ? 0 : (int)result.TotalTickets,
                result?.TotalMovies == null ? 0 : (int)result.TotalMovies);
    }

    public async Task<IEnumerable<dynamic>> GetUserTransactionsAsync(int userId, string? status)
    {
        var sql = """
            SELECT t.id, t.seat_code AS SeatCode, t.status, t.total_price AS TotalPrice,
                   t.booked_at AS BookedAt, t.promotion_code AS PromotionCode,
                   m.title AS MovieTitle, s.show_date AS ShowDate,
                   s.start_time AS StartTime, r.name AS RoomName
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN movies m ON m.id = s.movie_id
            JOIN rooms r ON r.id = s.room_id
            WHERE t.user_id = @userId
        """;

        object param;
        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND t.status = @status";
            param = new { userId, status };
        }
        else
        {
            param = new { userId };
        }
        sql += " ORDER BY t.booked_at DESC";

        return await db.QueryAsync(sql, param);
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

    public async Task<CinemaXNet.Application.ViewModels.TicketDetailViewModel?> GetTicketDetailAsync(int ticketId, int userId)
    {
        var sql = """
            SELECT t.*, 
                   m.title AS MovieTitle, m.poster_url AS PosterUrl, m.age_rating AS AgeRating, m.duration_minutes AS DurationMinutes,
                   s.show_date AS ShowDate, s.start_time AS StartTime, s.price,
                   r.name AS RoomName,
                   c.name AS CinemaName
            FROM tickets t
            JOIN showtimes s ON s.id = t.showtime_id
            JOIN movies m ON m.id = s.movie_id
            JOIN rooms r ON r.id = s.room_id
            JOIN cinemas c ON c.id = r.cinema_id
            WHERE t.id = @Id AND t.user_id = @UserId
        """;

        var result = await db.QueryAsync<Ticket, CinemaXNet.Application.ViewModels.TicketDetailViewModel, CinemaXNet.Application.ViewModels.TicketDetailViewModel>(
            sql,
            (ticket, vm) =>
            {
                vm.Ticket = ticket;
                return vm;
            },
            new { Id = ticketId, UserId = userId },
            splitOn: "MovieTitle"
        );
        return result.FirstOrDefault();
    }

    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAdminPaginatedTicketsAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        var count = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM tickets");
        
        var sql = """
            SELECT t.id, t.ticket_code, t.status, t.total_price, t.created_at, 
                   u.full_name, u.email, 
                   m.title AS MovieTitle, 
                   s.show_date, s.start_time
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN showtimes s ON t.showtime_id = s.id
            LEFT JOIN movies m ON s.movie_id = m.id
            ORDER BY t.created_at DESC
            LIMIT @limit OFFSET @offset
        """;
        var items = await db.QueryAsync<dynamic>(sql, new { limit = pageSize, offset });
        return (items, count);
    }
}
