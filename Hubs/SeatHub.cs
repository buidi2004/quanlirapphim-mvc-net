using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CinemaXNet.Hubs;

public class SeatHub : Hub
{
    // Key: "showtimeId_seatCode", Value: ConnectionId
    private static readonly ConcurrentDictionary<string, string> LockedSeats = new();

    public async Task JoinShowtimeGroup(int showtimeId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, showtimeId.ToString());
        
        var currentLocks = LockedSeats
            .Where(x => x.Key.StartsWith(showtimeId + "_"))
            .Select(x => x.Key.Split('_')[1])
            .ToList();
            
        if (currentLocks.Any())
        {
            await Clients.Caller.SendAsync("InitializeLocks", currentLocks);
        }
    }

    public async Task LeaveShowtimeGroup(int showtimeId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, showtimeId.ToString());
        await ReleaseLocksForConnection();
    }

    public async Task<bool> LockSeat(int showtimeId, string seatCode)
    {
        string key = $"{showtimeId}_{seatCode}";
        if (LockedSeats.TryAdd(key, Context.ConnectionId))
        {
            await Clients.GroupExcept(showtimeId.ToString(), Context.ConnectionId).SendAsync("SeatLocked", seatCode);
            return true;
        }
        return false;
    }

    public async Task UnlockSeat(int showtimeId, string seatCode)
    {
        string key = $"{showtimeId}_{seatCode}";
        if (LockedSeats.TryGetValue(key, out var connectionId) && connectionId == Context.ConnectionId)
        {
            LockedSeats.TryRemove(key, out _);
            await Clients.Group(showtimeId.ToString()).SendAsync("SeatUnlocked", seatCode);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await ReleaseLocksForConnection();
        await base.OnDisconnectedAsync(exception);
    }

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
                    await Clients.Group(parts[0]).SendAsync("SeatUnlocked", parts[1]);
                }
            }
        }
    }
}
