using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.ValueObjects;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

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

public class ZaloPayStrategy : IPaymentStrategy
{
    public Task<PaymentResult> ProcessAsync(PaymentRequest request) =>
        // Giả lập delay mạng thật của ZaloPay (200ms) để test load/tốc độ
        Task.Delay(200).ContinueWith(_ => new PaymentResult { Success = true, TransactionId = "ZALO_" + Guid.NewGuid().ToString("N")[..8] });
}

// ── PaymentService ─────────────────────────────────────────────────────────
public class PaymentService : IPaymentService
{
    private readonly Dictionary<string, IPaymentStrategy> _strategies = new()
    {
        ["vnpay"]   = new VNPayStrategy(),
        ["momo"]    = new MoMoStrategy(),
        ["zalopay"] = new ZaloPayStrategy(),
        ["cash"]    = new CashStrategy(),
    };

    public async Task<PaymentResult> ProcessAsync(string method, PaymentRequest request)
    {
        if (!_strategies.TryGetValue(method, out var strategy))
            throw new BusinessException($"Phương thức thanh toán '{method}' không được hỗ trợ.");

        return await strategy.ProcessAsync(request);
    }
}
