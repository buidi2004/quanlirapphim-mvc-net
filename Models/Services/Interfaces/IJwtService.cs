using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Services.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
