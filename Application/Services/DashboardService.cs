using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        return await dashboardRepository.GetDashboardStatsAsync();
    }
}
