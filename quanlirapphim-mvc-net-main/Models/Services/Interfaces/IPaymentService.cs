using CinemaXNet.Core.ValueObjects;

namespace CinemaXNet.Models.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentResult> ProcessAsync(string method, PaymentRequest request);
}
