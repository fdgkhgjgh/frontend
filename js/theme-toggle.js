// frontend/js/theme-toggle.js
const themeStylesheet = document.getElementById('theme-stylesheet');
const themeToggle = document.getElementById('theme-toggle');

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
  } else {
    themeStylesheet.href = 'css/style.css';//or light-mode.css ,if you have.

  }
  localStorage.setItem('theme', theme);
}