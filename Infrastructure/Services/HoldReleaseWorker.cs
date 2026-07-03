using CinemaXNet.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CinemaXNet.Infrastructure.Services;

public class HoldReleaseWorker(IServiceProvider serviceProvider, ILogger<HoldReleaseWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var ticketService = scope.ServiceProvider.GetRequiredService<ITicketService>();
                
                int releasedCount = await ticketService.ReleaseExpiredHoldsAsync();
                
                if (releasedCount > 0)
                {
                    logger.LogInformation("Đã hủy {Count} vé giữ chỗ hết hạn.", releasedCount);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi chạy Background Job hủy vé giữ chỗ.");
            }

            // Chạy mỗi phút 1 lần
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
