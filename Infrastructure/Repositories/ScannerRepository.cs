// ScannerRepository: Repository dam nhan cac thao tac truy van Database cho Scanner
﻿using System.Data;
using Dapper;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Repositories;

public class ScannerRepository(IDbConnection db) : IScannerRepository
{
    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetTicketDetailsForScanAsync
    public async Task<dynamic?> GetTicketDetailsForScanAsync(int ticketId)
    {
        var sql = """
            SELECT t.id, t.status, t.concession_status, t.seat_code, m.title as MovieTitle, s.start_time, s.show_date, r.name as RoomName,
                   (SELECT COUNT(*) FROM ticket_concessions tc WHERE tc.ticket_id = t.id) as ConcessionCount
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            WHERE t.id = @ticketId
        """;
        return await db.QueryFirstOrDefaultAsync<dynamic>(sql, new { ticketId });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateTicketStatusAsync
    public async Task UpdateTicketStatusAsync(int ticketId, string status)
    {
        var updateSql = "UPDATE tickets SET status = @status WHERE id = @ticketId";
        await db.ExecuteAsync(updateSql, new { ticketId, status });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateConcessionStatusAsync
    public async Task UpdateConcessionStatusAsync(int ticketId, string concessionStatus)
    {
        var updateSql = "UPDATE tickets SET concession_status = @concessionStatus WHERE id = @ticketId";
        await db.ExecuteAsync(updateSql, new { ticketId, concessionStatus });
    }
}
