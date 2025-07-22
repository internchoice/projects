// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676"
};

// ✅ Prevent duplicate initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Get slug from URL
const slug = location.hash.replace("#", "");

// Load project details
async function loadProjectDetails(slug) {
  try {
    const projectSnap = await db.collection('projects').where('slug', '==', slug).limit(1).get();
    const detailSnap = await db.collection('projectDetails').where('slug', '==', slug).limit(1).get();

    const projectData = !projectSnap.empty ? projectSnap.docs[0].data() : {};
    const detailData = !detailSnap.empty ? detailSnap.docs[0].data() : {};
    const data = { ...projectData, ...detailData };

    if (!data.title) {
      document.getElementById("project-title").textContent = "Project Not Found";
      return;
    }

    document.getElementById("project-title").textContent = data.title || "Untitled";
    document.getElementById("project-price").textContent = data.price ? `₹${data.price}` : "--";
    document.getElementById("project-discount").textContent = data.discount || "--";
    document.getElementById("project-stock").textContent = data.stock || "--";
    document.getElementById("project-category").textContent = data.domain || "--";
    document.getElementById("project-delivery").textContent = data.delivery || "--";
    document.getElementById("desc").innerHTML = `<p>${data.description || "No description available."}</p>`;
    document.getElementById("info").innerHTML = `
      <ul>
        <li>Language: ${data.language || "N/A"}</li>
        <li>Hardware: ${data.hardware || "N/A"}</li>
        <li>Cloud: ${data.cloud || "N/A"}</li>
        <li>Delivery: ${data.delivery || "N/A"}</li>
      </ul>`;

    if (data.imageUrl) {
      document.getElementById("project-image").src = data.imageUrl;
    }

    loadRelatedProjects(data.domain, slug);
  } catch (err) {
    console.error("Error loading project:", err);
    document.getElementById("project-title").textContent = "Error loading project.";
  }
}

// Load related projects
async function loadRelatedProjects(domain, currentSlug) {
  const container = document.getElementById("relatedProjects");
  container.innerHTML = "";
  const seen = new Set();

  const snap = await db.collection("projectDetails")
    .where("domain", "==", domain)
    .limit(20).get();

  snap.forEach(doc => {
    const d = doc.data();
    if (d.slug && d.slug !== currentSlug && !seen.has(d.slug)) {
      seen.add(d.slug);
      container.innerHTML += `
        <div class="related-card">
          <h4>${d.title}</h4>
          <a href="details.html#${d.slug}">View More</a>
        </div>`;
    }
  });

  if (seen.size === 0) {
    container.innerHTML = "<p>No related topics found.</p>";
  }
}

// Tab switch logic
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Navbar toggle
document.getElementById("nav-toggle").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("active");
});

// Load project on page load
document.addEventListener("DOMContentLoaded", () => {
  if (slug) loadProjectDetails(slug);
});

// ✅ Add to Cart Logic
document.querySelector('.add-to-cart').addEventListener('click', () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login to add this project to your cart.");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("project-title").textContent;
  const priceText = document.getElementById("project-price").textContent;
  const price = parseFloat(priceText.replace("₹", "")) || 0;
  const discount = document.getElementById("project-discount").textContent;
  const imageUrl = document.getElementById("project-image").src;

  const cartRef = db.collection("users").doc(user.uid).collection("cart").doc(slug);

  cartRef.set({
    title,
    price,
    discount,
    imageUrl,
    slug,
    quantity: 1,
    addedAt: new Date()
  }).then(() => {
    alert("Added to cart!");
    document.querySelector('.add-to-cart').textContent = "Added!";
    document.querySelector('.add-to-cart').disabled = true;
  }).catch(err => {
    console.error("Add to cart failed:", err);
    alert("Failed to add to cart.");
  });
});
// ✅ Add to Wishlist Logic
document.querySelector('.add-to-wishlist').addEventListener('click', () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login to add this project to your wishlist.");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("project-title").textContent;
  const priceText = document.getElementById("project-price").textContent;
  const price = parseFloat(priceText.replace("₹", "")) || 0;
  const discount = document.getElementById("project-discount").textContent;
  const imageUrl = document.getElementById("project-image").src;

  const wishlistRef = db.collection("users").doc(user.uid).collection("wishlist").doc(slug);

  wishlistRef.set({
    title,
    price,
    discount,
    imageUrl,
    slug,
    addedAt: new Date()
  }).then(() => {
    alert("Added to wishlist!");
    document.querySelector('.add-to-wishlist').textContent = "Wishlisted!";
    document.querySelector('.add-to-wishlist').disabled = true;
  }).catch(err => {
    console.error("Add to wishlist failed:", err);
    alert("Failed to add to wishlist.");
  });
});
