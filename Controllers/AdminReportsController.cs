using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/reports")]
public class AdminReportsController(IReportService reportService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var (items, totalCount) = await reportService.GetMovieRevenueReportPagedAsync(page, pageSize);
        
        var totalRevenue = items.Sum(r => (decimal)r.TotalRevenue);
        ViewBag.TotalRevenue = totalRevenue; // Note: This is just total of the current page now, but keeping for compatibility
        
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return View("~/Views/Admin/Reports/Index.cshtml", items);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv()
    {
        var reports = await reportService.GetMovieRevenueReportAsync();

        var builder = new System.Text.StringBuilder();
        // UTF-8 BOM for Excel to read accents properly
        builder.Append('\uFEFF');
        builder.AppendLine("Tên Phim,Số Lượng Vé,Doanh Thu (VNĐ)");

        foreach (var report in reports)
        {
            var title = report.MovieTitle?.ToString().Replace("\"", "\"\"");
            builder.AppendLine($"\"{title}\",{report.TotalTickets},{report.TotalRevenue}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(builder.ToString());
        return File(bytes, "text/csv", $"DoanhThu_{DateTime.Now:yyyyMMdd}.csv");
    }
}
