-- ============================================================================
-- DATABASE: HỆ THỐNG QUẢN LÝ ĐẶT VÉ XEM PHIM - CINEMAX
-- Version: 1.0
-- Date: 2026-07-27
-- Description: Script tạo database hoàn chỉnh cho hệ thống đặt vé xem phim
-- ============================================================================

-- Xóa database cũ nếu tồn tại
DROP DATABASE IF EXISTS cinemaxnet_db;

-- Tạo database mới
CREATE DATABASE cinemaxnet_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cinemaxnet_db;

-- ============================================================================
-- 1. BẢNG USERS - Người dùng
-- ============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'cinema_manager') NOT NULL DEFAULT 'customer',
    points INT NOT NULL DEFAULT 0,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_role (role),
    
    CONSTRAINT chk_user_points CHECK (points >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. BẢNG MOVIES - Phim
-- ============================================================================
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    poster_url VARCHAR(500) NULL,
    genre VARCHAR(100) NULL,
    status ENUM('now_showing', 'coming_soon', 'ended') NOT NULL DEFAULT 'now_showing',
    duration_minutes INT NOT NULL,
    description TEXT NULL,
    age_rating VARCHAR(10) NOT NULL DEFAULT 'P',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_movies_title (title),
    INDEX idx_movies_genre (genre),
    INDEX idx_movies_status (status),
    
    CONSTRAINT chk_movie_duration CHECK (duration_minutes > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. BẢNG CINEMAS - Rạp chiếu
-- ============================================================================
CREATE TABLE cinemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- 4. BẢNG ROOMS - Phòng chiếu
-- ============================================================================
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_rooms_cinema (cinema_id),
    
    CONSTRAINT chk_room_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. BẢNG SEATS - Ghế ngồi
-- ============================================================================
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    seat_row VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    seat_code VARCHAR(10) NOT NULL UNIQUE,
    seat_type ENUM('standard', 'vip', 'couple') NOT NULL DEFAULT 'standard',
    price_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    is_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_seats_room (room_id),
    INDEX idx_seats_code (seat_code),
    UNIQUE KEY unique_seat_position (room_id, seat_row, seat_number),
    
    CONSTRAINT chk_price_multiplier CHECK (price_multiplier >= 0.5 AND price_multiplier <= 3.0)
) ENGINE=InnoDB;

-- ============================================================================
-- 6. BẢNG SHOWTIMES - Suất chiếu
-- ============================================================================
CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    format ENUM('2D', '3D', 'IMAX') NOT NULL DEFAULT '2D',
    base_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_showtimes_date (show_date),
    INDEX idx_showtimes_movie (movie_id),
    INDEX idx_showtimes_room (room_id),
    
    CONSTRAINT chk_base_price CHECK (base_price > 0)
) ENGINE=InnoDB;


