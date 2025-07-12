// Login & Signup
function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("status").innerText = data.success
        ? "Signup successful!"
        : data.message || "Signup failed.";
    })
    .catch((err) => {
      document.getElementById("status").innerText =
        "Error: Could not connect to server.";
      console.error(err);
    });
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("user", username);
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("status").innerText = "Login failed!";
      }
    })
    .catch((err) => {
      document.getElementById("status").innerText =
        "Error: Could not connect to server.";
      console.error(err);
    });
}

// Dashboard logic
const container = document.getElementById("animeContainer");
const watchlistEl = document.getElementById("watchlistItems");
const username = localStorage.getItem("user") || "guest";
const watchlist = new Set();

function syncToServer(title, action) {
  fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, anime: title, action }),
  }).catch((err) => console.warn("Server error:", err));
}

function updateUI(title, isAdding) {
  if (isAdding) {
    const li = document.createElement("li");
    li.textContent = title;
    watchlistEl.appendChild(li);
    alert(`${title} added to wishlist.`);
  } else {
    [...watchlistEl.children].forEach((li) => {
      if (li.textContent === title) watchlistEl.removeChild(li);
    });
    alert(`${title} removed from wishlist.`);
  }
}

function addOrRemoveFromWatchlist(title) {
  if (watchlist.has(title)) {
    watchlist.delete(title);
    updateUI(title, false);
    syncToServer(title, "remove");
  } else {
    watchlist.add(title);
    updateUI(title, true);
    syncToServer(title, "add");
  }
}

function loadWatchlistFromServer() {
  fetch(`/wishlist?username=${username}`)
    .then((res) => res.json())
    .then((data) => {
      watchlist.clear();
      watchlistEl.innerHTML = "";
      data.forEach((title) => {
        watchlist.add(title);
        const li = document.createElement("li");
        li.textContent = title;
        watchlistEl.appendChild(li);
      });
    })
    .catch((err) => console.error("Failed to load wishlist:", err));
}

// Load & search anime
async function loadAnime() {
  if (!container) return;

  const query =
    new URLSearchParams(window.location.search).get("q")?.toLowerCase() || "";
  container.innerHTML = "Loading anime...";
  loadWatchlistFromServer();

  let results = [];

  for (let page = 1; page <= 10; page++) {
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/top/anime?page=${page}`,
      );
      const data = await res.json();
      results = results.concat(data.data);
    } catch (err) {
      console.error(`Failed to fetch page ${page}`, err);
    }
  }

  if (query) {
    results = results.filter((anime) =>
      anime.title.toLowerCase().includes(query),
    );
  }

  container.innerHTML = "";
  if (results.length === 0) {
    container.innerHTML = "<p>No anime found.</p>";
    return;
  }

  results.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "anime-card";
    card.onclick = () => addOrRemoveFromWatchlist(anime.title);
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div>${anime.title}</div>
    `;
    container.appendChild(card);
  });
}

//extra
document.getElementById("searchBtn").addEventListener("click", () => {
  const q = document.getElementById("searchInput").value.trim();
  window.location.href = `dashboard.html?q=${encodeURIComponent(q)}`;
});

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const q = e.target.value.trim();
    window.location.href = `dashboard.html?q=${encodeURIComponent(q)}`;
  }
});

loadAnime();
