namespace CinemaXNet.Application.Interfaces;

public interface IDashboardRepository
{
    Task<int> GetMovieCountAsync();
    Task<int> GetUserCountAsync();
    Task<int> GetTicketCountAsync();
    Task<decimal> GetRevenueAsync();
}
