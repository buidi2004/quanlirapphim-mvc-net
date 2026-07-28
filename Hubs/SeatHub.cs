using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CinemaXNet.Hubs;

// SeatHub: Hub xử lý giao tiếp Realtime bằng SignalR (WebSockets)
// Nhiệm vụ: Giúp nhiều người cùng lúc mở sơ đồ ghế của 1 suất chiếu có thể nhìn thấy nhau đang bấm chọn ghế nào theo thời gian thực (tránh việc 2 người cùng chọn trùng 1 ghế).
public class SeatHub : Hub
{
    // Bảng băm ConcurrentDictionary hoạt động an toàn trong môi trường đa luồng (Multi-threading).
    // Key: Cú pháp "showtimeId_seatCode" (Ví dụ: "105_A1")
    // Value: ConnectionId (Mã định danh kết nối WebSocket của trình duyệt người dùng)
    private static readonly ConcurrentDictionary<string, string> LockedSeats = new();

    // Người dùng mở trang chọn ghế sẽ tham gia (Join) vào nhóm suất chiếu tương ứng
    public async Task JoinShowtimeGroup(int showtimeId)
    {
        // Gom các kết nối đang xem cùng 1 suất chiếu vào chung 1 Group của SignalR
        await Groups.AddToGroupAsync(Context.ConnectionId, showtimeId.ToString());
        
        // Tìm toàn bộ các ghế đang tạm bị khóa tạm thời trong suất chiếu này
        var currentLocks = LockedSeats
            .Where(x => x.Key.StartsWith(showtimeId + "_"))
            .Select(x => x.Key.Split('_')[1])
            .ToList();
            
        // Gửi danh sách các ghế đang bị khóa cho người mới truy cập vào (chỉ gửi riêng cho người đó - Clients.Caller)
        if (currentLocks.Any())
        {
            await Clients.Caller.SendAsync("InitializeLocks", currentLocks);
        }
    }

    // Khi người dùng rời khỏi trang chọn ghế hoặc bấm nút Quay lại
    public async Task LeaveShowtimeGroup(int showtimeId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, showtimeId.ToString());
        // Tự động giải phóng (mở khóa) tất cả các ghế mà người này vừa click chọn
        await ReleaseLocksForConnection();
    }

    // Khóa ghế tạm thời khi người dùng click vào 1 ghế trên sơ đồ
    public async Task<bool> LockSeat(int showtimeId, string seatCode)
    {
        string key = $"{showtimeId}_{seatCode}";
        // TryAdd trả về true nếu ghế chưa có ai chọn. Trả về false nếu đã bị người khác chọn trước đó 0.001s.
        if (LockedSeats.TryAdd(key, Context.ConnectionId))
        {
            // Báo cho tất cả những người khác trong cùng phòng chiếu biết ghế này vừa bị khóa (đổi sang màu cam/xám)
            await Clients.GroupExcept(showtimeId.ToString(), Context.ConnectionId).SendAsync("SeatLocked", seatCode);
            return true;
        }
        return false;
    }

    // Bỏ khóa ghế khi người dùng click bỏ chọn 1 ghế
    public async Task UnlockSeat(int showtimeId, string seatCode)
    {
        string key = $"{showtimeId}_{seatCode}";
        // Đảm bảo chỉ đúng chính chủ (ConnectionId trùng khớp) mới được quyền nhả ghế
        if (LockedSeats.TryGetValue(key, out var connectionId) && connectionId == Context.ConnectionId)
        {
            LockedSeats.TryRemove(key, out _);
            // Thông báo cho cả phòng chiếu biết ghế này đã trống trở lại
            await Clients.Group(showtimeId.ToString()).SendAsync("SeatUnlocked", seatCode);
        }
    }

    // Tự động kích hoạt khi người dùng tắt trình duyệt, mất mạng hoặc đứt kết nối WebSocket
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Tự động mở khóa toàn bộ ghế người đó đang giữ để không làm kẹt ghế của rạp
        await ReleaseLocksForConnection();
        await base.OnDisconnectedAsync(exception);
    }

    // Hàm trợ giúp nhả toàn bộ ghế thuộc sở hữu của một ConnectionId
    private async Task ReleaseLocksForConnection()
    {
        var myLocks = LockedSeats.Where(x => x.Value == Context.ConnectionId).ToList();
        foreach (var lockItem in myLocks)
        {
            if (LockedSeats.TryRemove(lockItem.Key, out _))
            {
                var parts = lockItem.Key.Split('_');
                if (parts.Length == 2)
                {
                    // Phát sự kiện đến Group để cập nhật giao diện người khác
                    await Clients.Group(parts[0]).SendAsync("SeatUnlocked", parts[1]);
                }
            }
        }
    }
}
