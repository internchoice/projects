import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
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

const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

const renderEmptyButton = (userId, container) => {
  const btn = document.createElement("button");
  btn.textContent = "🗑️ Empty All Orders";
  btn.className = "empty-orders-btn";
  btn.style.marginBottom = "20px";
  btn.addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete all orders?");
    if (confirmDelete) {
      const ordersRef = collection(db, "users", userId, "orders");
      const snapshot = await getDocs(ordersRef);
      for (let docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "users", userId, "orders", docSnap.id));
      }
      container.innerHTML = "";
      document.getElementById("emptyOrders").style.display = "block";
    }
  });
  container.before(btn);
};

onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("auth-link");
  const logoutLink = document.getElementById("logout-link");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline-block";

    const ordersContainer = document.getElementById("ordersContainer");
    const emptyOrders = document.getElementById("emptyOrders");

    if (!ordersContainer || !emptyOrders) return;

    const ordersRef = collection(db, "users", user.uid, "orders");
    const snapshot = await getDocs(ordersRef);

    if (snapshot.empty) {
      emptyOrders.style.display = "block";
      return;
    }

    renderEmptyButton(user.uid, ordersContainer);

    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${order.imageUrl || 'https://via.placeholder.com/100'}" alt="${order.title}" class="card-img" />
        <div class="card-content">
          <h3>${order.title}</h3>
          <p>Price: ₹${order.price}</p>
          <p>Discount: ${order.discount || "None"}</p>
          <p>Quantity: ${order.quantity}</p>
          <p>Ordered At: ${order.orderedAt ? new Date(order.orderedAt.seconds * 1000).toLocaleString() : "N/A"}</p>
          <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
        </div>`;
      ordersContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const itemId = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "users", user.uid, "orders", itemId));
        btn.closest(".card").remove();
        if (ordersContainer.children.length === 0) {
          emptyOrders.style.display = "block";
        }
      });
    });

  } else {
    alert("Please login to view your orders.");
    window.location.href = "login.html";
  }
});

// Logout handler
const logoutBtn = document.getElementById("logout-link");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch((error) => {
      console.error("Logout failed:", error);
    });
  });
}
