// ScannerService: Service xu ly cac logic nghiep vu (Business Logic) cho Scanner
﻿using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ScannerService(IScannerRepository repository) : IScannerService
{
    // Xử lý logic và luồng thực thi cho phương thức GetTicketDetailsForScanAsync
    public async Task<dynamic?> GetTicketDetailsForScanAsync(int ticketId)
    {
        return await repository.GetTicketDetailsForScanAsync(ticketId);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateTicketStatusAsync
    public async Task UpdateTicketStatusAsync(int ticketId, string status)
    {
        await repository.UpdateTicketStatusAsync(ticketId, status);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateConcessionStatusAsync
    public async Task UpdateConcessionStatusAsync(int ticketId, string concessionStatus)
    {
        await repository.UpdateConcessionStatusAsync(ticketId, concessionStatus);
    }
}
