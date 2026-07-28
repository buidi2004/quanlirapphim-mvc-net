namespace CinemaXNet.Domain.ValueObjects;

// HoldResult: Là một Value Object đóng gói kết quả trả về sau khi thực hiện thao tác Giữ Ghế thành công
public class HoldResult
{
    public List<int> TicketIds { get; }  // Danh sách ID các vé tạm thời vừa tạo
    public DateTime ExpiryTime { get; }  // Mốc thời gian UTC mà phiên giữ ghế này sẽ hết hiệu lực

    public HoldResult(List<int> ticketIds, DateTime expiryTime)
    {
        TicketIds = ticketIds;
        ExpiryTime = expiryTime;
    }

    // Hàm hỗ trợ tính toán số giây đếm ngược còn lại (Dùng hiển thị đồng hồ đếm ngược 15 phút trên giao diện)
    public int GetRemainingSeconds() =>
        Math.Max(0, (int)(ExpiryTime - DateTime.UtcNow).TotalSeconds);
}
//INotification: Bắn sự kiện ra toàn hệ thống. Các chức năng ăn theo (gửi email, tích điểm, tạo hóa đơn) tự nghe thấy để chạy mà không bị dính chặt code vào nhau.

//UserId & TotalPrice: Thông tin đính kèm (Ai mua, Bao nhiêu tiền).

//Transaction: Cho phép các tác vụ sau dùng chung giao dịch Database — nếu có bước bị lỗi thì Rollback tất cả, tránh mất tiền hay sai dữ liệu