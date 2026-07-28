// IScannerRepository: Interface dinh nghia cac phuong thuc Hop dong cho IScanner
﻿using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IScannerRepository
{
    Task<dynamic?> GetTicketDetailsForScanAsync(int ticketId);
    Task UpdateTicketStatusAsync(int ticketId, string status);
    Task UpdateConcessionStatusAsync(int ticketId, string concessionStatus);
}
