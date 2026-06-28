using System.Data;
using Dapper;
using Microsoft.Data.Sqlite;

namespace CinemaXNet.Services;

public class MarketingBackgroundService(IServiceProvider serviceProvider, ILogger<MarketingBackgroundService> logger) : BackgroundService
{
    private readonly TimeSpan _period = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("MarketingBackgroundService is starting.");
        using var timer = new PeriodicTimer(_period);
        
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessCampaignsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred executing MarketingBackgroundService");
            }
        }
    }

    private async Task ProcessCampaignsAsync(CancellationToken stoppingToken)
    {
        using var scope = serviceProvider.CreateScope();
        // Since IDbConnection is scoped, we must resolve it from a new scope
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        using var db = new SqliteConnection(connectionString);
        await db.OpenAsync(stoppingToken);

        var sql = @"
            SELECT * FROM marketing_campaigns 
            WHERE status = 'Scheduled' AND scheduled_at <= @Now";
            
        var pendingCampaigns = await db.QueryAsync<dynamic>(sql, new { Now = DateTime.Now.ToString("yyyy-MM-ddTHH:mm") });

        foreach (var camp in pendingCampaigns)
        {
            var id = (int)camp.id;
            var name = (string)camp.name;
            var type = (string)camp.type;
            
            logger.LogInformation("Processing campaign {CampaignId}: {Name}", id, name);

            // Mock sending emails/SMS
            var targetAudience = (string)camp.target_audience;
            int sentCount = 0;
            
            if (targetAudience == "All") sentCount = 1000;
            else if (targetAudience == "VIP") sentCount = 150;
            else if (targetAudience == "Inactive") sentCount = 300;

            logger.LogInformation("Sent {Count} {Type} messages for campaign {CampaignId}", sentCount, type, id);

            // Update campaign status
            var updateSql = "UPDATE marketing_campaigns SET status = 'Sent', sent_count = @Count WHERE id = @Id";
            await db.ExecuteAsync(updateSql, new { Count = sentCount, Id = id });
        }
    }
}
