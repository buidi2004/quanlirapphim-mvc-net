import random
import datetime

# 34 Provinces
PROVINCES = [
    "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Đồng Nai", "Hải Phòng", 
    "Quảng Ninh", "Bà Rịa-Vũng Tàu", "Bình Định", "Bình Dương", "Đắk Lắk", 
    "Trà Vinh", "Yên Bái", "Vĩnh Long", "Kiên Giang", "Hà Tĩnh", "Phú Yên", 
    "Đồng Tháp", "Bạc Liêu", "Hưng Yên", "Khánh Hòa", "Kon Tum", "Lạng Sơn", 
    "Nghệ An", "Phú Thọ", "Quảng Ngãi", "Sóc Trăng", "Sơn La", "Tây Ninh", 
    "Thái Nguyên", "Tiền Giang", "Gia Lai", "Ninh Thuận", "Bình Thuận"
]

# 30 Movies
MOVIES = [
    ("Mai", "Tình cảm", "now_showing", 131, "C18", "https://upload.wikimedia.org/wikipedia/vi/3/30/Mai_-_%C3%81p_ph%C3%ADch_phim.jpg"),
    ("Lật Mặt 7: Một Điều Ước", "Gia đình", "now_showing", 138, "P", "https://upload.wikimedia.org/wikipedia/vi/e/e5/L%E1%BA%ADt_m%E1%BA%B7t_7_-_M%E1%BB%99t_%C4%91i%E1%BB%81u_%C6%B0%E1%BB%9Bc.jpg"),
    ("Đào, Phở và Piano", "Lịch sử", "now_showing", 100, "C13", "https://upload.wikimedia.org/wikipedia/vi/3/3d/%C4%90%C3%A0o%2C_ph%E1%BB%9F_v%C3%A0_piano_poster.jpg"),
    ("Godzilla x Kong: The New Empire", "Hành động", "now_showing", 115, "C13", "https://upload.wikimedia.org/wikipedia/en/b/b8/Godzilla_x_Kong_The_New_Empire_poster.jpg"),
    ("Kung Fu Panda 4", "Hoạt hình", "now_showing", 94, "P", "https://upload.wikimedia.org/wikipedia/en/7/7f/Kung_Fu_Panda_4_poster.jpg"),
    ("Dune: Part Two", "Khoa học viễn tưởng", "now_showing", 166, "C13", "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg"),
    ("Exhuma (Quật Mộ Trùng Ma)", "Kinh dị", "now_showing", 134, "C16", "https://upload.wikimedia.org/wikipedia/en/1/1a/Exhuma_film_poster.jpg"),
    ("Avatar: The Way of Water", "Khoa học viễn tưởng", "now_showing", 192, "C13", "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg"),
    ("Spider-Man: Across the Spider-Verse", "Hoạt hình", "now_showing", 140, "P", "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpeg"),
    ("Oppenheimer", "Chính kịch", "now_showing", 180, "C16", "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg"),
    ("Fast & Furious 10", "Hành động", "now_showing", 141, "C16", "https://upload.wikimedia.org/wikipedia/en/4/43/Fast_X_poster.jpg"),
    ("Mission: Impossible 7", "Hành động", "now_showing", 163, "C16", "https://upload.wikimedia.org/wikipedia/en/e/ed/Mission-_Impossible_%E2%80%93_Dead_Reckoning_Part_One_poster.jpg"),
    ("Inside Out 2", "Hoạt hình", "coming_soon", 100, "P", "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg"),
    ("Deadpool & Wolverine", "Hành động", "coming_soon", 120, "C18", "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg"),
    ("Despicable Me 4", "Hoạt hình", "coming_soon", 95, "P", "https://upload.wikimedia.org/wikipedia/en/0/0c/Despicable_Me_4_Theatrical_Release_Poster.jpeg"),
    ("Mufasa: The Lion King", "Hoạt hình", "coming_soon", 110, "P", "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Mufasa-_The_Lion_King_poster.jpg/220px-Mufasa-_The_Lion_King_poster.jpg"),
    ("A Quiet Place: Day One", "Kinh dị", "coming_soon", 100, "C16", "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/A_Quiet_Place_Day_One.jpg/220px-A_Quiet_Place_Day_One.jpg"),
    ("Joker: Folie à Deux", "Tâm lý", "coming_soon", 130, "C18", "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Joker_Folie_%C3%A0_Deux_poster.jpg/220px-Joker_Folie_%C3%A0_Deux_poster.jpg"),
    ("Venom: The Last Dance", "Hành động", "coming_soon", 115, "C16", "https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Venom_The_Last_Dance_poster.jpg/220px-Venom_The_Last_Dance_poster.jpg"),
    ("Kraven the Hunter", "Hành động", "coming_soon", 110, "C16", "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Kraven_the_Hunter_poster.jpg/220px-Kraven_the_Hunter_poster.jpg"),
    ("Challengers", "Tình cảm", "now_showing", 131, "C18", "https://upload.wikimedia.org/wikipedia/en/thumb/6/65/Challengers_2024_poster.jpg/220px-Challengers_2024_poster.jpg"),
    ("The Fall Guy", "Hành động", "now_showing", 126, "C13", "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/The_Fall_Guy_2024_poster.jpg/220px-The_Fall_Guy_2024_poster.jpg"),
    ("Kingdom of the Planet of the Apes", "Khoa học viễn tưởng", "now_showing", 145, "C13", "https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Kingdom_of_the_Planet_of_the_Apes_poster.jpg/220px-Kingdom_of_the_Planet_of_the_Apes_poster.jpg"),
    ("Furiosa: A Mad Max Saga", "Hành động", "now_showing", 148, "C18", "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Furiosa_A_Mad_Max_Saga_poster.jpg/220px-Furiosa_A_Mad_Max_Saga_poster.jpg"),
    ("Bad Boys: Ride or Die", "Hành động", "now_showing", 115, "C16", "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Bad_Boys_Ride_or_Die_poster.jpg/220px-Bad_Boys_Ride_or_Die_poster.jpg"),
    ("A Haunting in Venice", "Kinh dị", "now_showing", 103, "C16", "https://upload.wikimedia.org/wikipedia/en/thumb/7/79/A_Haunting_in_Venice_poster.jpg/220px-A_Haunting_in_Venice_poster.jpg"),
    ("The Creator", "Khoa học viễn tưởng", "now_showing", 133, "C13", "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/The_Creator_%28film%29_poster.jpg/220px-The_Creator_%28film%29_poster.jpg"),
    ("Killers of the Flower Moon", "Chính kịch", "now_showing", 206, "C18", "https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Killers_of_the_Flower_Moon_film_poster.jpg/220px-Killers_of_the_Flower_Moon_film_poster.jpg"),
    ("The Marvels", "Hành động", "now_showing", 105, "C13", "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/The_Marvels_poster.jpg/220px-The_Marvels_poster.jpg"),
    ("Wonka", "Phiêu lưu", "now_showing", 116, "P", "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Wonka_film_poster.jpg/220px-Wonka_film_poster.jpg")
]

