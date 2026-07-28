// IDashboardService: Interface dinh nghia cac phuong thuc Hop dong cho IDashboard
﻿using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStats> GetDashboardStatsAsync();
}
