document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');

  // Use the global API_URL or default
  const API_URL = window.API_URL || 'http://localhost:5000/api';

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Clear any previous error
      if (errorMessage) {
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';
      }

      // Validate inputs
      if (!username || !email || !password) {
        showError('All fields are required');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      console.log('📤 Sending registration request...');
      console.log('📝 Data:', { username, email, password: '******' });

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });

        console.log('📥 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', data);

        if (!response.ok) {
          // Handle validation errors from backend
          if (data.errors && Array.isArray(data.errors)) {
            throw new Error(data.errors.map(err => err.msg).join(', '));
          }
          throw new Error(data.message || 'Registration failed');
        }

        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        console.log('✅ Registration successful! Redirecting...');
        window.location.href = 'dashboard.html';
        
      } catch (error) {
        console.error('❌ Registration error:', error);
        showError(error.message || 'Failed to register. Please try again.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError('All fields are required');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = 'dashboard.html';
        
      } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
      }
    });
  }

  // Helper function to show errors
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.add('show');
      setTimeout(() => errorMessage.classList.remove('show'), 5000);
    } else {
      alert(message);
    }
  }
});