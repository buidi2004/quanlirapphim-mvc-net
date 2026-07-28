// IPaymentService: Interface dinh nghia cac phuong thuc Hop dong cho IPayment
﻿using CinemaXNet.Domain.ValueObjects;

namespace CinemaXNet.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResult> ProcessAsync(string method, PaymentRequest request);
}
