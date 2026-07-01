namespace CinemaXNet.Models.Domain;

public class Cinema
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Province { get; set; } = "";
    public string District { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public string OpeningHours { get; set; } = "08:00 - 23:30";
    public string? Description { get; set; }
    public string? Facilities { get; set; } // JSON string e.g. "IMAX,Dolby Atmos"
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Calculated (not from DB)
    public double? Distance { get; set; }

    public string GetFullAddress() => $"{Address}, {District}, {Province}";

    public List<string> GetFacilityList() =>
        string.IsNullOrWhiteSpace(Facilities)
            ? []
            : [.. Facilities.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];

    public string GetImageUrl() =>
        ImageUrl ?? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop";
}
