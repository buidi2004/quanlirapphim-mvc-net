namespace CinemaXNet.Core.ValueObjects;

public class PaymentRequest
{
    public decimal Amount { get; init; }
    public string OrderDescription { get; init; } = "";
    public List<int> TicketIds { get; init; } = [];
    public int? UserId { get; init; }
}
