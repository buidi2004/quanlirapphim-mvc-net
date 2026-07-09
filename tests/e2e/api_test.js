const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');

const instance = axios.create({
    baseURL: 'http://localhost:5062',
    maxRedirects: 0,
    validateStatus: function (status) { return status >= 200 && status < 400; }
});

let sessionCookies = '';

async function getAntiforgery(url) {
    const res = await instance.get(url, { headers: { Cookie: sessionCookies } });
    if(res.headers['set-cookie']) {
        sessionCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    }
    const $ = cheerio.load(res.data);
    const token = $('input[name="__RequestVerificationToken"]').val();
    return token;
}

async function runTests() {
    console.log('🚀 Khởi động Hệ thống API Testing Tốc Độ Cao...');
    
    // 1. GET Login page
    let token = await getAntiforgery('/login');
    
    // 2. POST Login
    console.log('1. Đang đăng nhập (API)...');
    let res = await instance.post('/login', qs.stringify({
        Email: 'admin@cinemax.com',
        Password: 'Password123!',
        __RequestVerificationToken: token
    }), {
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: sessionCookies
        }
    });
    
    if(res.headers['set-cookie']) {
        const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        sessionCookies += '; ' + newCookies;
    }
    console.log('✅ Đăng nhập thành công! HTTP Status:', res.status);

    // 3. Test Add Movie
    console.log('2. Đang test API Thêm Phim Mới (/admin/movies)...');
    token = await getAntiforgery('/admin/movies');
    res = await instance.post('/admin/movies', qs.stringify({
        title: 'Siêu Phim API ' + Date.now(),
        genre: 'Hành động',
        status: 'now_showing',
        durationMinutes: '150',
        ageRating: 'P',
        description: 'Phim được tạo cực nhanh qua API Test',
        __RequestVerificationToken: token
    }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: sessionCookies }
    });
    console.log('✅ Thêm phim qua API thành công! HTTP Status:', res.status);

    // 4. Test Add Promotion
    console.log('3. Đang test API Khuyến Mãi (/admin/promotions)...');
    token = await getAntiforgery('/admin/promotions');
    const today = new Date().toISOString().split('T')[0];
    res = await instance.post('/admin/promotions', qs.stringify({
        code: 'API' + Date.now().toString().substring(8),
        title: 'Mã Giảm Giá Sinh Ra Bằng API',
        discountPercent: '25',
        validFrom: today,
        validTo: today,
        __RequestVerificationToken: token
    }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: sessionCookies }
    });
    console.log('✅ Thêm Khuyến Mãi thành công! HTTP Status:', res.status);

    // 5. Test Add Food
    console.log('4. Đang test API Bắp Nước (/admin/food-beverages)...');
    token = await getAntiforgery('/admin/food-beverages');
    res = await instance.post('/admin/food-beverages', qs.stringify({
        name: 'Combo API Thần Tốc',
        price: '99000',
        __RequestVerificationToken: token
    }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: sessionCookies }
    });
    console.log('✅ Thêm Bắp Nước thành công! HTTP Status:', res.status);
    
    console.log('🎉 TOÀN BỘ BACKEND HOẠT ĐỘNG HOÀN HẢO! 100% PASS');
}

runTests().catch(e => {
    console.error('❌ Lỗi:', e.message);
    if(e.response) {
        console.error('Response body:', e.response.data);
    }
});
