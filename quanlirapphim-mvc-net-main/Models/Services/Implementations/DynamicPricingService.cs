using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Services.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Services.Implementations;

public class DynamicPricingService(IDbConnection db) : IDynamicPricingService
{
    public async Task<decimal> CalculatePriceAsync(Showtime showtime)
    {
        var finalPrice = showtime.Price;

        var sql = "SELECT * FROM pricing_rules WHERE is_active = 1";
        var rules = await db.QueryAsync<dynamic>(sql);

        // Parse showtime date and time
        if (!DateTime.TryParse(showtime.ShowDate.ToString(), out var date))
            date = DateTime.Today;
        if (!TimeSpan.TryParse(showtime.StartTime.ToString(), out var time))
            time = TimeSpan.Zero;

        foreach (var rule in rules)
        {
            bool isMatch = false;
            if (rule.condition_type == "DayOfWeek")
            {
                var days = ((string)rule.condition_value).Split(',').Select(d => d.Trim().ToLower());
                if (days.Contains(date.DayOfWeek.ToString().ToLower()))
                    isMatch = true;
            }
            else if (rule.condition_type == "TimeOfDay")
            {
                var parts = ((string)rule.condition_value).Split('-');
                if (parts.Length == 2 && TimeSpan.TryParse(parts[0], out var start) && TimeSpan.TryParse(parts[1], out var end))
                {
                    if (time >= start && time <= end)
                        isMatch = true;
                }
            }

            if (isMatch)
            {
                var val = (decimal)rule.adjustment_value;
                if (rule.adjustment_type == "Percent")
                    finalPrice += finalPrice * (val / 100m);
                else if (rule.adjustment_type == "Fixed")
                    finalPrice += val;
            }
        }

        return Math.Max(0, finalPrice);
    }
}
