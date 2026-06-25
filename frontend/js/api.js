// Use localhost for development
const API_URL = 'https://taskmaster-backend-yoza.onrender.com/api';

// Make it globally available
window.API_URL = API_URL;

// Test function to check connection
async function testApiConnection() {
  try {
    const response = await fetch('http://localhost:5000');
    const data = await response.json();
    console.log('✅ API Connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    return false;
  }
}

// Run test on load
testApiConnection();

const api = {
  async request(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log(`📡 ${method} request to: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      return result;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }
};