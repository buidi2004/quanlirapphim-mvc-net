using CinemaXNet.Core.Exceptions;
using CinemaXNet.Core.ValueObjects;
using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;

namespace CinemaXNet.Models.Services.Implementations;

public class PromotionService(IPromotionRepository promoRepo) : IPromotionService
{
    public async Task<PromotionResult> ApplyPromotionAsync(string code, decimal subtotal)
    {
        var promo = await promoRepo.FindByCodeAsync(code.ToUpper().Trim());

        if (promo == null)
            throw new BusinessException("Mã giảm giá không tồn tại.");
        if (!promo.IsActive)
            throw new BusinessException("Mã giảm giá đã bị vô hiệu hóa.");
        if (promo.ExpiresAt.HasValue && promo.ExpiresAt.Value < DateTime.UtcNow)
            throw new BusinessException("Mã giảm giá đã hết hạn.");
        if (promo.MaxUses.HasValue && promo.UsedCount >= promo.MaxUses.Value)
            throw new BusinessException("Mã giảm giá đã hết lượt sử dụng.");

        var discount = promo.DiscountType switch
        {
            "percent" => subtotal * (promo.DiscountValue / 100),
            "fixed"   => Math.Min(promo.DiscountValue, subtotal),
            _         => throw new BusinessException("Loại giảm giá không hợp lệ.")
        };

        return new PromotionResult
        {
            Code       = code,
            Discount   = discount,
            TotalPrice = Math.Max(0, subtotal - discount)
        };
    }

    public async Task<bool> ValidateCodeAsync(string code)
    {
        try { await ApplyPromotionAsync(code, 1); return true; }
        catch (BusinessException) { return false; }
    }
}
