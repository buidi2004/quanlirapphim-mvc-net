const axios = require('axios');
const API_URL = 'http://localhost:5062/api';
let token = '';

async function runTests() {
  // Try registering first
  try {
    console.log('Testing Register...');
    const res = await axios.post(`${API_URL}/auth/register`, { username: 'testuser', email: 'test@example.com', password: 'Password123' });
    if (res.data.success) {
      console.log('✅ Registered testuser');
    }
  } catch(e) {}

  // Login
  try {
    console.log('Testing Login...');
    const res = await axios.post(`${API_URL}/auth/login`, { email: 'test@example.com', password: 'Password123' });
    if (res.data.success && res.data.token) {
      token = res.data.token;
      console.log(`✅ Success: Logged in as ${res.data.user.email}`);
    } else {
      console.log('❌ Failed: Invalid login response', res.data);
    }
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
}
runTests();
