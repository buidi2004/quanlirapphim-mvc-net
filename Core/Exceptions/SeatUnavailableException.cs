namespace CinemaXNet.Core.Exceptions;

public class SeatUnavailableException : Exception
{
    public IReadOnlyList<string> TakenSeats { get; }

    public SeatUnavailableException(IEnumerable<string> takenSeats)
        : base($"Các ghế đã được đặt: {string.Join(", ", takenSeats)}")
    {
        TakenSeats = takenSeats.ToList();
    }
}
