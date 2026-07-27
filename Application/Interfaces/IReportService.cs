namespace CinemaXNet.Application.Interfaces;

public interface IReportService
{
    Task<(IEnumerable<dynamic> Items, int TotalCount)> GetMovieRevenueReportPagedAsync(int page, int pageSize);
    Task<IEnumerable<dynamic>> GetMovieRevenueReportAsync();
}
