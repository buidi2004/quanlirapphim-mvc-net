
UPDATE showtimes SET show_date = DATE_SUB(show_date, INTERVAL 1 DAY);
UPDATE movies SET poster_url = CONCAT('https://placehold.co/400x600/1a1a2e/ffffff?text=', REPLACE(REPLACE(title, ' ', '+'), '&', 'and'));
