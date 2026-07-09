import urllib.request
import json
import time

movies = {
    'lat-mat-7.jpg': 'Lat mat 7 poster',
    'dao-pho-piano.jpg': 'Dao pho va piano poster',
    'ke-an-danh.jpg': 'Ke an danh 2023 poster',
    'nguoi-vo-cuoi-cung.jpg': 'Nguoi vo cuoi cung poster'
}

for filename, query in movies.items():
    print(f"Searching for {query}...")
    search_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=movie&limit=1"
    req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        if data['resultCount'] > 0:
            img_url = data['results'][0]['artworkUrl100'].replace('100x100', '600x600')
            print(f"Found: {img_url}")
            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_res = urllib.request.urlopen(img_req)
            with open(f"/Users/admin/quanlirapphim-mvc-net/wwwroot/images/movies/{filename}", "wb") as f:
                f.write(img_res.read())
        else:
            print(f"Not found in iTunes for {query}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(1)
