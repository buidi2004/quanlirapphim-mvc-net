using CinemaXNet.Application.ViewModels;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IPricingRuleService
{
    Task<PaginatedList<dynamic>> GetPaginatedAsync(int page, int pageSize);
}
