 const firebaseConfig = {
      apiKey: "AIzaSyAyNLRVP-y_QQd5IGH-QaKTCMiruF-dA6E",
      authDomain: "ic-project-6989d.firebaseapp.com",
      projectId: "ic-project-6989d",
      storageBucket: "ic-project-6989d.appspot.com",
      messagingSenderId: "90473196739",
      appId: "1:90473196739:web:db4e82108c0355a2fb0676"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const slug = location.hash.replace("#", "");

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

    document.addEventListener("DOMContentLoaded", () => {
      if (slug) loadProjectDetails(slug);
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });

    document.getElementById("nav-toggle").addEventListener("click", () => {
      document.getElementById("nav-links").classList.toggle("active");
    });