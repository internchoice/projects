// ------------------ Firebase Setup ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676",
  measurementId: "G-WWH1GZZDKX"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);

// ------------------ Theme Toggle ------------------
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  themeToggleButton.textContent = '🌞';
}

themeToggleButton?.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  themeToggleButton.textContent = isDark ? '🌞' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ------------------ Navbar Toggle ------------------
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// ------------------ Auth: Login / Logout & Shopping Display ------------------
window.addEventListener('DOMContentLoaded', () => {
  const authLink = document.getElementById('auth-link');
  const shoppingSection = document.getElementById('shopping-section');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.onclick = (e) => {
        e.preventDefault();
        signOut(auth).then(() => location.reload());
      };

      // Show Shopping Section
      shoppingSection.classList.remove('hidden');
    } else {
      authLink.textContent = 'Login / Signup';
      authLink.href = 'login.html';

      // Hide Shopping Section
      shoppingSection.classList.add('hidden');
    }
  });
});
