const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const files = [
    { name: 'lat-mat-7.jpg', title: 'Lật_mặt_7_poster.jpg' },
    { name: 'dao-pho-piano.jpg', title: 'Đào,_phở_và_piano_poster.jpg' },
    { name: 'ke-an-danh.jpg', title: 'Kẻ_ẩn_danh.jpg' },
    { name: 'nguoi-vo-cuoi-cung.jpg', title: 'Người_vợ_cuối_cùng.jpg' }
];

function getWikiUrl(filename) {
    // MD5 is calculated on the filename with underscores instead of spaces
    const hash = crypto.createHash('md5').update(filename.replace(/ /g, '_')).digest('hex');
    const a = hash[0];
    const b = hash.substring(0, 2);
    // Filename in URL must be URL encoded
    return `https://upload.wikimedia.org/wikipedia/vi/${a}/${b}/${encodeURIComponent(filename)}`;
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
    for (const f of files) {
        const url = getWikiUrl(f.title);
        console.log(`Downloading ${f.name} from ${url}`);
        try {
            await downloadImage(url, `/Users/admin/quanlirapphim-mvc-net/wwwroot/images/movies/${f.name}`);
            console.log(`Success: ${f.name}`);
        } catch (e) {
            console.error(e.message);
        }
    }
}
run();
