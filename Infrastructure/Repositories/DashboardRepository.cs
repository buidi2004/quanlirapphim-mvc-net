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

        // 1. Chỉ số tổng quan (Giả lập số liệu do DB SQLite/MySQL chưa có đủ data thật 100%)
        stats.TodayRevenue = 42500000;
        stats.RevenueGrowth = 12.0m;
        stats.TodayTickets = 1284;
        stats.TicketGrowth = 8.0m;
        stats.TodayOccupancy = 67.0m;
        stats.OccupancyGrowth = -3.0m;
        stats.CanceledTickets = 23;
        stats.CancelRate = 1.8m;

        // 2. Doanh thu 7 ngày qua
        stats.Revenue7Days = new List<RevenueByDay>
        {
            new RevenueByDay { DateLabel = "T2", Revenue = 32000000 },
            new RevenueByDay { DateLabel = "T3", Revenue = 28000000 },
            new RevenueByDay { DateLabel = "T4", Revenue = 35000000 },
            new RevenueByDay { DateLabel = "T5", Revenue = 30000000 },
            new RevenueByDay { DateLabel = "T6", Revenue = 45000000 },
            new RevenueByDay { DateLabel = "T7", Revenue = 52000000 },
            new RevenueByDay { DateLabel = "CN", Revenue = 42500000 }
        };

        // 3. Tỷ trọng thể loại
        stats.GenreStats = new List<TicketsByGenre>
        {
            new TicketsByGenre { Genre = "Hành động", TicketCount = 450 },
            new TicketsByGenre { Genre = "Tình cảm", TicketCount = 300 },
            new TicketsByGenre { Genre = "Kinh dị", TicketCount = 200 },
            new TicketsByGenre { Genre = "Hoạt hình", TicketCount = 150 }
        };

        // 4. Top 5 Phim
        stats.TopMovies = new List<TopMovie>
        {
            new TopMovie { MovieName = "Phim A", Revenue = 98000000 },
            new TopMovie { MovieName = "Phim B", Revenue = 82000000 },
            new TopMovie { MovieName = "Phim C", Revenue = 65000000 },
            new TopMovie { MovieName = "Phim D", Revenue = 54000000 },
            new TopMovie { MovieName = "Phim E", Revenue = 41000000 }
        };

        // 5. Lấp đầy theo khung giờ
        stats.TimeSlotStats = new List<OccupancyByHour>
        {
            new OccupancyByHour { HourLabel = "10h", OccupancyRate = 22 },
            new OccupancyByHour { HourLabel = "13h", OccupancyRate = 40 },
            new OccupancyByHour { HourLabel = "16h", OccupancyRate = 55 },
            new OccupancyByHour { HourLabel = "19h", OccupancyRate = 82 },
            new OccupancyByHour { HourLabel = "21h", OccupancyRate = 75 }
        };

        return await Task.FromResult(stats);
    }
}
