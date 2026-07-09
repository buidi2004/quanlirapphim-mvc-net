const axios = require('axios');
const API_BASE = 'http://localhost:5062/api';
let token = '';

async function runE2E() {
  console.log("=== BẮT ĐẦU TEST E2E LUỒNG ĐẶT VÉ ===");
  try {
    const email = `testuser_${Date.now()}@cinemax.com`;
    const password = "Password123!";
    
    await axios.post(`${API_BASE}/auth/register`, {
      fullName: "Test E2E User", email: email, password: password, phone: "0900000000"
    });

    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: email, password: password
    });
    token = loginRes.data.data.token;
    console.log(`1. Đăng nhập thành công, email: ${email}`);
    const headers = { Authorization: `Bearer ${token}` };

    const cinemaRes = await axios.get(`${API_BASE}/cinemas`, { headers });
    const cinemas = cinemaRes.data.data;
    
    // Pick cinema with ID = 1 because we know it has rooms and showtimes
    const cinema = cinemas.find(c => c.id === 1) || cinemas[0];
    const cinemaId = cinema.id;
    console.log(`2. Chọn rạp: ${cinema.name} (ID: ${cinemaId})`);

    let showtimeGroups = [];
    let checkDate = new Date();
    for (let i = 0; i < 7; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        const res = await axios.get(`${API_BASE}/cinemas/${cinemaId}/showtimes?date=${dStr}`, { headers });
        if (res.data.data && res.data.data.length > 0 && res.data.data[0].showtimes && res.data.data[0].showtimes.length > 0) {
            showtimeGroups = res.data.data;
            break;
        }
        checkDate.setDate(checkDate.getDate() + 1);
    }

    let targetShowtimeId = null;
    let seatCode = 'C5';
    
    if (showtimeGroups && showtimeGroups.length > 0) {
        // Find any valid showtime in the groups
        outer: for (const g of showtimeGroups) {
            for (const st of g.showtimes) {
                targetShowtimeId = st.id;
                break outer;
            }
        }
    }
    
    if (!targetShowtimeId) {
        console.log("⚠️ Không tìm thấy suất chiếu nào cho rạp này hôm nay.");
        return;
    }

    console.log(`3. Chọn suất chiếu ID: ${targetShowtimeId}`);

    const seatMapRes = await axios.get(`${API_BASE}/booking/seatmap/${targetShowtimeId}`, { headers });
    const seats = seatMapRes.data.data.seats;
    const availableSeats = seats.filter(s => s.status === 'available');
    if (availableSeats.length === 0) {
        console.log("⚠️ Không còn ghế trống.");
        return;
    }
    seatCode = availableSeats[0].code;
    console.log(`4. Chọn ghế: ${seatCode} (Giá: ${availableSeats[0].price})`);

    const holdRes = await axios.post(`${API_BASE}/booking/hold`, {
      showtimeId: targetShowtimeId,
      seatCodes: [seatCode]
    }, { headers });
    const ticketIds = holdRes.data.data.holdResult.ticketIds;
    console.log(`5. Giữ ghế thành công, Ticket IDs: ${ticketIds.join(', ')}`);

    const confirmRes = await axios.post(`${API_BASE}/booking/confirm`, {
      ticketIds: ticketIds,
      paymentMethod: "momo",
      promoCode: ""
    }, { headers });
    console.log("6. Đặt vé thành công! Message:");
    console.log("   " + confirmRes.data.message);

    console.log("\n🎉 LUỒNG E2E ĐÃ HOÀN TẤT THÀNH CÔNG TỪ A-Z!");

  } catch (error) {
    console.error("❌ LỖI TRONG QUÁ TRÌNH E2E:");
    if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    else console.error(error.message);
  }
}
runE2E();