# Write to SQL file
sql = "SET FOREIGN_KEY_CHECKS = 0;\n"
sql += "TRUNCATE TABLE tickets;\n"
sql += "TRUNCATE TABLE seat_locks;\n"
sql += "TRUNCATE TABLE seat_holds;\n"
sql += "TRUNCATE TABLE showtimes;\n"
sql += "TRUNCATE TABLE rooms;\n"
sql += "TRUNCATE TABLE cinemas;\n"
sql += "TRUNCATE TABLE movies;\n"
sql += "SET FOREIGN_KEY_CHECKS = 1;\n\n"

# 1. Insert Movies
for i, m in enumerate(MOVIES):
    title, genre, status, duration, rating, poster = m
    sql += f"INSERT INTO movies (id, title, poster_url, genre, status, duration_minutes, description, age_rating) VALUES "
    sql += f"({i+1}, '{title}', '{poster}', '{genre}', '{status}', {duration}, 'Một siêu phẩm điện ảnh không thể bỏ lỡ.', '{rating}');\n"

# 2. Insert Cinemas & Rooms
sql += "\n"
cinema_id = 1
room_id = 1
for i, prov in enumerate(PROVINCES):
    # Determine number of cinemas in this province (1-3)
    num_cinemas = random.randint(1, 3)
    # Give some random names
    for c in range(num_cinemas):
        cinema_name = f"CGV {prov} {c+1}"
        slug = f"cgv-{prov.lower().replace(' ', '-')}-{c+1}"
        sql += f"INSERT INTO cinemas (id, name, slug, province, district, address, phone, email, lat, lng, image_url, open_hours, description, facilities) VALUES "
        sql += f"({cinema_id}, '{cinema_name}', '{slug}', '{prov}', 'Trung tâm', 'Số {random.randint(1, 100)} {prov}', '0909000000', 'contact@cinemax.vn', 10.0, 106.0, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', '08:00 - 23:00', 'Rạp hiện đại', 'IMAX');\n"
        
        # Rooms
        num_rooms = random.randint(2, 4)
        for r in range(num_rooms):
            sql += f"INSERT INTO rooms (id, cinema_id, name, total_rows, seats_per_row) VALUES "
            sql += f"({room_id}, {cinema_id}, 'Phòng {r+1}', 8, 10);\n"
            room_id += 1
            
        cinema_id += 1

