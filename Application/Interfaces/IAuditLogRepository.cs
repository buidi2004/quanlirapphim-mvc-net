namespace CinemaXNet.Application.Interfaces;

public interface IAuditLogRepository
{
    Task<IEnumerable<dynamic>> GetAllLogsAsync(string? entityName, int offset, int limit);
    Task<int> GetTotalCountAsync(string? entityName);
    Task AddLogAsync(int userId, string action, string entityName, string entityId, string details);
}
