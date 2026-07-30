// Program: Thanh phan ma nguon xu ly logic trong he thong CinemaX
using System.Data;
using CinemaXNet.Infrastructure.Data;
using CinemaXNet.Infrastructure.Repositories;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Services;
using CinemaXNet.Hubs;
using CinemaXNet.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MySqlConnector;
using Serilog;
using CinemaXNet.Infrastructure.Middleware;
using System.Reflection;
using ModelContextProtocol.Server;
using Microsoft.AspNetCore.HttpOverrides;

// Program.cs: Điểm khởi đầu (Entry Point) của ứng dụng ASP.NET Core 8.0.
// Đảm nhận 2 nhiệm vụ chính: 
// 1. Cấu hình Container Dependency Injection (DI) để Đăng ký các Services, Repositories, Authentication.
// 2. Thiết lập đường ống xử lý yêu cầu HTTP (Middleware Pipeline).

var builder = WebApplication.CreateBuilder(args);

// ── 1. Cấu hình Ghi Log (Logging) bằng Serilog ─────────────────────────────
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .ReadFrom.Configuration(ctx.Configuration));

// ── 2. Đăng ký dịch vụ MVC & SignalR Realtime ──────────────────────────────
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR(); // Đăng ký WebSocket SignalR cho SeatHub

// Đăng ký IMemoryCache cho hot-data caching (banners, movies, settings)
builder.Services.AddMemoryCache();
// Đăng ký Response Caching Middleware (bắt buộc để [ResponseCache] trên Controller có tác dụng)
builder.Services.AddResponseCaching();

// ── 3. Cấu hình Proxy Nginx / Docker (Forwarded Headers) ────────────────────
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── 4. Cấu hình Bộ nhớ tạm & Session ───────────────────────────────────────
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout        = TimeSpan.FromMinutes(30); // Session hết hạn sau 30 phút không thao tác
    options.Cookie.HttpOnly    = true;
    options.Cookie.IsEssential = true;
});

// ── 5. Cấu hình Xác thực (Authentication: Cookie + JWT + Google + Facebook) ─
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath        = "/login";       // Chuyển hướng khi chưa đăng nhập
        options.LogoutPath       = "/logout";
        options.AccessDeniedPath = "/errors/403";  // Chuyển hướng khi không đủ quyền (Forbidden)
        options.Cookie.Name      = "CinemaX.Auth";
    })
    .AddGoogle(options => // Đăng nhập bằng Google OAuth
    {
        var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
        var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
        options.ClientId = string.IsNullOrEmpty(googleClientId) ? "not-configured" : googleClientId;
        options.ClientSecret = string.IsNullOrEmpty(googleClientSecret) ? "not-configured" : googleClientSecret;
    })
    .AddFacebook(options => // Đăng nhập bằng Facebook OAuth
    {
        var fbAppId = builder.Configuration["Authentication:Facebook:AppId"];
        var fbAppSecret = builder.Configuration["Authentication:Facebook:AppSecret"];
        options.AppId = string.IsNullOrEmpty(fbAppId) ? "not-configured" : fbAppId;
        options.AppSecret = string.IsNullOrEmpty(fbAppSecret) ? "not-configured" : fbAppSecret;
    })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => // Xác thực JWT dành cho Mobile App API
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

// Cấu hình CORS cho phép Mobile App hoặc các Domain khác gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.SetIsOriginAllowed(_ => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// ── 6. Đăng ký Database Connection (Dapper + MySQL) ───────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
// Tăng Min/Max pool để tránh tạo connection mới mỗi request dưới load cao
var mysqlBuilder = new MySqlConnector.MySqlConnectionStringBuilder(connectionString)
{
    MinimumPoolSize = 5,
    MaximumPoolSize = 50,
    ConnectionTimeout = 10,
    DefaultCommandTimeout = 30,
};
builder.Services.AddScoped<IDbConnection>(_ => new MySqlConnection(mysqlBuilder.ConnectionString));

// Tự động khởi tạo bảng DB và dữ liệu mẫu (Seed Data) nếu DB trống
DatabaseInitializer.Initialize(connectionString);
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true; // Map tự động column_name MySQL -> ColumnName C#
Dapper.SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
Dapper.SqlMapper.AddTypeHandler(new TimeOnlyTypeHandler());

// ── 7. Đăng ký Repositories (Data Access Layer - Scope: Per Request) ──────
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
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IBannerRepository, BannerRepository>();

// ── 8. Đăng ký Business Services (Application Layer) ──────────────────────
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IImageUploadService, ImageUploadService>();
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
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IBannerService, BannerService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// ── 9. Đăng ký AutoMapper & MediatR ───────────────────────────────────────
builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// ── 10. Đăng ký các Tiến trình chạy ngầm (Background Hosted Services) ──────
builder.Services.AddHostedService<HoldExpiryBackgroundService>(); // Nhả ghế hết hạn
builder.Services.AddHostedService<MarketingBackgroundService>();   // Gửi mail khuyến mãi

builder.Services.AddHttpContextAccessor();

// ── 11. Đăng ký MCP Server Endpoint ────────────────────────────────────────
builder.Services.AddMcpServer(options => 
{
    options.ServerInfo = new() { Name = "CinemaX-MCP", Version = "1.0.0" };
})
.WithHttpTransport(options => options.Stateless = true)
.WithToolsFromAssembly(typeof(Program).Assembly);

var app = builder.Build();

// ── 12. Cấu hình Middleware Pipeline (Thứ tự xử lý Request) ───────────────
app.UseMiddleware<GlobalExceptionMiddleware>(); // Bắt lỗi toàn cục

if (!app.Environment.IsDevelopment())
{
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

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseStaticFiles(); // Cho phép đọc file tĩnh (.css, .js, .png...) trong wwwroot
app.UseRouting();

app.UseCors("AllowAll");
app.UseResponseCaching(); // Bật Response Cache (Phải để SAU UseCors để không bị lỗi mất header CORS)

app.UseSession();
app.UseAuthentication(); // Xác thực người dùng (Kiểm tra xem là ai)
app.UseAuthorization();  // Phân quyền (Kiểm tra có quyền Admin/Staff hay không)

// Map SignalR Endpoint
app.MapHub<SeatHub>("/seathub");

// ── 13. Cấu hình Route cho MVC Controller ─────────────────────────────────
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

// Route ngắn gọn thân thiện (Friendly URLs) tương thích với PHP cũ
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

app.MapMcp("/api/mcp");

app.Run();
public partial class Program { }
