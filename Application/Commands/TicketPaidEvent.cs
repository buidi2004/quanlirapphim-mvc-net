using MediatR;

namespace CinemaXNet.Application.Commands;

public class TicketPaidEvent : INotification
{
    public int UserId { get; set; }
    public decimal TotalPrice { get; set; }
    public System.Data.IDbTransaction? Transaction { get; set; }
}
