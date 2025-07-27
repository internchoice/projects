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
  const wishlistContainer = document.getElementById("wishlistContainer");
  const emptyWishlist = document.getElementById("emptyWishlist");
  const loginBtn = document.getElementById("auth-link");

  const renderEmptyButton = () => {
    const btn = document.createElement("button");
    btn.textContent = "🗑️ Empty Wishlist";
    btn.className = "empty-wishlist-btn";
    btn.style.marginBottom = "20px";
    btn.addEventListener("click", async () => {
      const confirmDelete = confirm("Are you sure you want to delete all items from your wishlist?");
      if (confirmDelete && currentUser) {
        const wishlistRef = collection(db, "users", currentUser.uid, "wishlist");
        const snapshot = await getDocs(wishlistRef);
        for (let docSnap of snapshot.docs) {
          await deleteDoc(doc(db, "users", currentUser.uid, "wishlist", docSnap.id));
        }
        wishlistContainer.innerHTML = "";
        emptyWishlist.style.display = "block";
      }
    });
    wishlistContainer.before(btn);
  };

  let currentUser = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please login to view your wishlist.");
      window.location.href = "login.html";
      return;
    }

    currentUser = user;
    loginBtn.style.display = "none";

    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const snapshot = await getDocs(wishlistRef);

    if (snapshot.empty) {
      emptyWishlist.style.display = "block";
      return;
    }

    renderEmptyButton();

    snapshot.forEach(docSnap => {
      const item = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${item.imageUrl || "https://via.placeholder.com/100"}" alt="${item.title}" class="card-img" />
        <div class="card-content">
          <h3>${item.title}</h3>
          <p>Price: ₹${item.price}</p>
          <p>Discount: ${item.discount || "None"}</p>
          <button class="add-to-cart-btn" data-id="${docSnap.id}">Add to Cart</button>
          <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
        </div>`;
      wishlistContainer.appendChild(card);
    });

    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const itemId = btn.getAttribute("data-id");
        alert(`Add to Cart functionality to be implemented for item ID: ${itemId}`);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const itemId = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "users", user.uid, "wishlist", itemId));
        btn.closest(".card").remove();
        if (wishlistContainer.children.length === 0) {
          emptyWishlist.style.display = "block";
        }
      });
    });
  });
});
