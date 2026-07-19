using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class AuditLogService(IAuditLogRepository auditLogRepository) : IAuditLogService
{
    public async Task LogAsync(int userId, string action, string entityName, string entityId, string details)
    {
        await auditLogRepository.AddLogAsync(userId, action, entityName, entityId, details);
    }

    public async Task<(IEnumerable<dynamic> Logs, int TotalPages)> GetLogsAsync(string? entityName, int page = 1, int pageSize = 10)
    {
        int totalCount = await auditLogRepository.GetTotalCountAsync(entityName);
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var logs = await auditLogRepository.GetAllLogsAsync(entityName, offset, pageSize);
        return (logs, totalPages);
    }
}
