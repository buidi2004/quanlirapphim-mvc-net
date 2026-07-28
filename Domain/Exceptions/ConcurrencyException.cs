namespace CinemaXNet.Domain.Exceptions;

// ConcurrencyException: Ngoại lệ xảy ra khi có xung đột tranh chấp dữ liệu đồng thời (Optimistic Concurrency Control Violation)
public class ConcurrencyException : Exception
{
    public ConcurrencyException(string message) : base(message) { }
}
