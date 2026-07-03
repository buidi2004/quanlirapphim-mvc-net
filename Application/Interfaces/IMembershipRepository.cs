using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IMembershipRepository
{
    Task<IEnumerable<dynamic>> GetAllTiersAsync();
}
