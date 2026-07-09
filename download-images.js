const { image_search } = require('duckduckgo-images-api');
const https = require('https');
const http = require('http');
const fs = require('fs');

const movies = {
    'lat-mat-7.jpg': 'Poster phim Lật Mặt 7: Một Điều Ước 2024',
    'dao-pho-piano.jpg': 'Poster phim Đào, phở và piano 2024',
    'ke-an-danh.jpg': 'Poster phim Kẻ ẩn danh 2023',
    'nguoi-vo-cuoi-cung.jpg': 'Poster phim Người vợ cuối cùng 2023'
};

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const reqModule = url.startsWith('https') ? https : http;
        reqModule.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    for (const [filename, query] of Object.entries(movies)) {
        console.log(`Searching for ${query}...`);
        try {
            const results = await image_search({ query, moderate: true });
            if (results && results.length > 0) {
                const imgUrl = results[0].image;
                console.log(`Found: ${imgUrl}`);
                await downloadImage(imgUrl, `/Users/admin/quanlirapphim-mvc-net/wwwroot/images/movies/${filename}`);
                console.log(`Saved ${filename}`);
            } else {
                console.log(`Not found for ${query}`);
            }
        } catch (e) {
            console.error(e.message);
        }
    }
}

run();
