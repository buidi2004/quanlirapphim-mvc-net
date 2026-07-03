using AutoMapper;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.DTOs;

namespace CinemaXNet.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Movie, MovieSummaryDto>();
    }
}
