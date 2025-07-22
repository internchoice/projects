import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Navbar toggle
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Handle auth and orders
onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("auth-link") || document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    const ordersContainer = document.getElementById("ordersContainer");
    const emptyOrders = document.getElementById("emptyOrders");

    if (!ordersContainer || !emptyOrders) return;

    const ordersRef = collection(db, "users", user.uid, "orders");
    const snapshot = await getDocs(ordersRef);

    if (snapshot.empty) {
      emptyOrders.style.display = "block";
      return;
    }

    snapshot.forEach(doc => {
      const order = doc.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${order.imageUrl}" alt="${order.title}" class="card-img" />
        <div class="card-content">
          <h3>${order.title}</h3>
          <p>Price: ₹${order.price}</p>
          <p>Discount: ${order.discount || "None"}</p>
          <p>Quantity: ${order.quantity}</p>
          <p>Ordered At: ${
            order.orderedAt
              ? new Date(order.orderedAt.seconds * 1000).toLocaleString()
              : "N/A"
          }</p>
        </div>`;
      ordersContainer.appendChild(card);
    });
  } else {
    alert("Please login to view your orders.");
    window.location.href = "login.html";
  }
});

// Logout handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
  });
}
