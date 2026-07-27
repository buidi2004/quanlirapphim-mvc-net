using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardStats> GetDashboardStatsAsync();
}
