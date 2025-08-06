import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test authentication endpoints
async function testAuth() {
  try {
    console.log('Testing TurfX API Authentication...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: Register a test user
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.data.name);
      
      // Store token for further tests
      const token = registerResponse.data.token;
      
      // Test 3: Test protected endpoint
      console.log('\n3. Testing protected endpoint...');
      const authResponse = await axios.get(`${API_BASE}/health/auth-test`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Authentication test passed:', authResponse.data.message);

      // Test 4: Get user profile
      console.log('\n4. Testing user profile...');
      const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile retrieved:', profileResponse.data.data.name);

      // Test 5: Test dashboard stats
      console.log('\n5. Testing dashboard stats...');
      const statsResponse = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Dashboard stats retrieved:', statsResponse.data.data);

      console.log('\n🎉 All authentication tests passed!');

    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  User already exists, testing login instead...');
        
        // Test login instead
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ Login successful:', loginResponse.data.data.name);
        
        const token = loginResponse.data.token;
        
        // Test protected endpoint with login token
        const authResponse = await axios.get(`${API_BASE}/health/auth-test`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Authentication test passed:', authResponse.data.message);
        
        console.log('\n🎉 Login authentication tests passed!');
      } else {
        console.error('❌ Registration failed:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth(); 