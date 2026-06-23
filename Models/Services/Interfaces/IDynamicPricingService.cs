using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Services.Interfaces;

public interface IDynamicPricingService
{
    Task<decimal> CalculatePriceAsync(Showtime showtime);
}
