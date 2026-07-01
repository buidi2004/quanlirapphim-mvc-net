namespace CinemaXNet.Core.ValueObjects;

public class PaymentResult
{
    public bool Success { get; init; }
    public string TransactionId { get; init; } = "";
}
