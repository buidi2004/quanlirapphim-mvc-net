using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var movieCount = await dashboardRepository.GetMovieCountAsync();
        var userCount = await dashboardRepository.GetUserCountAsync();
        var ticketCount = await dashboardRepository.GetTicketCountAsync();
        var revenue = await dashboardRepository.GetRevenueAsync();

        return new DashboardStats
        {
            MovieCount = movieCount,
            UserCount = userCount,
            TicketCount = ticketCount,
            Revenue = revenue
        };
    }
}
