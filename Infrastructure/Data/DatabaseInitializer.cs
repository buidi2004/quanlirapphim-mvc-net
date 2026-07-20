using System.Data;
using Dapper;
using MySqlConnector;

namespace CinemaXNet.Infrastructure.Data;

/// <summary>
/// Tạo schema MySQL và seed dữ liệu mẫu khi app khởi động lần đầu.
/// </summary>
public static class DatabaseInitializer
{
    public static void Initialize(string connectionString)
    {
        using var db = new MySqlConnection(connectionString);
        db.Open();

        // ── Tables ─────────────────────────────────────────────────────────
        db.Execute("""
            CREATE TABLE IF NOT EXISTS users (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                username         VARCHAR(100)  NOT NULL,
                email            VARCHAR(255)  NOT NULL UNIQUE,
                password_hash    VARCHAR(255)  NOT NULL,
                role             VARCHAR(20)   NOT NULL DEFAULT 'user',
                full_name        VARCHAR(200),
                phone            VARCHAR(20),
                avatar_url       VARCHAR(500),
                date_of_birth    VARCHAR(20),
                gender           VARCHAR(10)   NOT NULL DEFAULT 'other',
                city             VARCHAR(100),
                member_level     VARCHAR(20)   NOT NULL DEFAULT 'bronze',
                total_spent      DECIMAL(18,2) NOT NULL DEFAULT 0,
                loyalty_points   INT           NOT NULL DEFAULT 0,
                reset_token      VARCHAR(255),
                reset_token_expiry VARCHAR(50),
                refresh_token    VARCHAR(500),
                refresh_token_expiry VARCHAR(50),
                created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS movies (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                title            VARCHAR(300)  NOT NULL,
                poster_url       VARCHAR(500),
                genre            VARCHAR(100),
                status           VARCHAR(20)   NOT NULL DEFAULT 'coming_soon',
                duration_minutes INT           NOT NULL,
                description      TEXT,
                age_rating       VARCHAR(10),
                director         VARCHAR(200),
                `cast`           TEXT,
                created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS cinemas (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                name           VARCHAR(200)  NOT NULL,
                slug           VARCHAR(200)  NOT NULL UNIQUE,
                province       VARCHAR(100)  NOT NULL,
                district       VARCHAR(100)  NOT NULL,
                address        VARCHAR(500)  NOT NULL,
                phone          VARCHAR(20),
                email          VARCHAR(255),
                latitude       DOUBLE,
                longitude      DOUBLE,
                image_url      VARCHAR(500),
                opening_hours  VARCHAR(50)   NOT NULL DEFAULT '08:00 - 23:30',
                description    TEXT,
                facilities     TEXT,
                is_active      TINYINT(1)    NOT NULL DEFAULT 1,
                created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                cinema_id     INT DEFAULT 1,
                name          VARCHAR(100)  NOT NULL UNIQUE,
                total_rows    INT           NOT NULL,
                seats_per_row INT           NOT NULL,
                layout_json   TEXT,
                FOREIGN KEY (cinema_id) REFERENCES cinemas(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS showtimes (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                movie_id    INT           NOT NULL,
                room_id     INT           NOT NULL,
                show_date   VARCHAR(20)   NOT NULL,
                start_time  VARCHAR(20)   NOT NULL,
                format      VARCHAR(50)   DEFAULT '2D Phụ đề',
                price       DECIMAL(18,2) NOT NULL,
                created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_room_date_time (room_id, show_date, start_time),
                FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                showtime_id      INT           NOT NULL,
                user_id          INT,
                guest_email      VARCHAR(255),
                guest_phone      VARCHAR(20),
                seat_code        VARCHAR(10)   NOT NULL,
                status           VARCHAR(20)   NOT NULL DEFAULT 'holding',
                concession_status VARCHAR(20)  DEFAULT 'pending',
                hold_expiry_time DATETIME,
                total_price      DECIMAL(18,2) NOT NULL DEFAULT 0,
                promotion_code   VARCHAR(50),
                version          INT           NOT NULL DEFAULT 0,
                booked_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        // Ensure user_id is nullable for guest bookings (fix for existing databases)
        try { db.Execute("ALTER TABLE tickets MODIFY COLUMN user_id INT NULL"); } catch { }
        try { db.Execute("ALTER TABLE tickets ADD COLUMN guest_email VARCHAR(255) AFTER user_id"); } catch { }
        try { db.Execute("ALTER TABLE tickets ADD COLUMN guest_phone VARCHAR(20) AFTER guest_email"); } catch { }

        db.Execute("""
            CREATE TABLE IF NOT EXISTS promotions (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                code           VARCHAR(50)   NOT NULL UNIQUE,
                discount_type  VARCHAR(20)   NOT NULL,
                discount_value DECIMAL(18,2) NOT NULL,
                max_uses       INT,
                used_count     INT           NOT NULL DEFAULT 0,
                expires_at     VARCHAR(50),
                is_active      TINYINT(1)    NOT NULL DEFAULT 1
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                name          VARCHAR(200)  NOT NULL,
                email         VARCHAR(255)  NOT NULL,
                phone         VARCHAR(20),
                subject       VARCHAR(300),
                message       TEXT          NOT NULL,
                is_read       TINYINT(1)    NOT NULL DEFAULT 0,
                status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
                reply_message TEXT,
                replied_at    VARCHAR(50),
                created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS food_beverages (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                name           VARCHAR(200)  NOT NULL,
                description    TEXT,
                price          DECIMAL(18,2) NOT NULL,
                image_url      VARCHAR(500),
                stock_quantity INT           NOT NULL DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS ticket_concessions (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id        INT           NOT NULL,
                food_beverage_id INT           NOT NULL,
                quantity         INT           NOT NULL CHECK (quantity > 0),
                price            DECIMAL(18,2) NOT NULL CHECK (price >= 0),
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (food_beverage_id) REFERENCES food_beverages(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                movie_id    INT           NOT NULL,
                user_id     INT           NOT NULL,
                rating      INT           NOT NULL,
                comment     TEXT          NOT NULL,
                is_approved TINYINT(1)    NOT NULL DEFAULT 1,
                created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                user_id      INT           NOT NULL,
                action       VARCHAR(100)  NOT NULL,
                entity_name  VARCHAR(100),
                entity_id    VARCHAR(50),
                details      TEXT,
                created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS membership_tiers (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                name             VARCHAR(50)   NOT NULL UNIQUE,
                min_spent        DECIMAL(18,2) NOT NULL DEFAULT 0,
                discount_percent DECIMAL(5,2)  NOT NULL DEFAULT 0,
                benefits         TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS pricing_rules (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                name             VARCHAR(200)  NOT NULL,
                condition_type   VARCHAR(20)   NOT NULL,
                condition_value  VARCHAR(100)  NOT NULL,
                adjustment_type  VARCHAR(20)   NOT NULL,
                adjustment_value DECIMAL(18,2) NOT NULL,
                is_active        TINYINT(1)    NOT NULL DEFAULT 1
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS marketing_campaigns (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                name            VARCHAR(200)  NOT NULL,
                type            VARCHAR(10)   NOT NULL,
                target_audience VARCHAR(20)   NOT NULL,
                content         TEXT          NOT NULL,
                status          VARCHAR(20)   NOT NULL DEFAULT 'Draft',
                scheduled_at    VARCHAR(50),
                sent_count      INT           NOT NULL DEFAULT 0,
                created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                setting_key   VARCHAR(100)  NOT NULL UNIQUE,
                setting_value TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS news (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                title        VARCHAR(300)  NOT NULL,
                slug         VARCHAR(300)  NOT NULL UNIQUE,
                excerpt      TEXT,
                content      TEXT,
                image_url    VARCHAR(500),
                created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        db.Execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                title        VARCHAR(300)  NOT NULL,
                message      TEXT          NOT NULL,
                type         VARCHAR(50)   NOT NULL,
                is_read      TINYINT(1)    NOT NULL DEFAULT 0,
                user_id      INT           NOT NULL,
                created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """);

        // ── Seed if empty ───────────────────────────────────────────────────
        var userCount = db.ExecuteScalar<int>("SELECT COUNT(*) FROM users");
        if (userCount == 0) SeedData(db);
    }

    private static void SeedData(IDbConnection db)
    {
        // Admin — password: "123456"
        db.Execute("""
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES ('admin', 'admin@cinemax.com',
                    '$2a$11$WV0rA/w3NI7a/1/vhi/8XeOAMJDPi6qS/oNRKrrFPfAppH82ZhUJe',
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
             'https://placehold.co/400x600/1a1a2e/6f42c1?text=The+Nighthawk',
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
            INSERT INTO showtimes (movie_id, room_id, show_date, start_time, format, price) VALUES
            (1, 1, '{today}',    '14:00:00', '2D Phụ đề', 90000),
            (1, 3, '{today}',    '19:30:00', 'IMAX 3D', 140000),
            (1, 1, '{tomorrow}', '10:00:00', '2D Phụ đề', 90000),
            (2, 2, '{today}',    '16:00:00', '2D Phụ đề', 85000),
            (2, 3, '{today}',    '21:00:00', 'IMAX 2D', 140000),
            (2, 2, '{tomorrow}', '13:30:00', '2D Phụ đề', 85000);
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

        // Seed News
        db.Execute("""
            INSERT INTO news (title, slug, excerpt, content, image_url) VALUES
            ('Khuyến mãi cực nóng: Đồng giá vé 45k', 'khuyen-mai-cuc-nong-dong-gia-ve-45k', 'Đồng giá vé 45k cho tất cả các suất chiếu sau 22h', 'Đồng giá vé 45k cho tất cả các suất chiếu sau 22h tại tất cả các cụm rạp CinemaX.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'),
            ('Review Dune 2: Đỉnh cao thị giác', 'review-dune-2-dinh-cao-thi-giac', 'Một trong những tác phẩm sci-fi hoành tráng nhất thập kỷ', 'Một trong những tác phẩm sci-fi hoành tráng nhất thập kỷ, mang lại trải nghiệm điện ảnh không thể nào quên.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'),
            ('Top 5 phim rạp đáng xem tháng này', 'top-5-phim-rap-dang-xem-thang-nay', 'Danh sách những bộ phim không thể bỏ lỡ trong tháng', 'Danh sách những bộ phim không thể bỏ lỡ trong tháng, từ hành động đến tình cảm, đáp ứng mọi sở thích của bạn.', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800');
        """);

        // Seed Notifications for user_id = 2 (user1)
        db.Execute("""
            INSERT INTO notifications (title, message, type, is_read, user_id, created_at) VALUES
            ('Giao dịch thành công', 'Bạn đã mua thành công 2 vé phim Dune: Part Two.', 'ticket', 0, 2, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
            ('Khuyến mãi mới', 'Giảm 50% bắp nước cho khách hàng thành viên thứ 3 hàng tuần.', 'promo', 1, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
            ('Lịch chiếu thay đổi', 'Suất chiếu Avengers: Endgame đã được dời sang phòng chiếu IMAX.', 'system', 1, 2, DATE_SUB(NOW(), INTERVAL 1 DAY));
        """);
    }
}
