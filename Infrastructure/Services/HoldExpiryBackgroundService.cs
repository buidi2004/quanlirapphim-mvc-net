using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using CinemaXNet.Hubs;

namespace CinemaXNet.Infrastructure.Services;

/// <summary>
/// Thay thế HoldExpiryJob.php + cron.
/// Chạy nền, mỗi 1 phút tự động hủy các ticket 'holding' đã hết hạn.
/// </summary>
public class HoldExpiryBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<HoldExpiryBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("HoldExpiryBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope          = scopeFactory.CreateScope();
                var ticketService        = scope.ServiceProvider.GetRequiredService<ITicketService>();
                var cancelledSeats       = await ticketService.ReleaseExpiredHoldsAsync();
                var cancelledList        = cancelledSeats.ToList();

                if (cancelledList.Count > 0)
                {
                    logger.LogInformation("Cancelled {Count} expired hold(s).", cancelledList.Count);
                    
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SeatHub>>();
                    var groups = cancelledList.GroupBy(x => x.ShowtimeId);
                    
                    foreach (var group in groups)
                    {
                        var seatCodes = group.Select(x => x.SeatCode).ToList();
                        await hubContext.Clients.Group(group.Key.ToString()).SendAsync("SeatReleased", new {
                            SeatCodes = seatCodes
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in HoldExpiryBackgroundService.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
