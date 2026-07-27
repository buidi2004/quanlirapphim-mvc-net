using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Application.Services;

public class DynamicPricingService(IDbConnection db) : IDynamicPricingService
{
    private async Task<(int Occupied, int Total)> GetOccupancyAsync(Showtime showtime)
    {
        var occupied = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM tickets WHERE showtime_id = @Id AND status IN ('paid', 'holding')",
            new { Id = showtime.Id });
            
        var total = await db.ExecuteScalarAsync<int>(
            "SELECT (total_rows * seats_per_row) FROM rooms WHERE id = @RoomId",
            new { RoomId = showtime.RoomId });
            
        return (occupied, total);
    }

    public async Task<decimal> CalculatePriceAsync(Showtime showtime)
    {
        var finalPrice = showtime.Price;

        var sql = "SELECT * FROM pricing_rules WHERE is_active = 1";
        var rules = await db.QueryAsync<dynamic>(sql);

        if (!DateTime.TryParse(showtime.ShowDate.ToString(), out var date))
            date = DateTime.Today;
        if (!TimeSpan.TryParse(showtime.StartTime.ToString(), out var time))
            time = TimeSpan.Zero;

        int? occupied = null;
        int? totalSeats = null;

        foreach (var rule in rules)
        {
            bool isMatch = false;
            string conditionType = rule.condition_type;
            
            if (conditionType == "DayOfWeek")
            {
                var days = ((string)rule.condition_value).Split(',').Select(d => d.Trim().ToLower());
                if (days.Contains(date.DayOfWeek.ToString().ToLower()))
                    isMatch = true;
            }
            else if (conditionType == "TimeOfDay")
            {
                var parts = ((string)rule.condition_value).Split('-');
                if (parts.Length == 2 && TimeSpan.TryParse(parts[0], out var start) && TimeSpan.TryParse(parts[1], out var end))
                {
                    if (time >= start && time <= end)
                        isMatch = true;
                }
            }
            else if (conditionType == "Occupancy")
            {
                if (occupied == null)
                {
                    var occ = await GetOccupancyAsync(showtime);
                    occupied = occ.Occupied;
                    totalSeats = occ.Total;
                }

                // Default degradation: if less than 5 tickets sold, don't apply occupancy hikes
                if ((occupied ?? 0) >= 5 && (totalSeats ?? 0) > 0)
                {
                    double currentOccupancy = (double)occupied!.Value / totalSeats!.Value * 100;
                    var parts = ((string)rule.condition_value).Split(new[] { '>', '<', '=', '%' }, StringSplitOptions.RemoveEmptyEntries);
                    
                    if (parts.Length > 0 && double.TryParse(parts[0], out var threshold))
                    {
                        var valStr = (string)rule.condition_value;
                        if (valStr.Contains('>') && currentOccupancy > threshold) isMatch = true;
                        else if (valStr.Contains('<') && currentOccupancy < threshold) isMatch = true;
                    }
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

    public async Task<IDictionary<int, decimal>> CalculatePricesAsync(IEnumerable<Showtime> showtimes)
    {
        var sql = "SELECT * FROM pricing_rules WHERE is_active = 1";
        var rules = (await db.QueryAsync<dynamic>(sql)).ToList();
        var result = new Dictionary<int, decimal>();

        foreach (var showtime in showtimes)
        {
            var finalPrice = showtime.Price;
            if (!DateTime.TryParse(showtime.ShowDate.ToString(), out var date)) date = DateTime.Today;
            if (!TimeSpan.TryParse(showtime.StartTime.ToString(), out var time)) time = TimeSpan.Zero;

            int? occupied = null;
            int? totalSeats = null;

            foreach (var rule in rules)
            {
                bool isMatch = false;
                string conditionType = rule.condition_type;
                
                if (conditionType == "DayOfWeek")
                {
                    var days = ((string)rule.condition_value).Split(',').Select(d => d.Trim().ToLower());
                    if (days.Contains(date.DayOfWeek.ToString().ToLower())) isMatch = true;
                }
                else if (conditionType == "TimeOfDay")
                {
                    var parts = ((string)rule.condition_value).Split('-');
                    if (parts.Length == 2 && TimeSpan.TryParse(parts[0], out var start) && TimeSpan.TryParse(parts[1], out var end))
                    {
                        if (time >= start && time <= end) isMatch = true;
                    }
                }
                else if (conditionType == "Occupancy")
                {
                    if (occupied == null)
                    {
                        var occ = await GetOccupancyAsync(showtime);
                        occupied = occ.Occupied;
                        totalSeats = occ.Total;
                    }

                    if ((occupied ?? 0) >= 5 && (totalSeats ?? 0) > 0)
                    {
                        double currentOccupancy = (double)occupied!.Value / totalSeats!.Value * 100;
                        var parts = ((string)rule.condition_value).Split(new[] { '>', '<', '=', '%' }, StringSplitOptions.RemoveEmptyEntries);
                        
                        if (parts.Length > 0 && double.TryParse(parts[0], out var threshold))
                        {
                            var valStr = (string)rule.condition_value;
                            if (valStr.Contains('>') && currentOccupancy > threshold) isMatch = true;
                            else if (valStr.Contains('<') && currentOccupancy < threshold) isMatch = true;
                        }
                    }
                }

                if (isMatch)
                {
                    var val = (decimal)rule.adjustment_value;
                    if (rule.adjustment_type == "Percent") finalPrice += finalPrice * (val / 100m);
                    else if (rule.adjustment_type == "Fixed") finalPrice += val;
                }
            }
            result[showtime.Id] = Math.Max(0, finalPrice);
        }
        return result;
    }
}
