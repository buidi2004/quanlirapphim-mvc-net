using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Services;

public class CampaignService(ICampaignRepository repo) : ICampaignService
{
    public async Task<PaginatedList<dynamic>> GetPaginatedAsync(int page, int pageSize)
    {
        int limit = pageSize;
        int offset = (page - 1) * pageSize;
        var count = await repo.GetCountAsync();
        var items = await repo.GetAllAsync(limit, offset);
        return new PaginatedList<dynamic>(items.ToList(), count, page, pageSize);
    }

    public Task CreateAsync(dynamic campaign) => repo.CreateAsync(campaign);
}
