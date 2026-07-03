using System.Data;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Constants;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class DashboardRepository(IDbConnection db) : IDashboardRepository
{
    public async Task<int> GetMovieCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM movies");
    }

    public async Task<int> GetUserCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM users WHERE role = @Role", new { Role = UserRoles.User });
    }

    public async Task<int> GetTicketCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM tickets WHERE status = @Status", new { Status = TicketStatus.Paid });
    }

    public async Task<decimal> GetRevenueAsync()
    {
        return await db.ExecuteScalarAsync<decimal>("SELECT COALESCE(SUM(total_price), 0) FROM tickets WHERE status = @Status", new { Status = TicketStatus.Paid });
    }
}
