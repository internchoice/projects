import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const loginBtn = document.getElementById("auth-link");
  const logoutBtn = document.getElementById("logoutBtn");
  const wishlistContainer = document.getElementById("wishlistContainer");
  const emptyWishlist = document.getElementById("emptyWishlist");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";

      const wishlistRef = collection(db, "users", user.uid, "wishlist");
      const snapshot = await getDocs(wishlistRef);

      if (snapshot.empty) {
        emptyWishlist.style.display = "block";
        return;
      }

      snapshot.forEach(doc => {
        const item = doc.data();
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${item.imageUrl}" alt="${item.title}" class="card-img" />
          <div class="card-content">
            <h3>${item.title}</h3>
            <p>Price: ₹${item.price}</p>
            <p>Discount: ${item.discount || "None"}</p>
            <button class="add-to-cart-btn" data-id="${doc.id}">Add to Cart</button>
          </div>`;
        wishlistContainer.appendChild(card);
      });

      document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const itemId = btn.getAttribute("data-id");
          alert(`Add to Cart functionality to be implemented for item ID: ${itemId}`);
        });
      });

    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
      alert("Please login to view your wishlist.");
      window.location.href = "login.html";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      }).catch(err => {
        console.error("Logout failed:", err);
      });
    });
  }
});
