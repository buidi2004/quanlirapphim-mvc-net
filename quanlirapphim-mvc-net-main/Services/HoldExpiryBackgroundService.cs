using CinemaXNet.Models.Services.Interfaces;

namespace CinemaXNet.Services;

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
                var cancelled            = await ticketService.ReleaseExpiredHoldsAsync();

                if (cancelled > 0)
                    logger.LogInformation("Cancelled {Count} expired hold(s).", cancelled);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in HoldExpiryBackgroundService.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
