using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using CinemaXNet.Hubs;

namespace CinemaXNet.Infrastructure.Services;

// HoldExpiryBackgroundService: Chạy ngầm (Background Service / HostedService) liên tục trong suốt vòng đời ứng dụng.
// Thay thế cho giải pháp Cronjob PHP cũ. Mỗi 1 phút sẽ tự động quét và nhả các ghế đã hết hạn giữ chỗ (15 phút).
public class HoldExpiryBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<HoldExpiryBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("HoldExpiryBackgroundService started.");

        int errorCount = 0;
        int baseDelaySeconds = 60; // Chu kỳ mặc định 60 giây (1 phút) quét 1 lần

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Vì BackgroundService chạy dạng Singleton, ta cần tạo Scope mới (CreateScope) 
                // để có thể Inject các Scoped Services như ITicketService & DB Connection an toàn.
                using var scope          = scopeFactory.CreateScope();
                var ticketService        = scope.ServiceProvider.GetRequiredService<ITicketService>();
                
                // 1. Quét DB và tự động hủy các vé giữ chỗ quá 15 phút mà chưa thanh toán
                var cancelledSeats       = await ticketService.ReleaseExpiredHoldsAsync();
                var cancelledList        = cancelledSeats.ToList();

                if (cancelledList.Count > 0)
                {
                    logger.LogInformation("Cancelled {Count} expired hold(s).", cancelledList.Count);
                    
                    // 2. Phát thông báo Realtime qua SignalR Hub cho tất cả các client đang xem sơ đồ ghế
                    // để giao diện tự động đổi màu ghế từ "Đang giữ" về "Ghế trống" ngay lập tức mà không cần F5.
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
                
                // Đặt lại số lần lỗi về 0 nếu đợt quét thành công
                errorCount = 0;
            }
            catch (Exception ex)
            {
                errorCount++;
                logger.LogError(ex, "Error in HoldExpiryBackgroundService. Attempt: {Attempt}", errorCount);
                
                // Thuật toán Exponential Backoff: Nếu bị lỗi DB, thời gian chờ sẽ tăng gấp đôi (tối đa 5 phút) để tránh dội Request liên tục làm sập DB
                var backoffDelay = Math.Min(baseDelaySeconds * (int)Math.Pow(2, errorCount - 1), 300);
                logger.LogWarning("HoldExpiryBackgroundService will back off for {Delay} seconds.", backoffDelay);
                await Task.Delay(TimeSpan.FromSeconds(backoffDelay), stoppingToken);
                continue;
            }

            // Chờ 1 phút cho đợt quét tiếp theo
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
