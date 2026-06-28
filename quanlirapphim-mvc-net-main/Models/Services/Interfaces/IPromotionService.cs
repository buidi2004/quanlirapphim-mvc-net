using CinemaXNet.Core.ValueObjects;

namespace CinemaXNet.Models.Services.Interfaces;

public interface IPromotionService
{
    Task<PromotionResult> ApplyPromotionAsync(string code, decimal subtotal);
    Task<bool> ValidateCodeAsync(string code);
}
