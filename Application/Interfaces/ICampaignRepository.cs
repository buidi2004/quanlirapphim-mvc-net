using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface ICampaignRepository
{
    Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset);
    Task<int> GetCountAsync();
    Task CreateAsync(dynamic campaign);
}
