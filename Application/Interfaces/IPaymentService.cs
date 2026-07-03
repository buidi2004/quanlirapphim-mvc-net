using CinemaXNet.Domain.ValueObjects;

namespace CinemaXNet.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResult> ProcessAsync(string method, PaymentRequest request);
}
