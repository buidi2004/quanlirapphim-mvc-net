using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

// [Authorize]: Đảm bảo chỉ những người đã đăng nhập mới truy cập được.
// (Roles = "..."): Phân quyền cụ thể, chỉ tài khoản có vai trò 'admin' hoặc 'cinema_manager' mới được phép thao tác với Khuyến mãi.
[Authorize(Roles = "admin,cinema_manager")]
// [Route]: Định nghĩa URL gốc cho toàn bộ Controller này là "/admin/promotions"
[Route("admin/promotions")]
public class AdminPromotionsController(IPromotionService promotionService) : Controller
{
    // Hành động hiển thị danh sách Khuyến mãi (GET /admin/promotions)
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        // Gọi Service để phân trang dữ liệu (lấy 10 dòng mỗi trang) thay vì load toàn bộ làm chậm hệ thống
        var paginated = await promotionService.GetPaginatedAsync(page, pageSize);
        
        // Trả về View HTML tương ứng nằm trong thư mục Views/Admin/Promotions/Index.cshtml
        return View("~/Views/Admin/Promotions/Index.cshtml", paginated);
    }

    // Hành động Thêm mới Khuyến mãi (POST /admin/promotions)
    [HttpPost]
    // [ValidateAntiForgeryToken]: Bảo vệ ứng dụng khỏi tấn công giả mạo Request (CSRF). Yêu cầu Form phải có Token hợp lệ.
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            // Truyền dữ liệu dạng object ẩn danh (anonymous object) xuống Service để xử lý tạo mới
            await promotionService.CreateAsync(new { Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            
            // Dùng TempData để truyền thông báo thành công sang lần Request tiếp theo (hiển thị màu xanh lá)
            TempData["Success"] = "Thêm khuyến mãi thành công!";
        }
        catch (Exception)
        {
            // Dùng TempData để báo lỗi nếu thao tác Database thất bại (hiển thị màu đỏ)
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        
        // Dù thành công hay thất bại cũng quay trở về trang Danh sách (hàm Index)
        return RedirectToAction(nameof(Index));
    }

    // Hành động Cập nhật Khuyến mãi (POST /admin/promotions/update)
    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string code, string title, string description, decimal discountPercent, string validFrom, string validTo, bool isActive)
    {
        try
        {
            // Tương tự Store, nhưng gọi hàm UpdateAsync và phải truyền kèm ID
            await promotionService.UpdateAsync(new { Id = id, Code = code, Title = title, Description = description, DiscountPercent = discountPercent, ValidFrom = validFrom, ValidTo = validTo, IsActive = isActive });
            TempData["Success"] = "Cập nhật khuyến mãi thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    // Hành động Xóa Khuyến mãi (POST /admin/promotions/delete)
    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            // Chỉ cần truyền ID xuống Service để xóa
            await promotionService.DeleteAsync(id);
            TempData["Success"] = "Xóa khuyến mãi thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
