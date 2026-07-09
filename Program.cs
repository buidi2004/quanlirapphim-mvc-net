using System.Data;
using CinemaXNet.Infrastructure.Data;
using CinemaXNet.Infrastructure.Repositories;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Services;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Data.Sqlite;
using Serilog;
using CinemaXNet.Infrastructure.Middleware;
using System.Reflection;
using ModelContextProtocol.Server;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ────────────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .ReadFrom.Configuration(ctx.Configuration));

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
    })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Secret Key is not configured.");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "CinemaX",
            ValidAudience = jwtSettings["Audience"] ?? "CinemaXUsers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.SetIsOriginAllowed(_ => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// ── Database (Dapper + SQLite) ────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddScoped<IDbConnection>(_ => new SqliteConnection(connectionString));

// Initialize SQLite database schema and seed data
DatabaseInitializer.Initialize(connectionString);
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
Dapper.SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
Dapper.SqlMapper.AddTypeHandler(new TimeOnlyTypeHandler());

// ── Repositories ──────────────────────────────────────────────────────────
builder.Services.AddScoped<ICinemaRepository, CinemaRepository>();
builder.Services.AddScoped<IMovieRepository, MovieRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IMembershipRepository, MembershipRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<IPricingRuleRepository, PricingRuleRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<INewsRepository, NewsRepository>();
builder.Services.AddScoped<ISettingRepository, SettingRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IShowtimeRepository, ShowtimeRepository>();
builder.Services.AddScoped<IFoodBeverageRepository, FoodBeverageRepository>();
builder.Services.AddScoped<IScannerRepository, ScannerRepository>();
builder.Services.AddScoped<IRefundRepository, RefundRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

// Đăng ký Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ICinemaService, CinemaService>();
builder.Services.AddScoped<IDynamicPricingService, DynamicPricingService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IMembershipService, MembershipService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IPricingRuleService, PricingRuleService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<ISettingService, SettingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IShowtimeService, ShowtimeService>();
builder.Services.AddScoped<IFoodBeverageService, FoodBeverageService>();
builder.Services.AddScoped<IScannerService, ScannerService>();
builder.Services.AddScoped<IRefundService, RefundService>();
builder.Services.AddScoped<IReportService, ReportService>();

// ── AutoMapper & MediatR ──────────────────────────────────────────────────
builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

builder.Services.AddScoped<IUserService,      UserService>();
builder.Services.AddScoped<IMovieService,     MovieService>();
builder.Services.AddScoped<ITicketService,    TicketService>();
builder.Services.AddScoped<IPaymentService,   PaymentService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<ICinemaService,    CinemaService>();
builder.Services.AddScoped<IJwtService,       JwtService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// ── Background Service (thay cron job PHP) ────────────────────────────────
builder.Services.AddHostedService<HoldExpiryBackgroundService>();
builder.Services.AddHostedService<MarketingBackgroundService>();

// ── IHttpContextAccessor ──────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();

// ── MCP Server ────────────────────────────────────────────────────────────
builder.Services.AddMcpServer(options => 
{
    options.ServerInfo = new() { Name = "CinemaX-MCP", Version = "1.0.0" };
})
.WithHttpTransport(options => options.Stateless = true)
.WithToolsFromAssembly(typeof(Program).Assembly);

var app = builder.Build();

// ── Middleware Pipeline ────────────────────────────────────────────────────
app.UseMiddleware<GlobalExceptionMiddleware>();

if (!app.Environment.IsDevelopment())
{
    // app.UseExceptionHandler("/error/500");
    app.UseHsts();
}
app.UseWhen(context => !context.Request.Path.StartsWithSegments("/api"), appBuilder =>
{
    appBuilder.UseStatusCodePagesWithReExecute("/error/{0}");
});

app.UseWhen(context => context.Request.Path.StartsWithSegments("/api"), appBuilder =>
{
    appBuilder.UseStatusCodePages(async context =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(new { 
            success = false, 
            error = "Truy cập bị từ chối hoặc không tìm thấy tài nguyên (Lỗi " + context.HttpContext.Response.StatusCode + ")" 
        });
    });
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowAll");

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

// ── MCP Endpoint ───────────────────────────────────────────────────────────
app.MapMcp("/api/mcp");

app.Run();
