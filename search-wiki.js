const https = require('https');

function searchWiki(query) {
    const url = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=Tập_tin:${encodeURIComponent(query)}&format=json`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            if (json.query && json.query.search.length > 0) {
                console.log(`Results for ${query}:`);
                json.query.search.slice(0, 3).forEach(r => console.log('  - ' + r.title));
            } else {
                console.log(`No results for ${query}`);
            }
        });
    });
}

searchWiki('Lật mặt 7 poster');
searchWiki('Đào phở và piano poster');
searchWiki('Kẻ ẩn danh poster');
searchWiki('Người vợ cuối cùng poster');
