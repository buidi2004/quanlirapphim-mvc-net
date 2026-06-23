namespace CinemaXNet.Core.ValueObjects;

public class HoldResult
{
    public List<int> TicketIds { get; }
    public DateTime ExpiryTime { get; }

    public HoldResult(List<int> ticketIds, DateTime expiryTime)
    {
        TicketIds = ticketIds;
        ExpiryTime = expiryTime;
    }

    public int GetRemainingSeconds() =>
        Math.Max(0, (int)(ExpiryTime - DateTime.UtcNow).TotalSeconds);
}
