using System;

namespace CinemaXNet.Models.Domain;

public class Review
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties for JOINs
    public User? User { get; set; }
    public Movie? Movie { get; set; }
}
