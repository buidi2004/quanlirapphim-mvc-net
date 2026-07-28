// IDynamicPricingService: Interface dinh nghia cac phuong thuc Hop dong cho IDynamicPricing
﻿using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IDynamicPricingService
{
    Task<decimal> CalculatePriceAsync(Showtime showtime);
    Task<IDictionary<int, decimal>> CalculatePricesAsync(IEnumerable<Showtime> showtimes);
}
