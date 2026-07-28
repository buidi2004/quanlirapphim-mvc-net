// ReportService: Service xu ly cac logic nghiep vu (Business Logic) cho Report
﻿using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ReportService(IReportRepository repository) : IReportService
{
    // Xử lý logic và luồng thực thi cho phương thức Items
    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetMovieRevenueReportPagedAsync(int page, int pageSize)
    {
        return await repository.GetMovieRevenueReportPagedAsync(page, pageSize);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetMovieRevenueReportAsync
    public async Task<IEnumerable<dynamic>> GetMovieRevenueReportAsync()
    {
        return await repository.GetMovieRevenueReportAsync();
    }
}
