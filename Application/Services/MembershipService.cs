using System.Collections.Generic;
using System.Threading.Tasks;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class MembershipService(IMembershipRepository repo) : IMembershipService
{
    public Task<IEnumerable<dynamic>> GetAllTiersAsync() => repo.GetAllTiersAsync();
}
