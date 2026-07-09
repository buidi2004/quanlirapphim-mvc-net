const https = require('https');

function getArticleImage(articleTitle) {
    const url = `https://vi.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(articleTitle)}&pithumbsize=500&format=json`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            const pages = json.query.pages;
            for (const key in pages) {
                if (pages[key].thumbnail) {
                    console.log(`${articleTitle}: ${pages[key].thumbnail.source}`);
                } else {
                    console.log(`No image for ${articleTitle}`);
                }
            }
        });
    });
}

getArticleImage('Lật mặt 7: Một điều ước');
getArticleImage('Đào, phở và piano');
getArticleImage('Kẻ ẩn danh (phim 2023)');
getArticleImage('Người vợ cuối cùng');
