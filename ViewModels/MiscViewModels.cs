namespace CinemaXNet.ViewModels;

public class PromotionItemViewModel
{
    public int     Id            { get; set; }
    public string  Code          { get; set; } = "";
    public string  DiscountType  { get; set; } = "";
    public decimal DiscountValue { get; set; }
    public string? ExpiresAt     { get; set; }
    public int     UsedCount     { get; set; }
    public int?    MaxUses       { get; set; }
    public string? ImageUrl      { get; set; }

    public string GetDiscountText() => DiscountType == "percent"
        ? $"Giảm {DiscountValue:0}%"
        : $"Giảm {DiscountValue:N0}đ";

    public string GetUsageText() => MaxUses.HasValue
        ? $"{UsedCount}/{MaxUses} lượt dùng"
        : $"{UsedCount} lượt dùng";
}

public class NewsItemViewModel
{
    public string  Title       { get; set; } = "";
    public string  Slug        { get; set; } = "";
    public string  Category    { get; set; } = "";
    public string? ImageUrl    { get; set; }
    public string  Summary     { get; set; } = "";
    public string? PublishedAt { get; set; }
}

public class SearchViewModel
{
    public string  Query   { get; set; } = "";
    public string? Genre   { get; set; }
    public IEnumerable<CinemaXNet.Models.Domain.Movie> Results { get; set; } = [];
}
