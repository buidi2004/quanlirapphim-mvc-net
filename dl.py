from duckduckgo_search import DDGS
import requests

movies = {
    'lat-mat-7.jpg': 'Poster phim Lật Mặt 7: Một Điều Ước 2024',
    'dao-pho-piano.jpg': 'Poster phim Đào phở và piano 2024',
    'ke-an-danh.jpg': 'Poster phim Kẻ ẩn danh 2023',
    'nguoi-vo-cuoi-cung.jpg': 'Poster phim Người vợ cuối cùng 2023'
}

ddgs = DDGS()
for filename, query in movies.items():
    print(f"Searching for {query}...")
    try:
        results = list(ddgs.images(query, max_results=1))
        if results:
            url = results[0]['image']
            print(f"Downloading from {url}...")
            r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            if r.status_code == 200:
                with open(f"/Users/admin/quanlirapphim-mvc-net/wwwroot/images/movies/{filename}", 'wb') as f:
                    f.write(r.content)
                print(f"Saved {filename}")
            else:
                print(f"Failed to download {url}")
    except Exception as e:
        print(f"Error: {e}")
