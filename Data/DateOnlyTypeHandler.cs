using System.Data;
using Dapper;

namespace CinemaXNet.Data;

public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.String;
        parameter.Value = value.ToString("yyyy-MM-dd");
    }

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
