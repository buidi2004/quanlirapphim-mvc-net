namespace CinemaXNet.Application.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(int userId, string action, string entityName, string entityId, string details);
    Task<(IEnumerable<dynamic> Logs, int TotalPages)> GetLogsAsync(string? entityName, int page = 1, int pageSize = 10);
}
