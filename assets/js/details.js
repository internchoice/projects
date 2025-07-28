// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
  authDomain: "ic-project-6989d.firebaseapp.com",
  projectId: "ic-project-6989d",
  storageBucket: "ic-project-6989d.appspot.com",
  messagingSenderId: "90473196739",
  appId: "1:90473196739:web:db4e82108c0355a2fb0676"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

function getSlugFromHash() {
  return location.hash.replace("#", "").trim();
}

// Load project details
async function loadProjectDetails(slug) {
  if (!slug) return;

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

    // Fill UI
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

    // Set up cart/wishlist buttons
    setupButtons(data.slug);

    // Load related
    loadRelatedProjects(data.domain, data.slug);
  } catch (err) {
    console.error("Error loading project:", err);
    document.getElementById("project-title").textContent = "Error loading project.";
  }
}

// Load related projects
async function loadRelatedProjects(domain, currentSlug) {
  const container = document.getElementById("relatedProjects");
  container.innerHTML = "";

  try {
    const snap = await db.collection("projectDetails")
      .where("domain", "==", domain)
      .limit(20)
      .get();

    const seen = new Set();

    snap.forEach(doc => {
      const d = doc.data();
      if (d.slug && d.slug !== currentSlug && !seen.has(d.slug)) {
        seen.add(d.slug);
        const card = document.createElement("div");
        card.className = "related-card";
        card.innerHTML = `
          <h4>${d.title}</h4>
          <a href="#${d.slug}" class="view-more">View More</a>
        `;
        container.appendChild(card);
      }
    });

    if (seen.size === 0) {
      container.innerHTML = "<p>No related topics found.</p>";
    }
  } catch (error) {
    console.error("Error loading related projects:", error);
    container.innerHTML = "<p>Error loading related topics.</p>";
  }
}

// Setup buttons (for cart & wishlist)
function setupButtons(slug) {
  const cartBtn = document.querySelector('.add-to-cart');
  const wishlistBtn = document.querySelector('.add-to-wishlist');

  cartBtn.disabled = false;
  wishlistBtn.disabled = false;
  cartBtn.textContent = "Add to Cart";
  wishlistBtn.textContent = "Add to Wishlist";

  cartBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to add this project to your cart.");
      window.location.href = "login.html";
      return;
    }

    const title = document.getElementById("project-title").textContent;
    const price = parseFloat(document.getElementById("project-price").textContent.replace("₹", "")) || 0;
    const discount = document.getElementById("project-discount").textContent;
    const imageUrl = document.getElementById("project-image").src;

    try {
      await db.collection("users").doc(user.uid).collection("cart").doc(slug).set({
        title, price, discount, imageUrl, slug,
        quantity: 1,
        addedAt: new Date()
      });
      alert("Added to cart!");
      cartBtn.textContent = "Added!";
      cartBtn.disabled = true;
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart.");
    }
  };

  wishlistBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to add this project to your wishlist.");
      window.location.href = "login.html";
      return;
    }

    const title = document.getElementById("project-title").textContent;
    const price = parseFloat(document.getElementById("project-price").textContent.replace("₹", "")) || 0;
    const discount = document.getElementById("project-discount").textContent;
    const imageUrl = document.getElementById("project-image").src;

    try {
      await db.collection("users").doc(user.uid).collection("wishlist").doc(slug).set({
        title, price, discount, imageUrl, slug,
        addedAt: new Date()
      });
      alert("Added to wishlist!");
      wishlistBtn.textContent = "Wishlisted!";
      wishlistBtn.disabled = true;
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      alert("Failed to add to wishlist.");
    }
  };
}

// Handle tab switching
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

// Load project on initial load
document.addEventListener("DOMContentLoaded", () => {
  const slug = getSlugFromHash();
  if (slug) loadProjectDetails(slug);
});

// Listen to hash changes for dynamic navigation
window.addEventListener("hashchange", () => {
  const newSlug = getSlugFromHash();
  if (newSlug) loadProjectDetails(newSlug);
});
