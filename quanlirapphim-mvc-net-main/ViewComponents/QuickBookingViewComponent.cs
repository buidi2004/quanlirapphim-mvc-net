using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.ViewComponents;

public class QuickBookingViewComponent(IMovieService movieService) : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync()
    {
        var nowShowing = await movieService.GetNowShowingAsync();
        return View(nowShowing);
    }
}
