using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Application.Services;

// DynamicPricingService: Service xử lý thuật toán Giá vé linh hoạt (Dynamic Pricing).
// Tính toán giá vé thực tế tự động dựa trên các quy tắc: Thứ trong tuần, Khung giờ vàng, hoặc Tỷ lệ lấp đầy ghế phòng chiếu.
public class DynamicPricingService(IDbConnection db) : IDynamicPricingService
{
    // Hàm trợ giúp tính số ghế đã đặt/giữ và tổng số ghế của phòng chiếu
    private async Task<(int Occupied, int Total)> GetOccupancyAsync(Showtime showtime)
    {
        // Lấy số vé đang giữ hoặc đã thanh toán của suất chiếu này
        var occupied = await db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM tickets WHERE showtime_id = @Id AND status IN ('paid', 'holding')",
            new { Id = showtime.Id });
            
        // Lấy tổng số ghế tối đa của phòng (hàng * số ghế trên hàng)
        var total = await db.ExecuteScalarAsync<int>(
            "SELECT (total_rows * seats_per_row) FROM rooms WHERE id = @RoomId",
            new { RoomId = showtime.RoomId });
            
        return (occupied, total);
    }

    // Tính toán giá vé cuối cùng cho một suất chiếu duy nhất
    public async Task<decimal> CalculatePriceAsync(Showtime showtime)
    {
        var finalPrice = showtime.Price; // Khởi tạo với Giá vé gốc

        // 1. Tải tất cả các Quy tắc điều chỉnh giá đang kích hoạt (is_active = 1)
        var sql = "SELECT * FROM pricing_rules WHERE is_active = 1";
        var rules = await db.QueryAsync<dynamic>(sql);

        if (!DateTime.TryParse(showtime.ShowDate.ToString(), out var date))
            date = DateTime.Today;
        if (!TimeSpan.TryParse(showtime.StartTime.ToString(), out var time))
            time = TimeSpan.Zero;

        int? occupied = null;
        int? totalSeats = null;

        // 2. Duyệt qua từng quy tắc để kiểm tra điều kiện áp dụng
        foreach (var rule in rules)
        {
            bool isMatch = false;
            string conditionType = rule.condition_type;
            
            // Quy tắc 1: Khớp theo Thứ trong tuần (Ví dụ: "Saturday, Sunday" -> Tăng giá vé cuối tuần)
            if (conditionType == "DayOfWeek")
            {
                var days = ((string)rule.condition_value).Split(',').Select(d => d.Trim().ToLower());
                if (days.Contains(date.DayOfWeek.ToString().ToLower()))
                    isMatch = true;
            }
            // Quy tắc 2: Khớp theo Khung giờ trong ngày (Ví dụ: "18:00-22:00" -> Giờ cao điểm)
            else if (conditionType == "TimeOfDay")
            {
                var parts = ((string)rule.condition_value).Split('-');
                if (parts.Length == 2 && TimeSpan.TryParse(parts[0], out var start) && TimeSpan.TryParse(parts[1], out var end))
                {
                    if (time >= start && time <= end)
                        isMatch = true;
                }
            }
            // Quy tắc 3: Khớp theo Tỷ lệ lấp đầy phòng chiếu (Ví dụ: ">80%" -> Phim đang quá hot, tăng giá)
            else if (conditionType == "Occupancy")
            {
                if (occupied == null)
                {
                    var occ = await GetOccupancyAsync(showtime);
                    occupied = occ.Occupied;
                    totalSeats = occ.Total;
                }

                // Chỉ tính toán nếu đã bán được ít nhất 5 vé (chống tăng giá ảo khi mới mở bán)
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

            // 3. Nếu thỏa điều kiện -> Cộng/Trừ tiền hoặc Tăng/Giảm theo %
            if (isMatch)
            {
                var val = (decimal)rule.adjustment_value;
                if (rule.adjustment_type == "Percent")
                    finalPrice += finalPrice * (val / 100m); // Ví dụ +10%
                else if (rule.adjustment_type == "Fixed")
                    finalPrice += val; // Ví dụ +20,000đ
            }
        }

        // Giá vé không thể âm
        return Math.Max(0, finalPrice);
    }

    // Hàm tính toán giá hàng loạt cho danh sách nhiều Suất chiếu (Tối ưu hóa tránh truy vấn quy tắc giá lặp lại)
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
