using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Services;

// DashboardService: Service chuyên trách lấy các số liệu thống kê Dashboard phục vụ trang Quản trị Admin
public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    // Hàm gọi Repository tính toán các chỉ số KPI, Doanh thu 7 ngày, Top Phim ăn khách
    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        return await dashboardRepository.GetDashboardStatsAsync();
    }
}
