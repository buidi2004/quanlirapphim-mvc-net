// AdminAuditLogsController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminAuditLogs
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/audit-logs")]
public class AdminAuditLogsController(IAuditLogService auditLogService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index(string? entityName, int page = 1)
    {
        ViewBag.PageTitle = "Nhật ký hệ thống (Audit Logs)";
        
        int pageSize = 10;
        var result = await auditLogService.GetLogsAsync(entityName, page, pageSize);
        
        ViewBag.CurrentEntity = entityName;
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = result.TotalPages;
        return View("~/Views/Admin/AuditLogs/Index.cshtml", result.Logs);
    }
}
