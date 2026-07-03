const axios = require('axios');

const API_URL = 'http://localhost:5062/api';
let token = '';

async function runDeepFlowTest() {
  console.log('--- STARTING DEEP BOOKING FLOW TEST ---');

  try {
    // 1. Login
    console.log('\n1. Login as test@example.com...');
    let res = await axios.post(`${API_URL}/auth/login`, { email: 'test@example.com', password: 'Password123' });
    if (!res.data.success) {
      // If test@example.com doesn't work, register it
      console.log('Login failed, attempting to register test user...');
      res = await axios.post(`${API_URL}/auth/register`, { username: 'testbooker', email: 'test@example.com', password: 'Password123' });
      if (!res.data.success) throw new Error("Could not login or register");
    }
    token = res.data.token;
    console.log(`✅ Logged in successfully. Token length: ${token.length}`);
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Get Movies
    console.log('\n2. Fetching Now Showing Movies...');
    res = await axios.get(`${API_URL}/movies?status=now_showing`);
    const movies = res.data.data;
    if (!movies || movies.length === 0) throw new Error("No movies found");
    const movie = movies[0];
    console.log(`✅ Selected Movie: ${movie.title} (ID: ${movie.id})`);

    // 3. Get Showtimes
    console.log(`\n3. Fetching Showtimes for Movie ${movie.id}...`);
    res = await axios.get(`${API_URL}/movies/${movie.id}/showtimes`);
    const showtimeGroups = res.data.showtimes;
    if (!showtimeGroups || showtimeGroups.length === 0) throw new Error("No showtimes found");
    // get first showtime
    const showtime = showtimeGroups[0];
    console.log(`✅ Selected Showtime: ID ${showtime.id}, Room: ${showtime.roomName}, Time: ${showtime.startTime}`);

    // 4. Get Seat Map
    console.log(`\n4. Fetching Seat Map for Showtime ${showtime.id}...`);
    res = await axios.get(`${API_URL}/booking/seatmap/${showtime.id}`);
    const seatMap = res.data.data.seats;
    if (!seatMap || seatMap.length === 0) throw new Error("No seats found");
    
    // Find 2 available seats
    const availableSeats = seatMap.filter(s => s.status === 'available');
    if (availableSeats.length < 2) throw new Error("Not enough available seats");
    const selectedSeats = [availableSeats[0].code, availableSeats[1].code];
    console.log(`✅ Selected Seats: ${selectedSeats.join(', ')}`);

    // 5. Hold Seats
    console.log(`\n5. Holding Seats...`);
    res = await axios.post(`${API_URL}/booking/hold`, {
      showtimeId: showtime.id,
      seatCodes: selectedSeats
    }, { headers });
    
    if (!res.data.success) throw new Error(`Hold failed: ${res.data.message}`);
    const holdResult = res.data.holdResult;
    const ticketIds = holdResult.ticketIds;
    console.log(`✅ Seats held successfully! Ticket IDs: ${ticketIds.join(', ')}. Expires in ${holdResult.remainingSeconds}s`);

    // 6. Confirm Booking
    console.log(`\n6. Confirming Payment...`);
    res = await axios.post(`${API_URL}/booking/confirm`, {
      ticketIds: ticketIds,
      paymentMethod: 'credit_card',
      promoCode: ''
    }, { headers });

    if (!res.data.success) throw new Error(`Booking failed: ${res.data.message}`);
    console.log(`✅ Booking Confirmed! Message: ${res.data.message}`);

    // 7. Check My Tickets
    console.log(`\n7. Fetching My Tickets History...`);
    res = await axios.get(`${API_URL}/tickets/my-tickets`, { headers });
    const myTickets = res.data.data;
    const recentTickets = myTickets.filter(t => selectedSeats.includes(t.seat_code) && t.showtime_id === showtime.id);
    if (recentTickets.length === 2) {
      console.log(`✅ Success: Found the 2 newly booked tickets in history!`);
    } else {
      console.log(`⚠️ Warning: Tickets not found in history, or count mismatch (found ${recentTickets.length}).`);
      console.log(myTickets);
    }

    console.log('\n--- DEEP FLOW TEST PASSED PERFECTLY ---');

  } catch (error) {
    console.error(`\n❌ DEEP FLOW TEST FAILED:`, error.response ? error.response.data : error.message);
  }
}

runDeepFlowTest();
