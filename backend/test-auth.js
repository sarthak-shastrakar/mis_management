const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/admin';

async function testAuth() {
  try {
    console.log('--- Testing Admin Registration ---');
    const registerRes = await axios.post(`${BASE_URL}/register`, {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'password123',
    });
    console.log('Registration Success:', registerRes.data);

    console.log('\n--- Testing Admin Login ---');
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'password123',
    });
    console.log('Login Success:', loginRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testAuth();
