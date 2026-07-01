const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/login');
    await page.type('input[name="Email"]', 'admin@cinemax.com');
    await page.type('input[name="Password"]', 'admin');
    await Promise.all([ 
        page.waitForNavigation(), 
        page.$eval('button[type="submit"]', btn => btn.click()) 
    ]);
    
    const url = page.url();
    console.log('URL after login:', url);
    if(url.includes('login')) {
        const error = await page.evaluate(() => {
            const el = document.querySelector('.alert-danger');
            return el ? el.innerText : 'No alert-danger found. Body: ' + document.body.innerText.substring(0, 200);
        });
        console.log('Login Error Message:', error);
    }
    await browser.close();
})();
