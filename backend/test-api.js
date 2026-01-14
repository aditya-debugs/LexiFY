// Test script for the search functionality
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test user search
async function testSearchUsers() {
  try {
    console.log('Testing user search API...');
    
    // You would need to replace this with a valid JWT token from a logged-in user
    const token = 'your-jwt-token-here';
    
    const response = await axios.get(`${API_BASE}/users/search?query=test`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('Search results:', response.data);
  } catch (error) {
    console.error('Search test failed:', error.response?.data || error.message);
  }
}

// Test signup with username
async function testSignupWithUsername() {
  try {
    console.log('Testing signup with username...');
    
    const testUser = {
      fullName: 'Test User',
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE}/auth/signup`, testUser);
    console.log('Signup successful:', response.data);
  } catch (error) {
    console.error('Signup test failed:', error.response?.data || error.message);
  }
}

// Test login with username
async function testLoginWithUsername() {
  try {
    console.log('Testing login with username...');
    
    const loginData = {
      emailOrUsername: 'testuser123',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login test failed:', error.response?.data || error.message);
  }
}

// Uncomment to run tests
// testSignupWithUsername();
// testLoginWithUsername();
// testSearchUsers();

console.log('Test script loaded. Uncomment functions to run tests.');