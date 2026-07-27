using System.Data;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using CinemaXNet.Domain.Constants;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class DashboardRepository(IDbConnection db) : IDashboardRepository
{
    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var stats = new DashboardStats();

        var sql = @"
            -- 1. Overview Stats
            SELECT 
                IFNULL(SUM(CASE WHEN DATE(booked_at) = CURDATE() THEN total_price ELSE 0 END), 0) AS TodayRevenue,
                IFNULL(SUM(CASE WHEN DATE(booked_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN total_price ELSE 0 END), 0) AS YesterdayRevenue,
                SUM(CASE WHEN DATE(booked_at) = CURDATE() THEN 1 ELSE 0 END) AS TodayTickets,
                SUM(CASE WHEN DATE(booked_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS YesterdayTickets
            FROM tickets
            WHERE status = 'paid' AND booked_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY);

            SELECT 
                SUM(CASE WHEN DATE(booked_at) = CURDATE() THEN 1 ELSE 0 END) AS TodayCanceled,
                SUM(CASE WHEN DATE(booked_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS YesterdayCanceled
            FROM tickets
            WHERE status = 'cancelled' AND booked_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY);

            -- 2. Revenue 7 Days
            SELECT 
                DATE_FORMAT(d, '%d/%m') AS DateLabel,
                IFNULL(SUM(total_price), 0) AS Revenue
            FROM (
                SELECT DATE(booked_at) AS d, total_price
                FROM tickets
                WHERE status = 'paid' AND booked_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            ) sub
            GROUP BY d
            ORDER BY d;

            -- 3. Genre Stats
            SELECT 
                IFNULL(m.genre, 'Khác') AS Genre,
                COUNT(t.id) AS TicketCount
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.genre
            ORDER BY TicketCount DESC
            LIMIT 5;

            -- 4. Top 5 Movies
            SELECT 
                m.title AS MovieName,
                IFNULL(SUM(t.total_price), 0) AS Revenue
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.id, m.title
            ORDER BY Revenue DESC
            LIMIT 5;

            -- 5. TimeSlot Stats
            SELECT 
                CONCAT(h, 'h') AS HourLabel,
                COUNT(*) AS OccupancyRate
            FROM (
                SELECT HOUR(s.start_time) AS h
                FROM tickets t
                JOIN showtimes s ON t.showtime_id = s.id
                WHERE t.status = 'paid'
            ) sub
            GROUP BY h
            ORDER BY h;
        ";

        using var multi = await db.QueryMultipleAsync(sql);

        // 1. Overview
        var overview = await multi.ReadFirstOrDefaultAsync();
        var canceled = await multi.ReadFirstOrDefaultAsync();

        if (overview != null)
        {
            stats.TodayRevenue = overview.TodayRevenue ?? 0;
            decimal yesterdayRev = overview.YesterdayRevenue ?? 0;
            stats.RevenueGrowth = yesterdayRev > 0 ? ((stats.TodayRevenue - yesterdayRev) / yesterdayRev) * 100m : 100m;

            // SUM(CASE WHEN...THEN 1 ELSE 0 END) trong MySQL có thể trả về decimal,
            // nên phải Convert.ToInt32 thay vì gán thẳng (dynamic decimal -> int gây RuntimeBinderException)
            stats.TodayTickets = Convert.ToInt32(overview.TodayTickets ?? 0);
            decimal yesterdayTix = Convert.ToDecimal(overview.YesterdayTickets ?? 0);
            stats.TicketGrowth = yesterdayTix > 0 ? ((stats.TodayTickets - yesterdayTix) / yesterdayTix) * 100m : 100m;
        }

        if (canceled != null)
        {
            stats.CanceledTickets = Convert.ToInt32(canceled.TodayCanceled ?? 0);
            decimal yesterdayCanceled = Convert.ToDecimal(canceled.YesterdayCanceled ?? 0);
            stats.CancelRate = yesterdayCanceled > 0 ? ((stats.CanceledTickets - yesterdayCanceled) / yesterdayCanceled) * 100m : 100m;
        }

        stats.TodayOccupancy = 0; // Requires room capacity calculation, set to 0 for now
        stats.OccupancyGrowth = 0;

        // 2. Revenue 7 Days
        stats.Revenue7Days = (await multi.ReadAsync<RevenueByDay>()).ToList();

        // 3. Genre Stats
        stats.GenreStats = (await multi.ReadAsync<TicketsByGenre>()).ToList();

        // 4. Top 5 Movies
        stats.TopMovies = (await multi.ReadAsync<TopMovie>()).ToList();

        // 5. TimeSlot Stats
        stats.TimeSlotStats = (await multi.ReadAsync<OccupancyByHour>()).ToList();

        return stats;
    }
}