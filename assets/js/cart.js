import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const cartRef = collection(db, "users", user.uid, "cart");
  const cartSnapshot = await getDocs(cartRef);
  const container = document.getElementById("cart-items");
  const totalElem = document.getElementById("cart-total");
  let total = 0;

  if (cartSnapshot.empty) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    document.getElementById("cart-summary").style.display = "none";
    return;
  }

  cartSnapshot.forEach(docSnap => {
    const d = docSnap.data();
    const price = Number(d.price);
    total += price;

    const card = document.createElement("div");
    card.className = "cart-card";
    card.innerHTML = `
      <img src="${d.imageUrl}" class="cart-img">
      <div class="cart-info">
        <h4>${d.title}</h4>
        <p>₹${price}</p>
        <button class="remove-btn" data-id="${docSnap.id}">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });

  totalElem.textContent = `₹${total}`;

  // Remove item from cart
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const slug = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "users", user.uid, "cart", slug));
      location.reload();
    });
  });

  // Place Order
// Place Order
document.getElementById("place-order-btn").addEventListener("click", async () => {
  const orderRef = collection(db, "users", user.uid, "orders");

  for (const docSnap of cartSnapshot.docs) {
    const orderData = docSnap.data();
    const projectId = orderData.projectId || docSnap.id; // fallback to docSnap.id if projectId not available

    // 1. Reduce stock in 'projectdetails' collection
    const productRef = doc(db, "projectdetails", projectId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentStock = productSnap.data().stock || 0;
      const newStock = currentStock > 0 ? currentStock - 1 : 0;
      await updateDoc(productRef, { stock: newStock });
    }

    // 2. Add to order collection
    await setDoc(doc(orderRef, docSnap.id), {
      ...orderData,
      orderedAt: new Date()
    });

    // 3. Remove from cart
    await deleteDoc(doc(db, "users", user.uid, "orders", docSnap.id));
  }

  alert("Order placed successfully and stock updated!");
  location.reload();
});

});
