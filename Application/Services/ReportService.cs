using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ReportService(IReportRepository repository) : IReportService
{
    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetMovieRevenueReportPagedAsync(int page, int pageSize)
    {
        return await repository.GetMovieRevenueReportPagedAsync(page, pageSize);
    }

    public async Task<IEnumerable<dynamic>> GetMovieRevenueReportAsync()
    {
        return await repository.GetMovieRevenueReportAsync();
    }
}
