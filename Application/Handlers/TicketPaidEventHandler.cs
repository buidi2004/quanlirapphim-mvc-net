using System.Data;
using CinemaXNet.Application.Commands;
using Dapper;
using MediatR;

namespace CinemaXNet.Application.Handlers;

public class TicketPaidEventHandler(IDbConnection db) : INotificationHandler<TicketPaidEvent>
{
    public async Task Handle(TicketPaidEvent notification, CancellationToken cancellationToken)
    {
        var addPoints = (int)(notification.TotalPrice / 1000);

        await db.ExecuteAsync(@"
            UPDATE users 
            SET total_spent = total_spent + @Amount, 
                loyalty_points = loyalty_points + @Points 
            WHERE id = @UserId", 
            new { Amount = (double)notification.TotalPrice, Points = addPoints, UserId = notification.UserId },
            notification.Transaction);

        var currentSpent = await db.ExecuteScalarAsync<double>("SELECT total_spent FROM users WHERE id = @UserId", new { UserId = notification.UserId }, notification.Transaction);
        var newTier = await db.QueryFirstOrDefaultAsync<string>(@"
            SELECT name FROM membership_tiers 
            WHERE min_spent <= @Spent 
            ORDER BY min_spent DESC LIMIT 1", 
            new { Spent = currentSpent },
            notification.Transaction);
        
        if (!string.IsNullOrEmpty(newTier))
        {
            await db.ExecuteAsync("UPDATE users SET member_level = @Tier WHERE id = @UserId", new { Tier = newTier, UserId = notification.UserId }, notification.Transaction);
        }
    }
}
