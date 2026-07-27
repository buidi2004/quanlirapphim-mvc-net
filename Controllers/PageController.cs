using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("pages")]
public class PageController : Controller
{
    [HttpGet("{slug}")]
    public IActionResult Show(string slug)
    {
        // Sanitize slug to prevent directory traversal
        slug = slug.Replace("/", "").Replace("\\", "").Replace(".", "");
        
        var viewPath = $"~/Views/Page/{slug}.cshtml";
        
        // Simple file existence check for the view (though returning View() will also 404 if not found)
        var env = HttpContext.RequestServices.GetService<IWebHostEnvironment>();
        if (env != null)
        {
            var physicalPath = Path.Combine(env.ContentRootPath, "Views", "Page", $"{slug}.cshtml");
            if (!System.IO.File.Exists(physicalPath))
            {
                return NotFound();
            }
        }

        return View(viewPath);
    }
}
