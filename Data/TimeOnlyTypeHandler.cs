using System.Data;
using Dapper;

namespace CinemaXNet.Data;

public class TimeOnlyTypeHandler : SqlMapper.TypeHandler<TimeOnly>
{
    public override void SetValue(IDbDataParameter parameter, TimeOnly value)
    {
        parameter.Value = value.ToString("HH:mm:ss");
    }

    public override TimeOnly Parse(object value)
    {
        if (value is string str)
        {
            return TimeOnly.Parse(str);
        }
        if (value is TimeSpan ts)
        {
            return TimeOnly.FromTimeSpan(ts);
        }
        if (value is DateTime dt)
        {
            return TimeOnly.FromDateTime(dt);
        }
        throw new InvalidCastException($"Cannot cast {value?.GetType().Name} to TimeOnly.");
    }
}
