using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/audit-logs")]
public class AdminAuditLogsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(string? entityName)
    {
        ViewBag.PageTitle = "Nhật ký hệ thống (Audit Logs)";
        
        var sql = @"
            SELECT a.*, u.username as Username, u.full_name as FullName 
            FROM audit_logs a
            JOIN users u ON a.user_id = u.id
            WHERE (@EntityName IS NULL OR a.entity_name = @EntityName)
            ORDER BY a.created_at DESC
            LIMIT 200
        ";
        
        var logs = await db.QueryAsync<dynamic>(sql, new { EntityName = string.IsNullOrEmpty(entityName) ? null : entityName });
        
        ViewBag.CurrentEntity = entityName;
        return View("~/Views/Admin/AuditLogs/Index.cshtml", logs);
    }
}
