import re

with open('scratch/seed_data.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/seed_data.sql', 'w', encoding='utf-8') as f:
    for line in lines:
        if 'INSERT INTO rooms' in line:
            match = re.search(r"VALUES \((\d+), (\d+), '([^']+)', \d+, \d+\);", line)
            if match:
                room_id = match.group(1)
                cinema_id = match.group(2)
                room_name = match.group(3)
                new_room_name = f"{room_name} - Rạp {cinema_id}"
                line = line.replace(f"'{room_name}'", f"'{new_room_name}'")
        f.write(line)
