using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

// AuditLogRepository: Quản lý việc Ghi nhật ký hệ thống (Audit Logs)
// Theo dõi mọi thao tác Thêm / Sửa / Xóa của Admin và Nhân viên để phục vụ bảo mật & kiểm toán.
public class AuditLogRepository(IDbConnection db) : IAuditLogRepository
{
    // Lấy danh sách Nhật ký có phân trang và lọc theo tên Thực thể (EntityName)
    public async Task<IEnumerable<dynamic>> GetAllLogsAsync(string? entityName, int offset, int limit)
    {
        var sql = @"
            SELECT a.*, u.username as Username, u.full_name as FullName 
            FROM audit_logs a
            JOIN users u ON a.user_id = u.id
            WHERE (@EntityName IS NULL OR a.entity_name = @EntityName)
            ORDER BY a.created_at DESC
            LIMIT @Limit OFFSET @Offset
        ";
        
        return await db.QueryAsync<dynamic>(sql, new { EntityName = string.IsNullOrEmpty(entityName) ? null : entityName, Limit = limit, Offset = offset });
    }

    // Đếm tổng số nhật ký thỏa điều kiện lọc
    public async Task<int> GetTotalCountAsync(string? entityName)
    {
        var sql = @"
            SELECT COUNT(*)
            FROM audit_logs a
            WHERE (@EntityName IS NULL OR a.entity_name = @EntityName)
        ";
        return await db.ExecuteScalarAsync<int>(sql, new { EntityName = string.IsNullOrEmpty(entityName) ? null : entityName });
    }

    // Ghi một dòng nhật ký mới khi có thao tác quan trọng diễn ra
    public async Task AddLogAsync(int userId, string action, string entityName, string entityId, string details)
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
