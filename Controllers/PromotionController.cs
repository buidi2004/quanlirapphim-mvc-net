using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("promotions")]
public class PromotionController : Controller
{
    private static readonly List<PromotionItemViewModel> MockPromotions =
    [
        new() { Id=1, Code="SUMMER2026",  DiscountType="percent", DiscountValue=20, MaxUses=1000, UsedCount=50,
                ExpiresAt=DateTime.Today.AddDays(30).ToString("yyyy-MM-dd"),
                ImageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" },
        new() { Id=2, Code="VALENTINE",   DiscountType="percent", DiscountValue=15, MaxUses=500, UsedCount=10,
                ExpiresAt=DateTime.Today.AddDays(15).ToString("yyyy-MM-dd"),
                ImageUrl="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop" },
        new() { Id=3, Code="TUESDAY",     DiscountType="fixed",   DiscountValue=50000, MaxUses=null, UsedCount=200,
                ExpiresAt=DateTime.Today.AddDays(90).ToString("yyyy-MM-dd"),
                ImageUrl="https://images.unsplash.com/photo-1440407876336-62333a6f010f?q=80&w=800&auto=format&fit=crop" },
        new() { Id=4, Code="CINEMAXVIP",  DiscountType="percent", DiscountValue=30, MaxUses=100, UsedCount=5,
                ExpiresAt=DateTime.Today.AddDays(10).ToString("yyyy-MM-dd"),
                ImageUrl="https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=800&auto=format&fit=crop" },
    ];

    // GET /promotions
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.Promotions    = MockPromotions;
        ViewBag.FeaturedPromos = MockPromotions.Take(3).ToList();
        ViewBag.PageTitle     = "Khuyến mãi — CinemaX";
        return View();
    }

    // GET /promotions/{id}
    [HttpGet("{id:int}")]
    public IActionResult Detail(int id)
    {
        var promo = MockPromotions.FirstOrDefault(p => p.Id == id);
        if (promo == null) return NotFound();

        ViewBag.PageTitle = $"{promo.Code} — CinemaX";
        return View(promo);
    }

    // GET /api/promotions/apply
    [HttpGet("/api/promotions/apply")]
    public IActionResult ApplyPromotion([FromQuery] string code, [FromQuery] decimal amount)
    {
        if (string.IsNullOrWhiteSpace(code)) 
            return Json(new { success = false, message = "Mã giảm giá không hợp lệ." });

        var promo = MockPromotions.FirstOrDefault(p => p.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        if (promo == null)
            return Json(new { success = false, message = "Mã giảm giá không tồn tại." });

        if (!string.IsNullOrEmpty(promo.ExpiresAt) && DateTime.Parse(promo.ExpiresAt) < DateTime.Today)
            return Json(new { success = false, message = "Mã giảm giá đã hết hạn." });

        decimal discountAmount = 0;
        if (promo.DiscountType == "percent")
        {
            discountAmount = amount * ((decimal)promo.DiscountValue / 100m);
        }
        else if (promo.DiscountType == "fixed")
        {
            discountAmount = (decimal)promo.DiscountValue;
        }

        if (discountAmount > amount) discountAmount = amount;
        
        var finalTotal = amount - discountAmount;

        return Json(new { 
            success = true, 
            message = "Áp dụng mã giảm giá thành công!", 
            discountAmount = discountAmount, 
            finalTotal = finalTotal 
        });
    }
}
