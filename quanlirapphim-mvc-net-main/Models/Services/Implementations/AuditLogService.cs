using System.Data;
using CinemaXNet.Models.Services.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Services.Implementations;

public class AuditLogService(IDbConnection db) : IAuditLogService
{
    public async Task LogAsync(int userId, string action, string entityName, string entityId, string details)
    {
        var sql = @"INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) 
                    VALUES (@UserId, @Action, @EntityName, @EntityId, @Details)";
        await db.ExecuteAsync(sql, new 
        { 
            UserId = userId, 
            Action = action, 
            EntityName = entityName, 
            EntityId = entityId, 
            Details = details 
        });
    }
}
