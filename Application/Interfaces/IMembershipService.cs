// IMembershipService: Interface dinh nghia cac phuong thuc Hop dong cho IMembership
﻿using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IMembershipService
{
    Task<IEnumerable<dynamic>> GetAllTiersAsync();
}
