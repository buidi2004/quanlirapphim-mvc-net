namespace CinemaXNet.Application.ViewModels;

// DashboardStats: ViewModel đóng gói toàn bộ các chỉ số thống kê & báo cáo hiển thị trên Dashboard Quản trị (Admin Dashboard)
public class DashboardStats
{
    // A. Nhóm Chỉ số Tổng Quan (KPI Cards)
    public decimal TodayRevenue { get; set; }     // Doanh thu ngày hôm nay (VNĐ)
    public decimal RevenueGrowth { get; set; }    // Tỷ lệ tăng trưởng doanh thu (%) so với ngày hôm qua
    
    public int TodayTickets { get; set; }         // Số vé bán ra hôm nay
    public decimal TicketGrowth { get; set; }     // Tỷ lệ tăng trưởng số vé (%)
    
    public decimal TodayOccupancy { get; set; }   // Tỷ lệ lấp đầy ghế trung bình của các rạp hôm nay (%)
    public decimal OccupancyGrowth { get; set; }  // Tỷ lệ lấp đầy tăng/giảm (%)
    
    public int CanceledTickets { get; set; }      // Số vé bị hủy / hết hạn giữ chỗ
    public decimal CancelRate { get; set; }       // Tỷ lệ hủy vé (%) trên tổng số vé được tạo

    // B. Nhóm Dữ liệu Đồ thị & Bảng xếp hạng (Charts & Tables)
    public List<RevenueByDay> Revenue7Days { get; set; } = new();      // Biểu đồ Doanh thu 7 ngày gần nhất
    public List<TicketsByGenre> GenreStats { get; set; } = new();      // Biểu đồ Cơ cấu vé bán ra theo Thể loại phim
    public List<TopMovie> TopMovies { get; set; } = new();             // Bảng Xếp hạng Top 5 Phim doanh thu cao nhất
    public List<OccupancyByHour> TimeSlotStats { get; set; } = new();  // Biểu đồ Tỷ lệ lấp đầy ghế theo khung giờ trong ngày
}

// Doanh thu theo từng ngày (Nhãn ngày + Số tiền)
public class RevenueByDay
{
    public string DateLabel { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

// Số vé bán theo Thể loại (Thể loại + Số vé)
public class TicketsByGenre
{
    public string Genre { get; set; } = string.Empty;
    public int TicketCount { get; set; }
}

// Top Phim ăn khách nhất
public class TopMovie
{
    public string MovieName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

// Tỷ lệ lấp đầy ghế theo Khung giờ
public class OccupancyByHour
{
    public string HourLabel { get; set; } = string.Empty;
    public decimal OccupancyRate { get; set; }
}
