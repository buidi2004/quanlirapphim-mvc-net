namespace CinemaXNet.Domain.Exceptions;

// SeatUnavailableException: Ngoại lệ đặc thù ném ra khi một hoặc nhiều ghế vừa chọn đã bị người khác nhanh tay giữ/đặt mất
public class SeatUnavailableException : Exception
{
    // Danh sách tên các ghế bị trùng (Ví dụ: ["A1", "A2"])
    public IReadOnlyList<string> TakenSeats { get; }

    public SeatUnavailableException(IEnumerable<string> takenSeats)
        : base($"Các ghế đã được đặt: {string.Join(", ", takenSeats)}")
    {
        TakenSeats = takenSeats.ToList();
    }
}
