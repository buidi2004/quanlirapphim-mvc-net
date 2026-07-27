using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.ValueObjects;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Services;

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

    public async Task<PaginatedList<dynamic>> GetPaginatedAsync(int page, int pageSize)
    {
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        var count = await promoRepo.GetCountAsync();
        var promos = await promoRepo.GetAllAsync(limit, offset);
        return new PaginatedList<dynamic>(promos.ToList(), count, page, pageSize);
    }

    public Task CreateAsync(dynamic promotion) => promoRepo.CreateAsync(promotion);
    public Task UpdateAsync(dynamic promotion) => promoRepo.UpdateAsync(promotion);
    public Task DeleteAsync(int id) => promoRepo.DeleteAsync(id);
}
