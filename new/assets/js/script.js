// Theme Toggle
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  themeToggleButton.textContent = '🌞';
}

themeToggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  themeToggleButton.textContent = isDark ? '🌞' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Navbar Toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});
