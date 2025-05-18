// Script to check authentication status and cookies
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:5000';

// Test merchant credentials
const credentials = {
  email: 'boulangerie@tany.org',
  password: 'merchant123'
};

async function checkAuth() {
  try {
    console.log('1. Checking if backend is available...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('Backend health check response:', healthResponse.status);
    
    console.log('\n2. Attempting to login...');
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, credentials, {
      withCredentials: true
    });
    
    console.log('Login successful!');
    console.log('User data:', loginResponse.data.user);
    console.log('Cookies set:', loginResponse.headers['set-cookie']);
    
    // Store cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'];
    
    console.log('\n3. Getting CSRF token...');
    const csrfResponse = await axios.get(`${API_URL}/api/csrf-token`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('CSRF token response:', csrfResponse.data);
    const csrfToken = csrfResponse.data.csrfToken;
    
    console.log('\n4. Checking user profile...');
    const profileResponse = await axios.get(`${API_URL}/api/users/profile`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Profile response:', profileResponse.data);
    
    console.log('\n5. Testing a protected endpoint (GET /api/donations/merchant)...');
    const donationsResponse = await axios.get(`${API_URL}/api/donations/merchant`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Donations response status:', donationsResponse.status);
    console.log('Donations data:', donationsResponse.data);
    
    console.log('\nAll authentication checks passed successfully!');
  } catch (error) {
    console.error('Authentication check failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkAuth();
