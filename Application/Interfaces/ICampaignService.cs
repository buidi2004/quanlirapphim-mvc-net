// ICampaignService: Interface dinh nghia cac phuong thuc Hop dong cho ICampaign
﻿using CinemaXNet.Application.ViewModels;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface ICampaignService
{
    Task<PaginatedList<dynamic>> GetPaginatedAsync(int page, int pageSize);
    Task CreateAsync(dynamic campaign);
}
