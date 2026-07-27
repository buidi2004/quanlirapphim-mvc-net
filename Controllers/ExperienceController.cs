using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("experiences")]
public class ExperienceController : Controller
{
    private static readonly Dictionary<string, dynamic> Experiences = new()
    {
        ["dolby-atmos"] = new
        {
            Name        = "Âm Thanh Dolby Atmos",
            Slug        = "dolby-atmos",
            Slogan      = "Cảm nhận từng nhịp đập, đắm chìm trong không gian 3D",
            Image       = "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1200&auto=format&fit=crop",
            Icon        = "bi-speaker",
            BadgeColor  = "bg-success",
            Features    = new[] {
                new { Icon="bi-speaker", Title="Âm thanh đa chiều",
                      Desc="Âm thanh không chỉ phát ra từ các hướng xung quanh mà còn xuất hiện ngay trên đỉnh đầu, mang lại cảm giác chân thực đến khó tin." },
                new { Icon="bi-music-note-beamed", Title="Chi tiết kinh ngạc",
                      Desc="Mỗi âm thanh là một thực thể độc lập (object-based), từ tiếng lá rơi đến tiếng gầm phi thuyền, tất cả đều trong trẻo và tách bạch." },
                new { Icon="bi-heart-pulse", Title="Cảm xúc bùng nổ",
                      Desc="Khơi dậy mạnh mẽ mọi giác quan, khiến bạn có cảm giác như mình đang đứng ngay giữa trung tâm bối cảnh bộ phim." },
            },
            Desc = "Hệ thống âm thanh Dolby Atmos® vận hành thông qua việc đưa âm thanh di chuyển tự do mọi hướng trong không gian rạp 3 chiều, đây là sự đột phá vượt bậc so với hệ thống âm thanh kênh truyền thống.",
            Note = "Hơn 50 phòng chiếu tại hệ thống CinemaX toàn quốc đã được trang bị công nghệ Dolby Atmos. Hãy chọn vé xem phim có biểu tượng ATMOS để thưởng thức."
        },
        ["imax"] = new
        {
            Name        = "Màn Hình IMAX Khổng Lồ",
            Slug        = "imax",
            Slogan      = "Đừng chỉ xem phim. Hãy là một phần của bộ phim.",
            Image       = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
            Icon        = "bi-display",
            BadgeColor  = "bg-primary",
            Features    = new[] {
                new { Icon="bi-camera-reels", Title="Máy quay IMAX",
                      Desc="Máy quay phim có độ phân giải cao nhất thế giới, bắt trọn những khung hình mở rộng với tỷ lệ khung hình độc quyền 1.90:1 hoặc 1.43:1." },
                new { Icon="bi-display", Title="Hệ thống máy chiếu kép",
                      Desc="IMAX sử dụng hai máy chiếu 4K laser song song mang lại độ sáng vượt trội, độ tương phản tuyệt đối và dải màu phong phú." },
                new { Icon="bi-aspect-ratio", Title="Thiết kế phòng chiếu",
                      Desc="Màn hình cong khổng lồ thiết kế vát góc tối ưu, chỗ ngồi dạng sân vận động đảm bảo góc nhìn hoàn hảo ở mọi vị trí." },
            },
            Desc = "Từ những bộ phim bom tấn Hollywood được quay hoàn toàn bằng máy quay IMAX, đến thiết kế phòng chiếu hình vòm bọc trọn tầm nhìn, IMAX mang đến hình ảnh rực rỡ, độ phân giải sắc nét tối đa và kích thước khổng lồ.",
            Note = "Các phòng IMAX tại CinemaX được thiết kế và chứng nhận bởi IMAX Corporation, đảm bảo trải nghiệm chuẩn mực quốc tế."
        },
        ["sweetbox"] = new
        {
            Name        = "Ghế Đôi Sweetbox",
            Slug        = "sweetbox",
            Slogan      = "Riêng tư tuyệt đối, trọn vẹn yêu thương",
            Image       = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop",
            Icon        = "bi-heart-fill",
            BadgeColor  = "bg-danger",
            Features    = new[] {
                new { Icon="bi-heart-fill", Title="Gần gũi hơn bao giờ hết",
                      Desc="Lược bỏ tay vịn ở giữa giúp hai người có thể ngồi sát bên nhau thoải mái, tựa vai dễ dàng." },
                new { Icon="bi-shield-lock-fill", Title="Riêng tư tuyệt đối",
                      Desc="Vách ngăn che chắn hai bên và phía sau rất cao, hạn chế tối đa sự ảnh hưởng từ những người xung quanh." },
                new { Icon="bi-star-fill", Title="Chất liệu êm ái",
                      Desc="Đệm ghế bọc da PU cao cấp siêu mềm, kích thước rộng rãi hơn ghế thông thường." },
            },
            Desc = "Sweetbox là hàng ghế đặc biệt bố trí ở cuối phòng chiếu, trang bị vách ngăn cao cấp cùng thiết kế ghế dính liền loại bỏ tựa tay ở giữa, tạo nên không gian hoàn toàn riêng tư cho các cặp đôi.",
            Note = "Ghế Sweetbox có giá vé cao hơn ghế thường. Đặt sớm để chọn vị trí đẹp nhất!"
        }
    };

    // GET /experiences/{slug}
    [HttpGet("{slug}")]
    public IActionResult Detail(string slug)
    {
        if (!Experiences.TryGetValue(slug, out var item))
            return NotFound();

        ViewBag.Item      = item;
        ViewBag.PageTitle = $"{item.Name} — CinemaX";
        ViewBag.AllItems  = Experiences.Values.ToList();
        return View();
    }
}
