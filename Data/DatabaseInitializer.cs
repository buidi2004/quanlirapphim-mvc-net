using System.Data;
using Dapper;
using Microsoft.Data.Sqlite;

namespace CinemaXNet.Data;

/// <summary>
/// Tạo schema SQLite và seed dữ liệu mẫu khi app khởi động lần đầu.
/// </summary>
public static class DatabaseInitializer
{
    public static void Initialize(string connectionString)
    {
        using var db = new SqliteConnection(connectionString);
        db.Open();

        // FK enforcement
        db.Execute("PRAGMA foreign_keys = ON;");
        db.Execute("PRAGMA journal_mode = WAL;");

        // ── Tables ─────────────────────────────────────────────────────────
        db.Execute("""
            CREATE TABLE IF NOT EXISTS users (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                username         TEXT    NOT NULL,
                email            TEXT    NOT NULL UNIQUE,
                password_hash    TEXT    NOT NULL,
                role             TEXT    NOT NULL DEFAULT 'user'
                                          CHECK (role IN ('admin','cinema_manager','staff','user')),
                full_name        TEXT,
                phone            TEXT,
                avatar_url       TEXT,
                date_of_birth    TEXT,
                gender           TEXT    NOT NULL DEFAULT 'other',
                city             TEXT,
                member_level     TEXT    NOT NULL DEFAULT 'bronze',
                total_spent      REAL    NOT NULL DEFAULT 0,
                loyalty_points   INTEGER NOT NULL DEFAULT 0,
                reset_token      TEXT,
                reset_token_expiry TEXT,
                created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS movies (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                title            TEXT    NOT NULL,
                poster_url       TEXT,
                genre            TEXT,
                status           TEXT    NOT NULL DEFAULT 'coming_soon'
                                          CHECK (status IN ('now_showing','coming_soon','ended')),
                duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
                description      TEXT,
                age_rating       TEXT,
                created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS cinemas (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT    NOT NULL,
                slug           TEXT    NOT NULL UNIQUE,
                province       TEXT    NOT NULL,
                district       TEXT    NOT NULL,
                address        TEXT    NOT NULL,
                phone          TEXT,
                email          TEXT,
                latitude       REAL,
                longitude      REAL,
                image_url      TEXT,
                opening_hours  TEXT    NOT NULL DEFAULT '08:00 - 23:30',
                description    TEXT,
                facilities     TEXT,
                is_active      INTEGER NOT NULL DEFAULT 1,
                created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                cinema_id     INTEGER REFERENCES cinemas(id) DEFAULT 1,
                name          TEXT    NOT NULL UNIQUE,
                total_rows    INTEGER NOT NULL CHECK (total_rows > 0),
                seats_per_row INTEGER NOT NULL CHECK (seats_per_row > 0),
                layout_json   TEXT
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS showtimes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id    INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                room_id     INTEGER NOT NULL REFERENCES rooms(id),
                show_date   TEXT    NOT NULL,
                start_time  TEXT    NOT NULL,
                price       REAL    NOT NULL CHECK (price >= 0),
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                UNIQUE (room_id, show_date, start_time)
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                showtime_id      INTEGER NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
                user_id          INTEGER NOT NULL REFERENCES users(id),
                seat_code        TEXT    NOT NULL,
                status           TEXT    NOT NULL DEFAULT 'holding'
                                          CHECK (status IN ('holding','paid','cancelled','used')),
                hold_expiry_time TEXT,
                total_price      REAL    NOT NULL DEFAULT 0 CHECK (total_price >= 0),
                promotion_code   TEXT,
                version          INTEGER NOT NULL DEFAULT 0,
                booked_at        TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS promotions (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                code           TEXT    NOT NULL UNIQUE,
                discount_type  TEXT    NOT NULL CHECK (discount_type IN ('percent','fixed')),
                discount_value REAL    NOT NULL CHECK (discount_value > 0),
                max_uses       INTEGER,
                used_count     INTEGER NOT NULL DEFAULT 0,
                expires_at     TEXT,
                is_active      INTEGER NOT NULL DEFAULT 1
            );
        """);



        db.Execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                email      TEXT    NOT NULL,
                subject    TEXT,
                message    TEXT    NOT NULL,
                is_read    INTEGER NOT NULL DEFAULT 0,
                created_at TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS food_beverages (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT    NOT NULL,
                description    TEXT,
                price          REAL    NOT NULL CHECK (price >= 0),
                image_url      TEXT,
                stock_quantity INTEGER NOT NULL DEFAULT 0
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id   INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment    TEXT    NOT NULL,
                created_at TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER NOT NULL REFERENCES users(id),
                action       TEXT    NOT NULL,
                entity_name  TEXT,
                entity_id    TEXT,
                details      TEXT,
                created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS membership_tiers (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                name             TEXT    NOT NULL UNIQUE,
                min_spent        REAL    NOT NULL DEFAULT 0,
                discount_percent REAL    NOT NULL DEFAULT 0,
                benefits         TEXT
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS pricing_rules (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                name             TEXT    NOT NULL,
                condition_type   TEXT    NOT NULL CHECK (condition_type IN ('DayOfWeek', 'TimeOfDay')),
                condition_value  TEXT    NOT NULL,
                adjustment_type  TEXT    NOT NULL CHECK (adjustment_type IN ('Percent', 'Fixed')),
                adjustment_value REAL    NOT NULL,
                is_active        INTEGER NOT NULL DEFAULT 1
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS marketing_campaigns (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                name            TEXT    NOT NULL,
                type            TEXT    NOT NULL CHECK (type IN ('Email', 'SMS')),
                target_audience TEXT    NOT NULL CHECK (target_audience IN ('All', 'VIP', 'Inactive')),
                content         TEXT    NOT NULL,
                status          TEXT    NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sent')),
                scheduled_at    TEXT,
                sent_count      INTEGER NOT NULL DEFAULT 0,
                created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
            );
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key   TEXT    NOT NULL UNIQUE,
                setting_value TEXT
            );
        """);

        // ── Seed if empty ───────────────────────────────────────────────────
        var userCount = db.ExecuteScalar<int>("SELECT COUNT(*) FROM users");
        if (userCount == 0) SeedData(db);
    }

    private static void SeedData(IDbConnection db)
    {
        // Admin — password: "admin123"
        db.Execute("""
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES ('admin', 'admin@cinemax.com',
                    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
                    'admin', 'Quản trị viên');
        """);

        // Test user — password: "user123"
        db.Execute("""
            INSERT INTO users (username, email, password_hash, role, full_name, city, member_level)
            VALUES ('user1', 'user@cinemax.com',
                    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
                    'user', 'Nguyễn Văn A', 'Hà Nội', 'bronze');
        """);

        // Cinema Manager - password: "manager123"
        db.Execute("""
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES ('manager1', 'manager@cinemax.com',
                    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
                    'cinema_manager', 'Quản lý rạp');
        """);

        // Staff - password: "staff123"
        db.Execute("""
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES ('staff1', 'staff@cinemax.com',
                    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
                    'staff', 'Nhân viên bán vé');
        """);

        // Seed Cinemas
        db.Execute("""
            INSERT INTO cinemas (name, slug, province, district, address, phone, email,
                                 latitude, longitude, image_url, opening_hours, description, facilities) VALUES
            ('CinemaX Nguyễn Huệ', 'cinemax-nguyen-hue', 'TP. Hồ Chí Minh', 'Quận 1',
             '66 Nguyễn Huệ, Bến Nghé, Quận 1', '028-3824-5678', 'nguyenhue@cinemax.vn',
             10.77568, 106.70193,
             'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
             '08:00 - 23:30',
             'Rạp chiếu phim hiện đại tại trung tâm Quận 1 với hệ thống âm thanh Dolby Atmos và màn hình IMAX.',
             'IMAX,Dolby Atmos,Sweetbox,VIP Lounge,Parking'),
            ('CinemaX Landmark 81', 'cinemax-landmark-81', 'TP. Hồ Chí Minh', 'Bình Thạnh',
             '720A Điện Biên Phủ, Vinhomes Tân Cảng, Bình Thạnh', '028-3970-8888', 'landmark81@cinemax.vn',
             10.79470, 106.72197,
             'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
             '09:00 - 00:00',
             'Rạp chiếu phim xa xỉ tại tầng cao Landmark 81, tòa nhà cao nhất Việt Nam.',
             'IMAX,Dolby Atmos,Sweetbox,VIP Lounge,Private Cinema,Parking'),
            ('CinemaX Times City Hà Nội', 'cinemax-times-city-hn', 'Hà Nội', 'Hai Bà Trưng',
             '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng', '024-6266-9999', 'timescity@cinemax.vn',
             20.99979, 105.86676,
             'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
             '08:00 - 23:30',
             'Cụm rạp lớn nhất Hà Nội với 12 phòng chiếu, IMAX và 4DX.',
             'IMAX,4DX,Dolby Atmos,VIP Lounge,Parking'),
            ('CinemaX Royal City', 'cinemax-royal-city', 'Hà Nội', 'Thanh Xuân',
             '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân', '024-3974-9999', 'royalcity@cinemax.vn',
             21.00075, 105.80933,
             'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop',
             '09:00 - 23:00',
             'Rạp chiếu phim cao cấp tại Royal City với hệ thống âm thanh và hình ảnh đẳng cấp.',
             'Dolby Atmos,ScreenX,Sweetbox,VIP Lounge,Parking'),
            ('CinemaX Đà Nẵng', 'cinemax-da-nang', 'Đà Nẵng', 'Hải Châu',
             '255 Hùng Vương, Vĩnh Trung, Thanh Khê', '0236-3815-555', 'danang@cinemax.vn',
             16.07188, 108.21454,
             'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop',
             '08:30 - 23:00',
             'Rạp chiếu phim hiện đại tại trung tâm Đà Nẵng với view sông Hàn tuyệt đẹp.',
             'IMAX,Dolby Atmos,VIP Lounge,Parking');
        """);

        // Rooms
        db.Execute("""
            INSERT INTO rooms (name, total_rows, seats_per_row) VALUES
                ('Phòng 1 - Standard', 6, 8),
                ('Phòng 2 - VIP',      5, 6),
                ('Phòng 3 - IMAX',     7, 10);
        """);

        // Movies
        db.Execute("""
            INSERT INTO movies (title, poster_url, genre, status, duration_minutes, description, age_rating) VALUES
            ('Dune: Part Two',
             'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
             'Khoa học viễn tưởng', 'now_showing', 166,
             'Hành trình tiếp theo của Paul Atreides trên hành tinh cát Arrakis chống lại gia tộc Harkonnen.',
             'C13'),
            ('Oppenheimer',
             'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
             'Chính kịch', 'now_showing', 180,
             'Câu chuyện về cuộc đời và những tranh cãi xung quanh cha đẻ của bom nguyên tử J. Robert Oppenheimer.',
             'C16'),
            ('The Nighthawk',
             'https://placehold.co/400x600/1a1a2e/ffc107?text=The+Nighthawk',
             'Hành động', 'coming_soon', 124,
             'Người hùng bóng đêm với bộ giáp công nghệ tối tân đứng lên chống lại liên minh tội phạm ngầm.',
             'P'),
            ('Neon Jungle',
             'https://placehold.co/400x600/0f3460/0dcaf0?text=Neon+Jungle',
             'Khoa học viễn tưởng', 'coming_soon', 118,
             'Một chuyến hành trình khám phá hệ sinh thái sinh học kỳ lạ đầy ánh sáng huyền ảo ngoài vũ trụ.',
             'P');
        """);

        // Showtimes
        var today    = DateTime.Today.ToString("yyyy-MM-dd");
        var tomorrow = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd");

        db.Execute($"""
            INSERT INTO showtimes (movie_id, room_id, show_date, start_time, price) VALUES
            (1, 1, '{today}',    '14:00:00', 90000),
            (1, 3, '{today}',    '19:30:00', 140000),
            (1, 1, '{tomorrow}', '10:00:00', 90000),
            (2, 2, '{today}',    '16:00:00', 85000),
            (2, 3, '{today}',    '21:00:00', 140000),
            (2, 2, '{tomorrow}', '13:30:00', 85000);
        """);

        // Sample promotions
        db.Execute("""
            INSERT INTO promotions (code, discount_type, discount_value, max_uses, is_active) VALUES
            ('GIAM20',  'percent', 20, 100, 1),
            ('GIAM50K', 'fixed',   50000, 50, 1);
        """);



        // Seed Food and Beverages
        db.Execute("""
            INSERT INTO food_beverages (name, description, price, stock_quantity) VALUES
            ('Combo Bắp Nước Nhỏ', '1 Bắp nhỏ + 1 Nước ngọt nhỏ', 50000, 100),
            ('Combo Bắp Nước Vừa', '1 Bắp vừa + 1 Nước ngọt vừa', 75000, 150),
            ('Combo Bắp Nước Lớn', '1 Bắp lớn + 2 Nước ngọt lớn', 120000, 50);
        """);

        // Seed Membership Tiers
        db.Execute("""
            INSERT INTO membership_tiers (name, min_spent, discount_percent, benefits) VALUES
            ('Bronze', 0, 0, 'Thành viên cơ bản, tích lũy điểm khi mua vé.'),
            ('Silver', 1000000, 5, 'Giảm 5% khi mua vé, ưu tiên hỗ trợ.'),
            ('Gold', 3000000, 10, 'Giảm 10% khi mua vé, tặng 1 vé sinh nhật.'),
            ('Diamond', 10000000, 15, 'Giảm 15% khi mua vé, phòng VIP lounge miễn phí.');
        """);

        // Seed Pricing Rules
        db.Execute("""
            INSERT INTO pricing_rules (name, condition_type, condition_value, adjustment_type, adjustment_value, is_active) VALUES
            ('Giảm giá Khung giờ vàng (Trước 12h)', 'TimeOfDay', '00:00-11:59', 'Percent', -10, 1),
            ('Phụ thu Cuối tuần (T7, CN)', 'DayOfWeek', 'Saturday,Sunday', 'Fixed', 20000, 1);
        """);
    }
}
