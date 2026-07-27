namespace CinemaXNet.Application.ViewModels;

public class DashboardStats
{
    // A. Nhóm Chỉ số Tổng Quan
    public decimal TodayRevenue { get; set; }
    public decimal RevenueGrowth { get; set; } // % so với hôm qua
    
    public int TodayTickets { get; set; }
    public decimal TicketGrowth { get; set; }
    
    public decimal TodayOccupancy { get; set; }
    public decimal OccupancyGrowth { get; set; }
    
    public int CanceledTickets { get; set; }
    public decimal CancelRate { get; set; } // % trên tổng vé

    // B. Nhóm Đồ thị
    public List<RevenueByDay> Revenue7Days { get; set; } = new();
    public List<TicketsByGenre> GenreStats { get; set; } = new();
    public List<TopMovie> TopMovies { get; set; } = new();
    public List<OccupancyByHour> TimeSlotStats { get; set; } = new();
}

public class RevenueByDay
{
    public string DateLabel { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class TicketsByGenre
{
    public string Genre { get; set; } = string.Empty;
    public int TicketCount { get; set; }
}

public class TopMovie
{
    public string MovieName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class OccupancyByHour
{
    public string HourLabel { get; set; } = string.Empty;
    public decimal OccupancyRate { get; set; }
}
