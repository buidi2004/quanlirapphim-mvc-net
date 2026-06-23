using System.Data;
using CinemaXNet.Data;
using CinemaXNet.Models.Repository.Implementations;
using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Implementations;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

// ── MVC ────────────────────────────────────────────────────────────────────
builder.Services.AddControllersWithViews();

// ── Session ────────────────────────────────────────────────────────────────
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout        = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly    = true;
    options.Cookie.IsEssential = true;
});

// ── Cookie Authentication ──────────────────────────────────────────────────
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath        = "/login";
        options.LogoutPath       = "/logout";
        options.AccessDeniedPath = "/errors/403";
        options.Cookie.Name      = "CinemaX.Auth";
    })
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? "mock-client-id";
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? "mock-client-secret";
    })
    .AddFacebook(options =>
    {
        options.AppId = builder.Configuration["Authentication:Facebook:AppId"] ?? "mock-app-id";
        options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"] ?? "mock-app-secret";
    });

builder.Services.AddAuthorization();

// ── Database (Dapper + SQLite) ────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddScoped<IDbConnection>(_ => new SqliteConnection(connectionString));

// Initialize SQLite database schema and seed data
DatabaseInitializer.Initialize(connectionString);
Dapper.SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
Dapper.SqlMapper.AddTypeHandler(new TimeOnlyTypeHandler());

// ── Repositories ──────────────────────────────────────────────────────────
builder.Services.AddScoped<IMovieRepository,    MovieRepository>();
builder.Services.AddScoped<IUserRepository,     UserRepository>();
builder.Services.AddScoped<IShowtimeRepository, ShowtimeRepository>();
builder.Services.AddScoped<ITicketRepository,   TicketRepository>();
builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IDynamicPricingService, DynamicPricingService>();
builder.Services.AddScoped<ICinemaRepository,   CinemaRepository>();
builder.Services.AddScoped<IReviewRepository,   ReviewRepository>();

// ── Services ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<IUserService,      UserService>();
builder.Services.AddScoped<IMovieService,     MovieService>();
builder.Services.AddScoped<ITicketService,    TicketService>();
builder.Services.AddScoped<IPaymentService,   PaymentService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<ICinemaService,    CinemaService>();

// ── Background Service (thay cron job PHP) ────────────────────────────────
builder.Services.AddHostedService<HoldExpiryBackgroundService>();
builder.Services.AddHostedService<MarketingBackgroundService>();

// ── IHttpContextAccessor ──────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// ── Middleware Pipeline ────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error/500");
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/error/{0}");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

// ── Routes ─────────────────────────────────────────────────────────────────
// Attribute routes (defined in controllers with [Route] and [HttpGet/Post]) take priority.
// Default MVC route as fallback:
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

// Explicit friendly routes matching PHP URLs
app.MapControllerRoute("login",          "login",          new { controller = "Auth",      action = "Login" });
app.MapControllerRoute("register",       "register",       new { controller = "Auth",      action = "Register" });
app.MapControllerRoute("logout",         "logout",         new { controller = "Auth",      action = "Logout" });
app.MapControllerRoute("forgot-password","forgot-password",new { controller = "Auth",      action = "ForgotPassword" });
app.MapControllerRoute("reset-password", "reset-password", new { controller = "Auth",      action = "ResetPassword" });
app.MapControllerRoute("my-tickets",     "my-tickets",     new { controller = "Movie",     action = "MyTickets" });
app.MapControllerRoute("search",         "search",         new { controller = "Search",    action = "Index" });
app.MapControllerRoute("contact",        "contact",        new { controller = "Contact",   action = "Index" });
app.MapControllerRoute("news",           "news",           new { controller = "News",      action = "Index" });
app.MapControllerRoute("promotions",     "promotions",     new { controller = "Promotion", action = "Index" });
app.MapControllerRoute("cinemas",        "cinemas",        new { controller = "Cinema",    action = "Index" });
app.MapControllerRoute("profile",        "profile",        new { controller = "Profile",   action = "Index" });

app.Run();
