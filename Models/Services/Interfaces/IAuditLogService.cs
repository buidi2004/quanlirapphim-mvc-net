namespace CinemaXNet.Models.Services.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(int userId, string action, string entityName, string entityId, string details);
}
