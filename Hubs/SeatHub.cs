using Microsoft.AspNetCore.SignalR;

namespace CinemaXNet.Hubs;

public class SeatHub : Hub
{
    // Người dùng tham gia vào Group theo ShowtimeId để chỉ nhận thông báo của suất chiếu đó
    public async Task JoinShowtimeGroup(int showtimeId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, showtimeId.ToString());
    }

    public async Task LeaveShowtimeGroup(int showtimeId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, showtimeId.ToString());
    }
}