-- ============================================================================
-- 7. BẢNG TICKETS - Vé đặt
-- ============================================================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('hold', 'paid', 'used', 'cancelled', 'expired') NOT NULL DEFAULT 'hold',
    hold_expires_at DATETIME NULL,
    guest_email VARCHAR(100) NULL,
    guest_phone VARCHAR(20) NULL,
    payment_method VARCHAR(50) NULL,
    transaction_id VARCHAR(100) NULL,
    version INT NOT NULL DEFAULT 0 COMMENT 'Optimistic Locking',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_tickets_user (user_id),
    INDEX idx_tickets_showtime (showtime_id),
    INDEX idx_tickets_booking_code (booking_code),
    INDEX idx_tickets_status (status),
    
    UNIQUE KEY unique_showtime_seat (showtime_id, seat_id),
    
    CONSTRAINT chk_ticket_price CHECK (price > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 8. BẢNG FOOD_BEVERAGES - Đồ ăn & đồ uống
-- ============================================================================
CREATE TABLE food_beverages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    category VARCHAR(50) NULL COMMENT 'Popcorn, Drink, Combo...',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_food_category (category),
    
    CONSTRAINT chk_food_price CHECK (price > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. BẢNG TICKET_CONCESSIONS - Đồ ăn kèm vé
-- ============================================================================
CREATE TABLE ticket_concessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    food_beverage_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (food_beverage_id) REFERENCES food_beverages(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_concession_ticket (ticket_id),
    
    CONSTRAINT chk_concession_quantity CHECK (quantity > 0),
    CONSTRAINT chk_concession_price CHECK (price > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 10. BẢNG PROMOTIONS - Khuyến mãi
-- ============================================================================
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INT NULL COMMENT 'NULL = unlimited',
    used_count INT NOT NULL DEFAULT 0,
    expires_at DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_promotions_code (code),
    INDEX idx_promotions_expires (expires_at),
    
    CONSTRAINT chk_promo_value CHECK (discount_value > 0),
    CONSTRAINT chk_promo_used CHECK (used_count >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- 11. BẢNG REVIEWS - Đánh giá phim
-- ============================================================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL COMMENT '1-5 stars',
    comment TEXT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_reviews_movie (movie_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_status (status),
    
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- ============================================================================
-- 12. BẢNG REFUNDS - Hoàn tiền
-- ============================================================================
CREATE TABLE refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    cancellation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    processed_by INT NULL COMMENT 'Admin user ID',
    processed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_refunds_status (status),
    INDEX idx_refunds_user (user_id),
    
    CONSTRAINT chk_refund_amount CHECK (refund_amount >= 0),
    CONSTRAINT chk_cancel_fee CHECK (cancellation_fee >= 0)
) ENGINE=InnoDB;


-- ============================================================================
-- 13. BẢNG AUDIT_LOGS - Nhật ký hệ thống
-- ============================================================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL COMMENT 'Create, Update, Delete, Login...',
    entity VARCHAR(100) NOT NULL COMMENT 'Movie, Ticket, User...',
    entity_id VARCHAR(50) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at),
    INDEX idx_audit_entity (entity, entity_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 14. BẢNG PRICING_RULES - Quy tắc giá động
-- ============================================================================
CREATE TABLE pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL COMMENT 'weekend, prime_time, holiday...',
    adjustment_type ENUM('percent', 'fixed') NOT NULL,
    adjustment_value DECIMAL(10,2) NOT NULL,
    priority INT NOT NULL DEFAULT 0 COMMENT 'Higher priority applies first',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_pricing_type (rule_type),
    INDEX idx_pricing_active (is_active)
) ENGINE=InnoDB;

-- ============================================================================
-- 15. BẢNG MEMBERSHIPS - Cấp độ thành viên
-- ============================================================================
CREATE TABLE memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Bronze, Silver, Gold, Platinum',
    min_points INT NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    benefits TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_min_points (min_points),
    
    CONSTRAINT chk_membership_points CHECK (min_points >= 0),
    CONSTRAINT chk_membership_discount CHECK (discount_percent >= 0 AND discount_percent <= 100)
) ENGINE=InnoDB;

-- ============================================================================
-- 16. BẢNG BANNERS - Banner quảng cáo
-- ============================================================================
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500) NULL,
    display_order INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_banners_active (is_active),
    INDEX idx_banners_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ============================================================================
-- 17. BẢNG NEWS - Tin tức
-- ============================================================================
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NULL COMMENT 'Review, News, Event...',
    image_url VARCHAR(500) NULL,
    summary TEXT NULL,
    content LONGTEXT NOT NULL,
    author_id INT NOT NULL,
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_news_slug (slug),
    INDEX idx_news_category (category),
    INDEX idx_news_published (published_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 18. BẢNG CONTACTS - Liên hệ
-- ============================================================================
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'processing', 'resolved') NOT NULL DEFAULT 'new',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_contacts_status (status),
    INDEX idx_contacts_date (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 19. BẢNG NOTIFICATIONS - Thông báo
-- ============================================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'booking, promotion, system...',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB;

-- ============================================================================
-- 20. BẢNG SETTINGS - Cấu hình hệ thống
-- ============================================================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB;


-- ============================================================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ============================================================================

-- Insert Users
INSERT INTO users (username, email, password_hash, role, points) VALUES
('admin', 'admin@cinemax.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyVUvFGNJEKy', 'admin', 0),
('manager', 'manager@cinemax.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyVUvFGNJEKy', 'cinema_manager', 0),
('john_doe', 'john@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyVUvFGNJEKy', 'customer', 1500),
('jane_smith', 'jane@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyVUvFGNJEKy', 'customer', 3000);

-- Insert Cinemas
INSERT INTO cinemas (name, address, phone) VALUES
('CinemaX Hà Nội', '123 Đường Láng, Đống Đa, Hà Nội', '0241234567'),
('CinemaX Sài Gòn', '456 Nguyễn Huệ, Quận 1, TP.HCM', '0281234567'),
('CinemaX Đà Nẵng', '789 Trần Phú, Hải Châu, Đà Nẵng', '0236123456');

-- Insert Rooms
INSERT INTO rooms (cinema_id, name, capacity) VALUES
(1, 'Phòng 1', 100),
(1, 'Phòng 2', 100),
(1, 'Phòng VIP', 50),
(2, 'Phòng 1', 120),
(2, 'Phòng IMAX', 200);

-- Insert Seats for Room 1 (Simple example - 10 rows x 10 seats)
INSERT INTO seats (room_id, seat_row, seat_number, seat_code, seat_type, price_multiplier) VALUES
-- Row A
(1, 'A', 1, 'A1', 'standard', 1.00),
(1, 'A', 2, 'A2', 'standard', 1.00),
(1, 'A', 3, 'A3', 'standard', 1.00),
(1, 'A', 4, 'A4', 'standard', 1.00),
(1, 'A', 5, 'A5', 'standard', 1.00),
-- Row B (VIP)
(1, 'B', 1, 'B1', 'vip', 1.30),
(1, 'B', 2, 'B2', 'vip', 1.30),
(1, 'B', 3, 'B3', 'vip', 1.30),
-- Row C (Couple)
(1, 'C', 1, 'C1', 'couple', 1.50),
(1, 'C', 2, 'C2', 'couple', 1.50);

-- Insert Movies
INSERT INTO movies (title, poster_url, genre, status, duration_minutes, description, age_rating) VALUES
('Avengers: Endgame', '/uploads/posters/avengers.jpg', 'Action, Sci-Fi', 'now_showing', 181, 
 'Sau sự kiện tàn khốc trong Infinity War, các siêu anh hùng còn sống sót tập hợp lại để đảo ngược tình thế.', 'C13'),
 
('The Shawshank Redemption', '/uploads/posters/shawshank.jpg', 'Drama', 'now_showing', 142, 
 'Câu chuyện về tình bạn và hy vọng trong nhà tù Shawshank.', 'C16'),
 
('Inception', '/uploads/posters/inception.jpg', 'Sci-Fi, Thriller', 'now_showing', 148, 
 'Một tên trộm đột nhập vào giấc mơ của người khác để đánh cắp bí mật.', 'C13'),
 
('Spider-Man: No Way Home', '/uploads/posters/spiderman.jpg', 'Action, Adventure', 'coming_soon', 148, 
 'Peter Parker phải đối mặt với hậu quả khi danh tính Spider-Man bị lộ.', 'C13'),
 
('Titanic', '/uploads/posters/titanic.jpg', 'Romance, Drama', 'ended', 194, 
 'Câu chuyện tình yêu bi thảm trên con tàu Titanic.', 'C13');

-- Insert Showtimes
INSERT INTO showtimes (movie_id, room_id, show_date, start_time, format, base_price) VALUES
-- Avengers - Today
(1, 1, CURDATE(), '10:00:00', '2D', 80000.00),
(1, 1, CURDATE(), '14:00:00', '2D', 90000.00),
(1, 1, CURDATE(), '18:00:00', '3D', 120000.00),
(1, 2, CURDATE(), '20:00:00', '3D', 120000.00),

-- Shawshank - Tomorrow
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00', '2D', 75000.00),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '2D', 85000.00),

-- Inception - Tomorrow
(3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00', '2D', 80000.00),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00', 'IMAX', 150000.00);

-- Insert Food & Beverages
INSERT INTO food_beverages (name, description, price, category, is_available) VALUES
('Bắp rang bơ (L)', 'Bắp rang bơ size lớn', 50000.00, 'Popcorn', TRUE),
('Bắp rang bơ (M)', 'Bắp rang bơ size vừa', 40000.00, 'Popcorn', TRUE),
('Coca Cola (L)', 'Coca Cola size lớn', 35000.00, 'Drink', TRUE),
('Coca Cola (M)', 'Coca Cola size vừa', 30000.00, 'Drink', TRUE),
('Combo 1', 'Bắp (L) + Nước (L)', 70000.00, 'Combo', TRUE),
('Combo 2', 'Bắp (M) + Nước (M)', 60000.00, 'Combo', TRUE),
('Hotdog', 'Hotdog xúc xích', 35000.00, 'Food', TRUE);

-- Insert Promotions
INSERT INTO promotions (code, discount_type, discount_value, max_uses, used_count, expires_at) VALUES
('SUMMER2026', 'percent', 20.00, 1000, 50, DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('VALENTINE', 'percent', 15.00, 500, 10, DATE_ADD(CURDATE(), INTERVAL 15 DAY)),
('TUESDAY50K', 'fixed', 50000.00, NULL, 200, DATE_ADD(CURDATE(), INTERVAL 90 DAY)),
('STUDENT10', 'percent', 10.00, NULL, 0, DATE_ADD(CURDATE(), INTERVAL 60 DAY));

-- Insert Memberships
INSERT INTO memberships (name, min_points, discount_percent, benefits) VALUES
('Bronze', 0, 0, 'Không có ưu đãi đặc biệt'),
('Silver', 1000, 5, 'Giảm 5% mọi vé, Tích điểm x1.2'),
('Gold', 5000, 10, 'Giảm 10% mọi vé, Tích điểm x1.5, Ưu tiên đặt vé sớm'),
('Platinum', 10000, 15, 'Giảm 15% mọi vé, Tích điểm x2, Phòng chờ VIP, Vé sinh nhật miễn phí');

-- Insert Pricing Rules
INSERT INTO pricing_rules (name, rule_type, adjustment_type, adjustment_value, priority, is_active) VALUES
('Weekend Surcharge', 'weekend', 'percent', 20.00, 10, TRUE),
('Prime Time (18h-22h)', 'prime_time', 'percent', 15.00, 20, TRUE),
('Holiday Pricing', 'holiday', 'percent', 30.00, 30, TRUE),
('Early Bird (Before 12h)', 'early_bird', 'percent', -10.00, 5, TRUE);

-- Insert Settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('seat_hold_duration', '600', 'Thời gian giữ ghế (giây) - 10 phút'),
('max_tickets_per_booking', '10', 'Số vé tối đa mỗi lần đặt'),
('cancellation_fee_percent', '10', 'Phí hủy vé (%)'),
('points_per_1000', '1', 'Điểm tích lũy cho mỗi 1000 VNĐ'),
('smtp_host', 'smtp.gmail.com', 'SMTP server'),
('smtp_port', '587', 'SMTP port'),
('company_name', 'CinemaX', 'Tên công ty'),
('support_email', 'support@cinemax.com', 'Email hỗ trợ');

-- Insert Sample Banners
INSERT INTO banners (title, image_url, link_url, display_order, start_date, end_date, is_active) VALUES
('Spider-Man: No Way Home', 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1200', '/movies/4', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('Khuyến mãi mùa hè', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200', '/promotions', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE);


-- Insert Sample Tickets (Đã thanh toán)
INSERT INTO tickets (user_id, showtime_id, seat_id, booking_code, price, status, payment_method, transaction_id, created_at) VALUES
(3, 1, 1, 'BK20260727001', 80000.00, 'paid', 'vnpay', 'VNP20260727001', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, 2, 'BK20260727002', 80000.00, 'paid', 'vnpay', 'VNP20260727002', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 2, 3, 'BK20260727003', 90000.00, 'paid', 'momo', 'MOMO20260727001', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert Sample Reviews
INSERT INTO reviews (user_id, movie_id, rating, comment, status) VALUES
(3, 1, 5, 'Phim rất hay! Kết thúc hoàn hảo cho saga Infinity.', 'approved'),
(4, 1, 4, 'Phim dài nhưng không hề nhàm chán.', 'approved'),
(3, 2, 5, 'Một kiệt tác điện ảnh bất hủ!', 'approved');

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES
(1, 'Login', 'User', '1', 'Admin đăng nhập hệ thống', '192.168.1.100'),
(1, 'Create', 'Movie', '1', 'Thêm phim mới: Avengers: Endgame', '192.168.1.100'),
(2, 'Update', 'Showtime', '1', 'Cập nhật giá vé suất chiếu', '192.168.1.101'),
(3, 'Create', 'Ticket', '1', 'Đặt vé xem phim', '192.168.1.102');

-- Insert Sample News
INSERT INTO news (title, slug, category, image_url, summary, content, author_id, published_at) VALUES
('Review Avengers: Endgame - Kết Thúc Hoàn Hảo', 'review-avengers-endgame', 'Review', 
 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', 
 'Avengers: Endgame là một tác phẩm điện ảnh đỉnh cao, kết thúc hoàn hảo cho hành trình 10 năm của MCU.',
 '<p>Sau 10 năm xây dựng, Marvel đã mang đến một cái kết đầy cảm xúc...</p>', 
 1, NOW()),

('Top 5 Phim Bom Tấn Hè 2026', 'top-5-phim-bom-tan-he-2026', 'News',
 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800',
 'Điểm danh những bộ phim bom tấn đáng xem nhất mùa hè 2026.',
 '<p>Mùa hè năm nay có rất nhiều bom tấn Hollywood đổ bộ rạp chiếu...</p>',
 1, NOW());

-- Insert Sample Contacts
INSERT INTO contacts (name, email, phone, subject, message, status) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', '0912345678', 'Hỏi về giá vé', 
 'Cho em hỏi giá vé vào ngày lễ là bao nhiêu ạ?', 'new'),
('Trần Thị B', 'tranthib@email.com', '0987654321', 'Phản hồi dịch vụ',
 'Dịch vụ rất tốt, nhân viên nhiệt tình!', 'resolved');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Tự động hủy vé hết hạn giữ
DELIMITER $$
CREATE EVENT IF NOT EXISTS evt_expire_holds
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    UPDATE tickets 
    SET status = 'expired' 
    WHERE status = 'hold' 
    AND hold_expires_at < NOW();
END$$
DELIMITER ;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Lấy thống kê dashboard
DELIMITER $$
CREATE PROCEDURE sp_get_dashboard_stats(IN days INT)
BEGIN
    -- Tổng doanh thu
    SELECT COALESCE(SUM(price), 0) as total_revenue
    FROM tickets 
    WHERE status = 'paid' 
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL days DAY);
    
    -- Số vé đã bán
    SELECT COUNT(*) as total_tickets
    FROM tickets 
    WHERE status = 'paid' 
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL days DAY);
    
    -- Top phim bán chạy
    SELECT m.title, COUNT(t.id) as ticket_count, SUM(t.price) as revenue
    FROM movies m
    JOIN showtimes s ON m.id = s.movie_id
    JOIN tickets t ON s.id = t.showtime_id
    WHERE t.status = 'paid'
    AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL days DAY)
    GROUP BY m.id
    ORDER BY ticket_count DESC
    LIMIT 5;
END$$
DELIMITER ;

-- Procedure: Tính giá vé với dynamic pricing
DELIMITER $$
CREATE PROCEDURE sp_calculate_ticket_price(
    IN p_showtime_id INT,
    IN p_seat_id INT,
    OUT p_final_price DECIMAL(10,2)
)
BEGIN
    DECLARE v_base_price DECIMAL(10,2);
    DECLARE v_seat_multiplier DECIMAL(3,2);
    DECLARE v_show_date DATE;
    DECLARE v_start_time TIME;
    
    -- Lấy giá cơ bản
    SELECT base_price, show_date, start_time
    INTO v_base_price, v_show_date, v_start_time
    FROM showtimes
    WHERE id = p_showtime_id;
    
    -- Lấy hệ số ghế
    SELECT price_multiplier
    INTO v_seat_multiplier
    FROM seats
    WHERE id = p_seat_id;
    
    -- Tính giá ban đầu
    SET p_final_price = v_base_price * v_seat_multiplier;
    
    -- Áp dụng pricing rules (simplified - thực tế cần phức tạp hơn)
    -- Weekend surcharge (+20%)
    IF DAYOFWEEK(v_show_date) IN (1, 7) THEN
        SET p_final_price = p_final_price * 1.20;
    END IF;
    
    -- Prime time (+15%)
    IF v_start_time >= '18:00:00' AND v_start_time <= '22:00:00' THEN
        SET p_final_price = p_final_price * 1.15;
    END IF;
    
    -- Early bird (-10%)
    IF v_start_time < '12:00:00' THEN
        SET p_final_price = p_final_price * 0.90;
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Thống kê phim
CREATE OR REPLACE VIEW vw_movie_statistics AS
SELECT 
    m.id,
    m.title,
    m.genre,
    m.status,
    COUNT(DISTINCT s.id) as showtime_count,
    COUNT(DISTINCT t.id) as ticket_sold,
    COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.price ELSE 0 END), 0) as total_revenue,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as review_count
