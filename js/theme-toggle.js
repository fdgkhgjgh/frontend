// frontend/js/theme-toggle.js
const themeStylesheet = document.getElementById('theme-stylesheet');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'light'; // Default to light
setTheme(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = themeStylesheet.href.includes('dark-mode.css') ? 'light' : 'dark';
      setTheme(newTheme);
    });
}

function setTheme(theme) {
  if (theme === 'dark') {
    themeStylesheet.href = 'css/dark-mode.css';
    body.classList.add('dark-mode');
  } else {
    themeStylesheet.href = 'css/style.css';//or light-mode.css ,if you have.
    body.classList.remove('dark-mode');

  }
  localStorage.setItem('theme', theme);
}