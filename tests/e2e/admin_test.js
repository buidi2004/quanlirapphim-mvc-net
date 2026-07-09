const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Khởi động Robot Test Giao Diện Admin...');
    
    // Khởi chạy trình duyệt (Headed mode)
    const browser = await puppeteer.launch({
        headless: false, // Hiện giao diện cho user xem
        slowMo: 40,      // Làm chậm lại 40ms mỗi thao tác để dễ quan sát
        defaultViewport: { width: 1366, height: 768 },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        console.log('1. Bắt đầu Đăng nhập...');
        await page.goto('http://localhost:5062/login');
        await page.type('input[name="Email"]', 'admin@cinemax.com');
        await page.type('input[name="Password"]', 'Password123!');
        await Promise.all([
            page.waitForNavigation(),
            page.$eval('.card form button[type="submit"]', btn => btn.click())
        ]);
        console.log('✅ Đăng nhập thành công!');

        console.log('2. Truy cập Dashboard...');
        await page.goto('http://localhost:5062/admin/dashboard');
        await new Promise(r => setTimeout(r, 1000));

        console.log('3. Test Thêm Phim Mới...');
        await page.goto('http://localhost:5062/admin/movies');
        await page.waitForSelector('button[data-bs-target="#addMovieModal"]', { timeout: 5000 });
        await page.click('button[data-bs-target="#addMovieModal"]');
        await page.waitForSelector('#addMovieModal input[name="title"]', { visible: true, timeout: 5000 });
        await page.type('#addMovieModal input[name="title"]', 'Phim Của Robot Auto Test');
        await page.type('#addMovieModal input[name="durationMinutes"]', '120');
        await page.select('#addMovieModal select[name="status"]', 'now_showing');
        await Promise.all([
            page.waitForNavigation(),
            page.click('#addMovieModal button[type="submit"]')
        ]);
        console.log('✅ Thêm phim thành công!');

        console.log('4. Test Khuyến Mãi...');
        await page.goto('http://localhost:5062/admin/promotions');
        await page.waitForSelector('button[data-bs-target="#addPromoModal"]', { timeout: 5000 });
        await page.click('button[data-bs-target="#addPromoModal"]');
        await page.waitForSelector('#addPromoModal input[name="code"]', { visible: true, timeout: 5000 });
        await page.type('#addPromoModal input[name="code"]', 'ROBOT2026');
        await page.type('#addPromoModal input[name="title"]', 'Mã Giảm Giá Tự Động');
        await page.type('#addPromoModal input[name="discountPercent"]', '15');
        // validFrom and validTo
        const today = new Date().toISOString().split('T')[0];
        await page.$eval('#addPromoModal input[name="validFrom"]', (el, date) => el.value = date, today);
        await page.$eval('#addPromoModal input[name="validTo"]', (el, date) => el.value = date, today);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#addPromoModal button[type="submit"]')
        ]);
        console.log('✅ Thêm khuyến mãi thành công!');

        console.log('5. Test Đăng Tin Tức...');
        await page.goto('http://localhost:5062/admin/news');
        await page.waitForSelector('button[data-bs-target="#addNewsModal"]', { timeout: 5000 });
        await page.click('button[data-bs-target="#addNewsModal"]');
        await page.waitForSelector('#addNewsModal input[name="title"]', { visible: true, timeout: 5000 });
        await page.type('#addNewsModal input[name="title"]', 'Robot Vừa Viết Bài Này');
        await page.type('#addNewsModal textarea[name="excerpt"]', 'Đây là đoạn trích dẫn tự động.');
        await page.type('#addNewsModal textarea[name="content"]', 'Nội dung chi tiết được tạo ra bởi siêu Robot Antigravity bằng thư viện Puppeteer!');
        await Promise.all([
            page.waitForNavigation(),
            page.click('#addNewsModal button[type="submit"]')
        ]);
        console.log('✅ Đăng tin tức thành công!');

        console.log('6. Test Bắp Nước (Food & Beverages)...');
        await page.goto('http://localhost:5062/admin/food-beverages');
        await page.waitForSelector('button[data-bs-target="#addFoodModal"]', { timeout: 5000 });
        await page.click('button[data-bs-target="#addFoodModal"]');
        await page.waitForSelector('#addFoodModal input[name="name"]', { visible: true, timeout: 5000 });
        await page.type('#addFoodModal input[name="name"]', 'Combo Robot Siêu To Khổng Lồ');
        await page.type('#addFoodModal input[name="price"]', '199000');
        await Promise.all([
            page.waitForNavigation(),
            page.click('#addFoodModal button[type="submit"]')
        ]);
        console.log('✅ Thêm Bắp nước thành công!');

        console.log('7. Test Giao Diện Quầy POS Bán Vé...');
        await page.goto('http://localhost:5062/admin/pos');
        await new Promise(r => setTimeout(r, 3000)); // Chờ load phim
        console.log('✅ Truy cập Quầy POS thành công!');

        console.log('🎉 Hoàn thành toàn bộ kịch bản Test Tự Động Toàn Diện!');
        
        // Chờ 5 giây để user ngắm thành quả trước khi đóng
        await new Promise(r => setTimeout(r, 5000));

    } catch (error) {
        console.error('❌ Có lỗi xảy ra trong quá trình test:', error);
    } finally {
        await browser.close();
        console.log('Đã đóng trình duyệt.');
    }
})();
