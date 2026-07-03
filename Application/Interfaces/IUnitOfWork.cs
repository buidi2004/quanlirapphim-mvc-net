using System.Data;

namespace CinemaXNet.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    void BeginTransaction();
    void Commit();
    void Rollback();
}
