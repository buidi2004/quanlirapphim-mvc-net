namespace CinemaXNet.Domain.Exceptions;

// NotFoundException: Ngoại lệ ném ra khi không tìm thấy tài nguyên trong Database (Trợ giúp Controller trả về lỗi HTTP 404)
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}
