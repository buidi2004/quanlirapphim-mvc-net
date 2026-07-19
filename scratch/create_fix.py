import subprocess

sql_query = """
UPDATE showtimes SET show_date = DATE_SUB(show_date, INTERVAL 1 DAY);
UPDATE movies SET poster_url = CONCAT('https://placehold.co/400x600/1a1a2e/ffffff?text=', REPLACE(REPLACE(title, ' ', '+'), '&', 'and'));
"""

with open("scratch/fix.sql", "w", encoding="utf-8") as f:
    f.write(sql_query)
