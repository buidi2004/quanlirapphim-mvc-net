using CinemaXNet.Core.Exceptions;
using CinemaXNet.Core.ValueObjects;
using CinemaXNet.Models.Services.Interfaces;

namespace CinemaXNet.Models.Services.Implementations;

// ── Strategy Pattern ───────────────────────────────────────────────────────
public interface IPaymentStrategy
{
    Task<PaymentResult> ProcessAsync(PaymentRequest request);
}

public class VNPayStrategy : IPaymentStrategy
{
    public Task<PaymentResult> ProcessAsync(PaymentRequest request) =>
        Task.FromResult(new PaymentResult { Success = true, TransactionId = "VNP_" + Guid.NewGuid().ToString("N")[..8] });
}

public class MoMoStrategy : IPaymentStrategy
{
    public Task<PaymentResult> ProcessAsync(PaymentRequest request) =>
        Task.FromResult(new PaymentResult { Success = true, TransactionId = "MOMO_" + Guid.NewGuid().ToString("N")[..8] });
}

public class CashStrategy : IPaymentStrategy
{
    public Task<PaymentResult> ProcessAsync(PaymentRequest request) =>
        Task.FromResult(new PaymentResult { Success = true, TransactionId = "CASH_" + Guid.NewGuid().ToString("N")[..8] });
}

// ── PaymentService ─────────────────────────────────────────────────────────
public class PaymentService : IPaymentService
{
    private readonly Dictionary<string, IPaymentStrategy> _strategies = new()
    {
        ["vnpay"] = new VNPayStrategy(),
        ["momo"]  = new MoMoStrategy(),
        ["cash"]  = new CashStrategy(),
    };

    public async Task<PaymentResult> ProcessAsync(string method, PaymentRequest request)
    {
        if (!_strategies.TryGetValue(method, out var strategy))
            throw new BusinessException($"Phương thức thanh toán '{method}' không được hỗ trợ.");

        return await strategy.ProcessAsync(request);
    }
}
