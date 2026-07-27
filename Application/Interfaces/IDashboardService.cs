using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStats> GetDashboardStatsAsync();
}
