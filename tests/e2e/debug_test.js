const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:5062/login');
    await page.type('input[name="Email"]', 'admin@cinemax.com');
    await page.type('input[name="Password"]', 'Password123!');
    await Promise.all([ 
        page.waitForNavigation(), 
        page.$eval('.card form button[type="submit"]', btn => btn.click()) 
    ]);
    
    await page.goto('http://localhost:5062/admin/news');
    console.log('URL is:', page.url());
    const html = await page.content();
    console.log(html.substring(0, 1000));
    if (html.includes('addNewsModal')) {
        console.log('FOUND addNewsModal');
    } else {
        console.log('NOT FOUND addNewsModal');
    }
    await browser.close();
})();
