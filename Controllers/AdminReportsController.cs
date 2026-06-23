using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/reports")]
public class AdminReportsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = """
            SELECT m.title AS MovieTitle, COUNT(t.id) AS TotalTickets, SUM(t.total_price) AS TotalRevenue
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.id, m.title
            ORDER BY TotalRevenue DESC
        """;
        var reports = await db.QueryAsync<dynamic>(sql);
        
        var totalRevenue = reports.Sum(r => (decimal)r.TotalRevenue);
        ViewBag.TotalRevenue = totalRevenue;

        return View("~/Views/Admin/Reports/Index.cshtml", reports);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv()
    {
        var sql = """
            SELECT m.title AS MovieTitle, COUNT(t.id) AS TotalTickets, SUM(t.total_price) AS TotalRevenue
            FROM tickets t
            JOIN showtimes s ON t.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE t.status = 'paid'
            GROUP BY m.id, m.title
            ORDER BY TotalRevenue DESC
        """;
        var reports = await db.QueryAsync<dynamic>(sql);

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
