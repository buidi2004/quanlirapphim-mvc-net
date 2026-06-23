namespace CinemaXNet.ViewModels;

public class SeatMapViewModel
{
    public int ShowtimeId { get; set; }
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public string RoomName { get; set; } = "";
    public decimal PricePerSeat { get; set; }
    public int TotalRows { get; set; }
    public int SeatsPerRow { get; set; }
    public string? LayoutJson { get; set; }

    /// <summary>Map: seatCode → status ('available'|'holding'|'paid')</summary>
    public Dictionary<string, string> SeatStatuses { get; set; } = [];

    public string GetSeatStatus(string seatCode) =>
        SeatStatuses.TryGetValue(seatCode, out var s) ? s : "available";
}

public class SeatLayoutItem
{
    public string id { get; set; } = "";
    public string type { get; set; } = "";
    public int row { get; set; }
    public int col { get; set; }
}
