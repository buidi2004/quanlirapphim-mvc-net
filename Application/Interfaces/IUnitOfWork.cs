// IUnitOfWork: Interface dinh nghia cac phuong thuc Hop dong cho IUnitOfWork
﻿using System.Data;

namespace CinemaXNet.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    void BeginTransaction();
    void Commit();
    void Rollback();
}
