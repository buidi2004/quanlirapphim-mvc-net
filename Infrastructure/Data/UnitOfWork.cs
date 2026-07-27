using System.Data;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Infrastructure.Data;

public class UnitOfWork(IDbConnection dbConnection) : IUnitOfWork
{
    private IDbTransaction? _transaction;

    public void BeginTransaction()
    {
        if (dbConnection.State == ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        _transaction = dbConnection.BeginTransaction();
    }

    public void Commit()
    {
        try
        {
            _transaction?.Commit();
        }
        finally
        {
            _transaction?.Dispose();
            _transaction = null;
        }
    }

    public void Rollback()
    {
        try
        {
            _transaction?.Rollback();
        }
        finally
        {
            _transaction?.Dispose();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        dbConnection.Dispose();
        GC.SuppressFinalize(this);
    }
}
