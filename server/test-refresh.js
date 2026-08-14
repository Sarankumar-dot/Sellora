import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sellora-backend-u514.onrender.com/api',
  withCredentials: true,
});

async function test() {
  try {
    console.log('Logging in...');
    const email = `test-${Date.now()}@test.com`;
    const mobile = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await api.post('/auth/register', {
      name: 'Test User',
      email: email,
      password: 'Password123!',
      mobileNumber: mobile
    });
    
    const loginRes = await api.post('/auth/login', {
      email,
      password: 'Password123!'
    });
    
    const cookies = loginRes.headers['set-cookie'];
    console.log('Set-Cookie header from login:', cookies);
    
    console.log('Refreshing token...');
    const refreshRes = await api.post('/auth/refresh-token', {}, {
      headers: {
        Cookie: cookies[0]
      }
    });
    console.log('Refresh response:', refreshRes.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
}

test();
