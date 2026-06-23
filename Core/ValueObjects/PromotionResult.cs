namespace CinemaXNet.Core.ValueObjects;

public class PromotionResult
{
    public string Code { get; init; } = "";
    public decimal Discount { get; init; }
    public decimal TotalPrice { get; init; }
}
