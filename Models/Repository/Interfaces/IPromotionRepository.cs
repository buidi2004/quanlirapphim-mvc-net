using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface IPromotionRepository
{
    Task<Promotion?> FindByCodeAsync(string code);
}
