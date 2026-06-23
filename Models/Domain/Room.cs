namespace CinemaXNet.Models.Domain;

public class Room
{
    public int Id { get; set; }
    public int CinemaId { get; set; } = 1;
    public string Name { get; set; } = "";
    public int TotalRows { get; set; }
    public int SeatsPerRow { get; set; }
    public string? LayoutJson { get; set; }
    
    public Cinema? Cinema { get; set; }

    public int GetTotalSeats() => TotalRows * SeatsPerRow;
}
