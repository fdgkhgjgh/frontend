// frontend/js/auth.js
import { API_BASE_URL } from './config.js'; // Import the constant

// Register Form
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

if (registerForm) { // Check if the element exists on the current page
  registerForm.addEventListener('submit', async (e) => { //Keep async
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        registerMessage.textContent = data.message;
        registerMessage.style.color = 'green';
        // Optionally redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        registerMessage.textContent = data.message;
        registerMessage.style.color = 'red';
      }
    } catch (error) {
      console.error('Registration error:', error);
      registerMessage.textContent = 'An error occurred during registration.';
      registerMessage.style.color = 'red';
    }
  });
}

// Login Form
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        async function doLogin() { // Inner async function
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                console.log('Login Response:', response);
                const data = await response.json();
                console.log('Login Data:', data);

                if (response.ok) {
                  loginMessage.textContent = data.message;
                  loginMessage.style.color = "green";
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('userId', data.userId);
                  localStorage.setItem('username', data.username); // ADD THIS LINE
                  window.location.href = 'index.html';
                } else {
                    loginMessage.textContent = data.message;
                    loginMessage.style.color = "red";
                }
            } catch (error) {
                console.error('Login error:', error);
                loginMessage.textContent = 'An error occurred during login.';
                loginMessage.style.color = 'red';
            }
        }

        doLogin(); // Call the inner async function
    });
}

// Logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        // Remove the token from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        // Redirect to the main page (or login page)
        window.location.href = 'index.html';
      });
  }
  
  // Function to check login status and show/hide elements
  function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const logoutButton = document.getElementById('logout-button');
    const registerLink = document.querySelector('a[href="register.html"]');
    const loginLink = document.querySelector('a[href="login.html"]');
    const profileLink = document.querySelector('a[href="profile.html"]'); // Add profile link
    
    
    if (token) {
       // ... (other parts of the if block)
        // Show profile link.
        if (profileLink) {
          profileLink.style.display = 'inline-block'
        }
    } else {
       // ... (other parts of the else block)
        if (profileLink) {
          profileLink.style.display = 'none'
        }
    
    }
    }
  
  export { checkLoginStatus };

    