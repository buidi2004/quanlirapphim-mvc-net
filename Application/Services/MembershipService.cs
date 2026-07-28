// MembershipService: Service xu ly cac logic nghiep vu (Business Logic) cho Membership
﻿using System.Collections.Generic;
using System.Threading.Tasks;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class MembershipService(IMembershipRepository repo) : IMembershipService
{
    // Xử lý logic và luồng thực thi cho phương thức GetAllTiersAsync
    public Task<IEnumerable<dynamic>> GetAllTiersAsync() => repo.GetAllTiersAsync();
}
