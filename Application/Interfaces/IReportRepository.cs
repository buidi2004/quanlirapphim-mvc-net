namespace CinemaXNet.Application.Interfaces;

public interface IReportRepository
{
    Task<(IEnumerable<dynamic> Items, int TotalCount)> GetMovieRevenueReportPagedAsync(int page, int pageSize);
    Task<IEnumerable<dynamic>> GetMovieRevenueReportAsync();
}
