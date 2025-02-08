// frontend/js/auth.js
const API_BASE_URL = 'https://backend-5be9.onrender.com/api'; // Or your Render backend URL

// Register Form
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

if (registerForm) { // Check if the element exists on the current page
  registerForm.addEventListener('submit', async (e) => {
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
  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
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

          const data = await response.json();
          if (response.ok) {
              loginMessage.textContent = data.message;
              loginMessage.style.color = "green"
              // Store the token in local storage
              localStorage.setItem('token', data.token);
              localStorage.setItem('userId', data.userId); // Store user ID as well
              // Redirect to the main page
              window.location.href = 'index.html';
          } else {
              loginMessage.textContent = data.message;
              loginMessage.style.color = "red"
          }
      } catch (error) {
          console.error('Login error:', error);
          loginMessage.textContent = 'An error occurred during login.';
          loginMessage.style.color = 'red';
      }
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
  const newPostLink = document.getElementById('new-post-link');
  const registerLink = document.querySelector('a[href="register.html"]'); //find register link
  const loginLink = document.querySelector('a[href="login.html"]');      //find login link.

  if (token) {
      // User is logged in
      if (logoutButton) logoutButton.style.display = 'inline-block';  // Show logout button
      if (newPostLink) newPostLink.style.display = 'inline-block';    // Show new post link
      if (registerLink) registerLink.style.display = 'none'; //Hide register link
      if (loginLink) loginLink.style.display = 'none';    //Hide login Link
  } else {
      // User is not logged in
      if (logoutButton) logoutButton.style.display = 'none';   // Hide logout button
      if (newPostLink) newPostLink.style.display = 'none';     // Hide new post link.
      if (registerLink) registerLink.style.display = 'inline-block';  //Show the register link
      if (loginLink) loginLink.style.display = 'inline-block';    //Show the login link.
  }
}