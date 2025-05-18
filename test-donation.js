// Test script to create a donation using the frontend service
// This script simulates what happens in the browser

// Mock the browser environment
global.localStorage = {
  _data: {},
  setItem(key, value) {
    this._data[key] = value;
  },
  getItem(key) {
    return this._data[key];
  },
  removeItem(key) {
    delete this._data[key];
  }
};

// Mock window.alert and window.confirm
global.alert = console.log;
global.confirm = () => true;

// Set environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';

// Import the services
const { login } = require('./frontend/src/services/authService');
const { createDonation } = require('./frontend/src/services/donationService');

async function testDonation() {
  try {
    console.log('1. Logging in as test merchant...');
    const loginResult = await login('boulangerie@tany.org', 'merchant123');
    console.log('Login successful:', loginResult);
    
    // Create a test donation
    const donationData = {
      eventId: '65f1f5b8c1b5e9a8c8d8e9a8', // Replace with a valid event ID
      donations: [
        {
          id: 1,
          product: 'Pain frais',
          quantity: 2,
          unit: 'kg'
        },
        {
          id: 2,
          product: 'Croissants',
          quantity: 10,
          unit: 'unité'
        }
      ],
      note: 'Test donation from script'
    };
    
    console.log('\n2. Creating donation with data:', donationData);
    const result = await createDonation(donationData);
    console.log('Donation created successfully:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDonation();
