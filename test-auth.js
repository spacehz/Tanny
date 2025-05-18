// Test script to check authentication and make a donation request
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:5000';

// Test merchant credentials
const credentials = {
  email: 'boulangerie@tany.org',
  password: 'merchant123'
};

// Function to login and get authentication cookies
async function login() {
  try {
    console.log('Attempting to login...');
    const response = await axios.post(`${API_URL}/api/users/login`, credentials, {
      withCredentials: true
    });
    
    console.log('Login successful!');
    console.log('User data:', response.data.user);
    
    // Return the cookies from the response
    return response.headers['set-cookie'];
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get CSRF token
async function getCsrfToken(cookies) {
  try {
    console.log('Getting CSRF token...');
    const response = await axios.get(`${API_URL}/api/csrf-token`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('CSRF token obtained:', response.data.csrfToken);
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error.response?.data || error.message);
    throw error;
  }
}

// Function to create a test donation
async function createDonation(cookies, csrfToken) {
  try {
    console.log('Creating test donation...');
    
    // Sample donation data
    const donationData = {
      eventId: '65f1f5b8c1b5e9a8c8d8e9a8', // Replace with a valid event ID from your database
      items: [
        {
          product: 'Test Product',
          quantity: 1,
          unit: 'kg'
        }
      ],
      note: 'Test donation from script'
    };
    
    const response = await axios.post(`${API_URL}/api/donations`, donationData, {
      headers: {
        Cookie: cookies.join('; '),
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Donation created successfully!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create donation:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Main function to run the tests
async function runTests() {
  try {
    // Step 1: Login
    const cookies = await login();
    
    // Step 2: Get CSRF token
    const csrfToken = await getCsrfToken(cookies);
    
    // Step 3: Create donation
    await createDonation(cookies, csrfToken);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests();
