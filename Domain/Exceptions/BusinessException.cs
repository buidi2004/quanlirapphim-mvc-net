namespace CinemaXNet.Domain.Exceptions;

// BusinessException: Ngoại lệ dùng chung cho các lỗi quy tắc Nghiệp vụ (Ví dụ: Mã giảm giá hết hạn, Vượt quá số vé tối đa...)
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
}