# 3. Insert Showtimes
sql += "\n"
# Generate dates
today = datetime.date.today()
dates = [today + datetime.timedelta(days=x) for x in range(14)]
formats = ["2D Phụ Đề Việt", "IMAX2D Phụ Đề Việt", "4DX2D Phụ Đề Việt", "3D Lồng Tiếng"]

showtime_id = 1
now_showing_movies = [i+1 for i, m in enumerate(MOVIES) if m[2] == "now_showing"]

# Only add showtimes for a fraction of cinemas to save rows, or all?
for c in range(1, cinema_id):
    # Get rooms for this cinema
    # Rooms for cinema c are roughly... we need to track them.
    pass

# A better way to track rooms
sql = sql.replace("pass", "")

room_id_counter = 1
room_map = {} # cinema_id -> list of room_ids
c_id = 1
for i, prov in enumerate(PROVINCES):
    num_cinemas = random.randint(1, 3)
    for c in range(num_cinemas):
        num_rooms = random.randint(2, 4)
        room_map[c_id] = list(range(room_id_counter, room_id_counter + num_rooms))
        room_id_counter += num_rooms
        c_id += 1

for c_id, r_ids in room_map.items():
    for d in dates:
        # 30% chance a cinema has NO showtimes for a specific date (to show the greyed out tabs)
        if random.random() < 0.3:
            continue
            
        # Select 3-5 random movies showing here today
        num_movies = random.randint(3, 8)
        selected_movies = random.sample(now_showing_movies, num_movies)
        
        for m_id in selected_movies:
            # 2-4 showtimes per movie
            num_shows = random.randint(2, 4)
            for _ in range(num_shows):
                r_id = random.choice(r_ids)
                hour = random.randint(9, 22)
                minute = random.choice([0, 15, 30, 45])
                time_str = f"{hour:02d}:{minute:02d}:00"
                fmt = random.choice(formats)
                price = random.choice([75000, 85000, 100000, 120000])
                
                sql += f"INSERT INTO showtimes (id, movie_id, room_id, show_date, start_time, format, price) VALUES "
                sql += f"({showtime_id}, {m_id}, {r_id}, '{d.strftime('%Y-%m-%d')}', '{time_str}', '{fmt}', {price});\n"
                showtime_id += 1

with open('scratch/seed_data.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
    
print("SQL file generated successfully!")
