// IJwtService: Interface dinh nghia cac phuong thuc Hop dong cho IJwt
﻿using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}
