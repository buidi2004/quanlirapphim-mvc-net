using System.Data;
using Dapper;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Repositories;

public class RefundRepository(IDbConnection db) : IRefundRepository
{
    public async Task<IEnumerable<dynamic>> SearchTicketsAsync(string query)
    {
        var sql = """
            SELECT t.id as TicketId, t.seat_code as SeatCode, t.status as Status, t.total_price as TotalPrice, t.booked_at as BookedAt,
                   m.title as MovieTitle, s.start_time as StartTime, s.show_date as ShowDate, r.name as RoomName,
                   u.email as UserEmail, u.phone as UserPhone, u.full_name as UserName
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN users u ON t.user_id = u.id
            WHERE (CAST(t.id AS CHAR) = @query OR u.email LIKE @queryLike OR u.phone LIKE @queryLike)
            ORDER BY t.booked_at DESC
            LIMIT 20
        """;
        return await db.QueryAsync<dynamic>(sql, new { query = query, queryLike = $"%{query}%" });
    }

    public async Task<dynamic?> GetTicketStatusAsync(int ticketId)
    {
        return await db.QueryFirstOrDefaultAsync<dynamic>("SELECT id, status FROM tickets WHERE id = @id", new { id = ticketId });
    }

    public async Task CancelTicketAsync(int ticketId, string reason)
    {
        var updateSql = "UPDATE tickets SET status = 'cancelled' WHERE id = @id";
        await db.ExecuteAsync(updateSql, new { id = ticketId });
    }
}
