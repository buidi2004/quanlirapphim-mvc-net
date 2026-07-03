using System.Data;
using Dapper;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Repositories;

public class ReportRepository(IDbConnection db) : IReportRepository
{
    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetMovieRevenueReportPagedAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;

        var countSql = """
            SELECT COUNT(DISTINCT m.id)
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
        """;
        var totalCount = await db.ExecuteScalarAsync<int>(countSql);

        var sql = """
            SELECT m.title AS MovieTitle, COUNT(t.id) AS TotalTickets, SUM(t.total_price) AS TotalRevenue
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.id, m.title
            ORDER BY TotalRevenue DESC
            LIMIT @pageSize OFFSET @offset
        """;
        var items = await db.QueryAsync<dynamic>(sql, new { pageSize, offset });

        return (items, totalCount);
    }

    public async Task<IEnumerable<dynamic>> GetMovieRevenueReportAsync()
    {
        var sql = """
            SELECT m.title AS MovieTitle, COUNT(t.id) AS TotalTickets, SUM(t.total_price) AS TotalRevenue
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.id, m.title
            ORDER BY TotalRevenue DESC
        """;
        return await db.QueryAsync<dynamic>(sql);
    }
}
