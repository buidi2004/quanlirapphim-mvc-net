using System.Data;
using Dapper;

namespace CinemaXNet.Infrastructure.Data;

// DateOnlyTypeHandler: Bộ Ép Kiểu Tùy Chỉnh (Custom Type Handler) cho Dapper trong .NET 8
// Lý do: MySQL driver cũ chưa hỗ trợ trực tiếp kiểu DateOnly mới của C# 6+, cần handler này để ép kiểu tự động sang chuỗi 'yyyy-MM-dd' khi lưu và Parse ngược lại khi đọc DB.
public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    // Hàm chạy khi Dapper ghi dữ liệu vào MySQL Parameter
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.String;
        parameter.Value = value.ToString("yyyy-MM-dd");
    }

    // Hàm chạy khi Dapper đọc dữ liệu từ MySQL về C# Object
    public override DateOnly Parse(object value)
    {
        if (value is string str)
        {
            return DateOnly.Parse(str);
        }
        if (value is DateTime dt)
        {
            return DateOnly.FromDateTime(dt);
        }
        throw new InvalidCastException($"Cannot cast {value?.GetType().Name} to DateOnly.");
    }
}
