const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'wwwroot', 'images', 'movies');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const posters = [
    { name: 'lat-mat-7.jpg', title: 'Tập_tin:Lật_mặt_7_poster.jpg' },
    { name: 'mai.jpg', title: 'Tập_tin:Mai_2024_poster.jpg' },
    { name: 'dao-pho-piano.jpg', title: 'Tập_tin:Đào,_phở_và_piano_poster.jpg' },
    { name: 'ke-an-danh.jpg', title: 'Tập_tin:Kẻ_ẩn_danh.jpg' },
    { name: 'nguoi-vo-cuoi-cung.jpg', title: 'Tập_tin:Người_vợ_cuối_cùng.jpg' }
];

async function fetchImageInfo(title) {
    return new Promise((resolve, reject) => {
        const url = `https://vi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                const pages = json.query.pages;
                for (const key in pages) {
                    if (pages[key].imageinfo && pages[key].imageinfo[0]) {
                        resolve(pages[key].imageinfo[0].url);
                        return;
                    }
                }
                reject(new Error('No imageinfo found'));
            });
        }).on('error', reject);
    });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    for (const p of posters) {
        console.log(`Fetching ${p.name}...`);
        try {
            const imgUrl = await fetchImageInfo(p.title);
            console.log(`URL: ${imgUrl}`);
            const destPath = path.join(targetDir, p.name);
            await downloadImage(imgUrl, destPath);
            console.log(`Saved to ${destPath}`);
        } catch (e) {
            console.error(`Error for ${p.name}:`, e.message);
        }
    }
}

run();
