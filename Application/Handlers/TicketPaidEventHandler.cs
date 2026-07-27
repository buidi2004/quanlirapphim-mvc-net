using System.Data;
using CinemaXNet.Application.Commands;
using CinemaXNet.Application.Interfaces;
using Dapper;
using MediatR;

namespace CinemaXNet.Application.Handlers;

public class TicketPaidEventHandler(IDbConnection db, IUserService userService) : INotificationHandler<TicketPaidEvent>
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

        // Recalculate member tier based on new total spent and tickets
        await userService.RecalculateMemberTierAsync(notification.UserId, notification.Transaction);
    }
}