FROM movies m
LEFT JOIN showtimes s ON m.id = s.movie_id
LEFT JOIN tickets t ON s.id = t.showtime_id
LEFT JOIN reviews r ON m.id = r.movie_id AND r.status = 'approved'
GROUP BY m.id;

-- View: Lịch sử đặt vé của user
CREATE OR REPLACE VIEW vw_user_ticket_history AS
SELECT 
    t.id as ticket_id,
    t.booking_code,
    t.status,
    t.price,
    t.created_at,
    u.id as user_id,
    u.username,
    u.email,
    m.title as movie_title,
    m.poster_url,
    c.name as cinema_name,
    r.name as room_name,
    s.seat_code,
    st.show_date,
    st.start_time,
    st.format
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id
JOIN showtimes st ON t.showtime_id = st.id
JOIN movies m ON st.movie_id = m.id
JOIN rooms r ON st.room_id = r.id
JOIN cinemas c ON r.cinema_id = c.id
JOIN seats s ON t.seat_id = s.id;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX idx_showtimes_movie_date ON showtimes(movie_id, show_date);
CREATE INDEX idx_reviews_movie_status ON reviews(movie_id, status);

-- ============================================================================
-- GRANT PERMISSIONS (Example)
-- ============================================================================

-- Create application user (adjust as needed)
-- CREATE USER 'cinemax_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cinemaxnet_db.* TO 'cinemax_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Database schema created successfully!' as Status;
SELECT COUNT(*) as TableCount FROM information_schema.tables WHERE table_schema = 'cinemaxnet_db';

