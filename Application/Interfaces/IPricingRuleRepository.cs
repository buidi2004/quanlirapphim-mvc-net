using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IPricingRuleRepository
{
    Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset);
    Task<int> GetCountAsync();
}
