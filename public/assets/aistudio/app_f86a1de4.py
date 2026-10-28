
from flask import Flask, request, jsonify, render_template_string
import requests

app = Flask(__name__)

APP_NAME = "ERAS"
EMERGENCY_NUMBER = "112"

PAGE = r"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ERAS | Emergency Response and Assistance System</title>

<link rel="stylesheet"
 href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">

<style>
:root {
  --green: #087f5b;
  --dark: #12332b;
  --light: #f4faf7;
  --muted: #64756e;
  --border: #dce9e1;
  --white: #ffffff;
  --red: #c62828;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--light);
  color: var(--dark);
  font-family: Arial, Helvetica, sans-serif;
}

button, input, select { font: inherit; }

button, a { -webkit-tap-highlight-color: transparent; }

header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 14px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 23px;
  font-weight: 800;
  color: var(--green);
}

.brand-mark {
  background: var(--green);
  color: white;
  border-radius: 12px;
  padding: 10px;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

nav button {
  background: transparent;
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--dark);
  cursor: pointer;
}

nav button.active, nav button:hover {
  background: #e3f4eb;
  color: var(--green);
}

main {
  max-width: 1200px;
  margin: auto;
  padding: 30px 20px 60px;
}

.page { display: none; }
.page.active { display: block; }

.hero {
  background: linear-gradient(125deg, #0b4938, #087f5b);
  color: white;
  border-radius: 24px;
  padding: 50px 36px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 28px;
}

.hero h1 {
  font-size: clamp(32px, 5vw, 54px);
  margin: 12px 0;
  line-height: 1.1;
}

.hero p {
  color: #e0f4e9;
  line-height: 1.8;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

.hero-art {
  font-size: 100px;
  text-align: center;
}

.button {
  display: inline-block;
  padding: 12px 17px;
  background: var(--green);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 9px;
  font-weight: bold;
  cursor: pointer;
}

.button:hover { opacity: .9; }

.button.white {
  background: white;
  color: var(--green);
}

.button.red { background: var(--red); }

.button.secondary {
  background: white;
  color: var(--green);
  border: 1px solid var(--border);
}

.section-heading { margin: 34px 0 18px; }

.section-heading h2 { margin-bottom: 7px; }

.muted { color: var(--muted); line-height: 1.6; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 22px;
  min-width: 0;
}

.card h3 { margin-top: 8px; }

.card-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #e3f4eb;
  font-size: 24px;
}

.card p { line-height: 1.65; }

.notice {
  padding: 15px;
  background: #fff4e5;
  border: 1px solid #f3d5a8;
  border-radius: 10px;
  color: #704616;
  line-height: 1.6;
  margin: 20px 0;
}

.emergency-banner {
  margin-top: 22px;
  background: #fff0f0;
  border: 1px solid #f1caca;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.emergency-banner p { margin-bottom: 0; }

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

input, select {
  padding: 13px;
  border: 1px solid #cbdad1;
  border-radius: 9px;
  background: white;
  min-width: 0;
}

.search-form input { flex: 1; min-width: 180px; }

#map {
  height: 390px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--border);
  margin: 20px 0;
  z-index: 1;
}

.results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.result-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.result-card h3 { margin-top: 0; }

.result-card a { color: var(--green); }

.faq-item {
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin: 10px 0;
}

.faq-item summary {
  cursor: pointer;
  font-weight: bold;
}

.faq-item p { line-height: 1.7; }

.chat-box {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  max-width: 800px;
}

.chat-messages {
  height: 360px;
  overflow-y: auto;
  padding: 20px;
}

.message {
  max-width: 85%;
  padding: 12px 15px;
  border-radius: 13px;
  margin: 10px 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message.bot { background: #e9f5ee; }
.message.user {
  background: var(--green);
  color: white;
  margin-left: auto;
}

.chat-form {
  border-top: 1px solid var(--border);
  padding: 12px;
  display: flex;
  gap: 10px;
}

.chat-form input { flex: 1; }

footer {
  text-align: center;
  padding: 25px;
  background: white;
  border-top: 1px solid var(--border);
  color: var(--muted);
  line-height: 1.7;
}

.status {
  font-size: 14px;
  color: var(--muted);
  margin: 10px 0;
}

@media (max-width: 760px) {
  header { position: static; }
  .hero { grid-template-columns: 1fr; padding: 30px 22px; }
  .hero-art { font-size: 65px; }
  .grid { grid-template-columns: 1fr; }
  .results { grid-template-columns: 1fr; }
  main { padding: 20px 14px 40px; }
  nav button { padding: 9px 8px; }
  #map { height: 320px; }
}
</style>
</head>

<body>
<header>
  <div class="brand">
    <span class="brand-mark">✚</span>
    <span>ERAS</span>
  </div>
  <nav aria-label="Main navigation">
    <button class="active" data-page="home">Home</button>
    <button data-page="search">Search</button>
    <button data-page="chat">Chat with ERAS</button>
    <button data-page="tutorials">Tutorials</button>
    <button data-page="updates">Updates</button>
  </nav>
</header>

<main>
  <!-- HOME -->
  <section id="home" class="page active">
    <div class="hero">
      <div>
        <div class="eyebrow">Emergency Response and Assistance System</div>
        <h1>Help when you need it most.</h1>
        <p>
          Find nearby healthcare facilities, explore health-learning
          resources and access useful emergency information in Ghana.
        </p>
        <button class="button white" onclick="showPage('search')">
          Find healthcare near me →
        </button>
      </div>
      <div class="hero-art" aria-hidden="true">🏥</div>
    </div>

    <div class="emergency-banner">
      <div>
        <strong>Need emergency assistance?</strong>
        <p class="muted">
          If you are in Ghana and need emergency services, call 112.
        </p>
      </div>
      <a class="button red" href="tel:112">Call 112</a>
    </div>

    <div class="section-heading">
      <h2>What can ERAS help you do?</h2>
      <p class="muted">Access essential healthcare information in one place.</p>
    </div>

    <div class="grid">
      <article class="card">
        <div class="card-icon">📍</div>
        <h3>Find healthcare</h3>
        <p class="muted">Search for hospitals, clinics and pharmacies by location.</p>
        <button class="button" onclick="showPage('search')">Explore map</button>
      </article>
      <article class="card">
        <div class="card-icon">💬</div>
        <h3>Ask ERAS</h3>
        <p class="muted">Get basic health information and guidance on finding care.</p>
        <button class="button" onclick="showPage('chat')">Open chat</button>
      </article>
      <article class="card">
        <div class="card-icon">📚</div>
        <h3>Learn and stay informed</h3>
        <p class="muted">Explore educational resources and community updates.</p>
        <button class="button" onclick="showPage('tutorials')">Start learning</button>
      </article>
    </div>

    <div class="notice">
      <strong>Important:</strong> ERAS is an informational prototype.
      Map listings may be incomplete or outdated. Always confirm a
      facility's availability before travelling. Do not delay emergency
      care while using this website.
    </div>
  </section>

  <!-- SEARCH -->
  <section id="search" class="page">
    <h1>Find healthcare near you</h1>
    <p class="muted">
      Enter a Ghanaian town, city or area to explore mapped healthcare facilities.
    </p>

    <form class="search-form" id="searchForm">
      <input id="location" placeholder="e.g. Ashaiman, Accra, Cape Coast"
        aria-label="Location" required>
      <select id="facilityType" aria-label="Facility type">
        <option value="all">All facilities</option>
        <option value="hospital">Hospitals</option>
        <option value="clinic">Clinics and doctors</option>
        <option value="pharmacy">Pharmacies</option>
      </select>
      <button class="button" type="submit">Search</button>
      <button class="button secondary" type="button" id="locateBtn">
        Use my location
      </button>
    </form>

    <p id="searchStatus" class="status" role="status">
      Search for a location to load available map results.
    </p>

    <div id="map" aria-label="Map of healthcare facilities"></div>
    <div id="results" class="results"></div>

    <div class="section-heading">
      <h2>Frequently asked questions</h2>
    </div>

    <details class="faq-item">
      <summary>How do I find a nearby hospital?</summary>
      <p>Enter your town or area in the search field, or select
      "Use my location" and allow location access in your browser.</p>
    </details>
    <details class="faq-item">
      <summary>Are the facility listings guaranteed to be accurate?</summary>
      <p>No. ERAS uses public map data, which may be incomplete or outdated.
      Contact the facility directly to confirm its services and availability.</p>
    </details>
    <details class="faq-item">
      <summary>Does ERAS provide emergency medical treatment?</summary>
      <p>No. ERAS helps users locate information and resources. It is not
      a substitute for emergency services or a healthcare professional.</p>
    </details>
    <details class="faq-item">
      <summary>What if I am experiencing a medical emergency?</summary>
      <p>Call Ghana's emergency number 112 or seek immediate assistance
      from qualified emergency services. Do not wait for online search results.</p>
    </details>
  </section>

  <!-- CHAT -->
  <section id="chat" class="page">
    <h1>Chat with ERAS</h1>
    <p class="muted">
      Ask about finding healthcare facilities and accessing learning resources.
    </p>

    <div class="notice">
      ERAS Chat is a basic demonstration assistant, not a diagnostic tool.
      It cannot diagnose illness, prescribe medication or replace a clinician.
      For severe or life-threatening symptoms, call 112 in Ghana.
    </div>

    <div class="chat-box">
      <div id="chatMessages" class="chat-messages" aria-live="polite">
        <div class="message bot">
Hello! I'm ERAS. I can help you understand how to use this website,
find healthcare facilities, and access educational resources.

What would you like help with?
        </div>
      </div>
      <form id="chatForm" class="chat-form">
        <input id="chatInput" placeholder="Ask ERAS a question..."
          aria-label="Message to ERAS" required>
        <button class="button" type="submit">Send</button>
      </form>
    </div>
  </section>

  <!-- TUTORIALS -->
  <section id="tutorials" class="page">
    <h1>Health tutorials</h1>
    <p class="muted">
      Learn basic health and emergency-preparedness concepts.
    </p>

    <div class="grid">
      <article class="card">
        <div class="card-icon">🚑</div>
        <h3>Understanding emergency response</h3>
        <p class="muted">
          Learn when to seek urgent assistance, how to communicate your
          location and why it is important not to delay emergency care.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.who.int/health-topics/emergency-care">
          Read resource
        </a>
      </article>

      <article class="card">
        <div class="card-icon">❤️</div>
        <h3>First aid awareness</h3>
        <p class="muted">
          Explore trusted educational information about first aid and
          responding safely while waiting for trained help.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.redcross.org/take-a-class/first-aid">
          Learn first aid
        </a>
      </article>

      <article class="card">
        <div class="card-icon">🧼</div>
        <h3>Preventing infections</h3>
        <p class="muted">
          Learn about hand hygiene, prevention practices and protecting
          yourself and others in everyday settings.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.who.int/health-topics">
          Explore health topics
        </a>
      </article>
    </div>

    <div class="section-heading">
      <h2>Video learning</h2>
      <p class="muted">
        Open these trusted resources to explore available educational videos.
      </p>
    </div>

    <div class="grid">
      <article class="card">
        <h3>WHO health education</h3>
        <p class="muted">Explore public-health learning materials.</p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.youtube.com/@WHO">Watch resources ↗</a>
      </article>
      <article class="card">
        <h3>Red Cross learning</h3>
        <p class="muted">Explore first aid and emergency preparedness resources.</p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.youtube.com/@IFRC">Watch resources ↗</a>
      </article>
      <article class="card">
        <h3>Ghana health information</h3>
        <p class="muted">Visit Ghana Health Service for official information.</p>
        <a class="button" target="_blank" rel="noopener"
          href="https://ghs.gov.gh/">Visit GHS ↗</a>
      </article>
    </div>
  </section>

  <!-- UPDATES -->
  <section id="updates" class="page">
    <h1>Health updates and communities</h1>
    <p class="muted">
      Access official health information and discover community resources.
    </p>

    <div class="notice">
      These are links to information sources, not a live news feed.
      Check the publisher and publication date before relying on an update.
    </div>

    <div class="section-heading"><h2>Health news and official sources</h2></div>
    <div class="grid">
      <article class="card">
        <div class="card-icon">📰</div>
        <h3>Ghana Health Service</h3>
        <p class="muted">
          Visit the official website for public-health announcements and
          health-service information.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://ghs.gov.gh/">Visit website ↗</a>
      </article>
      <article class="card">
        <div class="card-icon">🌍</div>
        <h3>World Health Organization</h3>
        <p class="muted">
          Explore international health news, disease information and guidance.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.who.int/news">Read updates ↗</a>
      </article>
      <article class="card">
        <div class="card-icon">🏥</div>
        <h3>Ministry of Health, Ghana</h3>
        <p class="muted">
          Access national health policies, programmes and announcements.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://www.moh.gov.gh/">Visit website ↗</a>
      </article>
    </div>

    <div class="section-heading"><h2>Community resources</h2></div>
    <div class="grid">
      <article class="card">
        <h3>Find local healthcare</h3>
        <p class="muted">
          Look for healthcare facilities around your town and contact them
          directly to confirm services.
        </p>
        <button class="button" onclick="showPage('search')">Explore locations</button>
      </article>
      <article class="card">
        <h3>Share health information responsibly</h3>
        <p class="muted">
          Use credible sources, check dates, and avoid sharing unverified
          medical claims or another person's private medical information.
        </p>
      </article>
      <article class="card">
        <h3>Contribute to ERAS</h3>
        <p class="muted">
          Your team can extend this section with verified community events,
          moderated submissions and trusted local health organisations.
        </p>
        <a class="button" target="_blank" rel="noopener"
          href="https://github.com/">Explore GitHub</a>
      </article>
    </div>
  </section>
</main>

<footer>
  <strong>ERAS</strong> — Emergency Response and Assistance System<br>
  Built as a Hacktoberfest project to improve access to healthcare information.<br>
  <small>Prototype only. Not a substitute for emergency services or professional medical advice.</small>
</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const navButtons = document.querySelectorAll("nav button");

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  navButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  if (pageId === "search" && map) {
    setTimeout(() => map.invalidateSize(), 150);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

let map = null;
let markers = null;

function initializeMap() {
  if (typeof L === "undefined") {
    document.getElementById("searchStatus").textContent =
      "The map library could not load. Check your internet connection.";
    return;
  }

  if (map) return;

  map = L.map("map").setView([5.6037, -0.1870], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markers = L.layerGroup().addTo(map);
}

window.addEventListener("load", initializeMap);

async function searchFacilities(location, type) {
  const status = document.getElementById("searchStatus");
  const results = document.getElementById("results");

  status.textContent = "Searching public map data. Please wait...";
  results.innerHTML = "";
  initializeMap();

  try {
    const response = await fetch(
      "/api/facilities?location=" + encodeURIComponent(location) +
      "&type=" + encodeURIComponent(type)
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Search failed.");
    }

    if (data.center && map) {
      map.setView([data.center.lat, data.center.lon], 13);
    }

    if (markers) markers.clearLayers();

    if (!data.facilities.length) {
      status.textContent =
        "No matching facilities were returned. Try a nearby town or a different category.";
      return;
    }

    status.textContent =
      "Found " + data.facilities.length +
      " mapped result(s). Listings may be incomplete or outdated.";

    data.facilities.forEach(place => {
      const name = escapeHtml(place.name || "Unnamed facility");
      const category = escapeHtml(place.category || "Healthcare facility");
      const address = escapeHtml(place.address || "Address not available");
      const lat = Number(place.lat);
      const lon = Number(place.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      if (map && markers) {
        L.marker([lat, lon])
          .bindPopup("<strong>" + name + "</strong><br>" + category)
          .addTo(markers);
      }

      const directions =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(lat + "," + lon);

      const card = document.createElement("article");
      card.className = "result-card";
      card.innerHTML =
        "<h3>" + name + "</h3>" +
        "<p>" + category + "</p>" +
        "<p class='muted'>" + address + "</p>" +
        "<a target='_blank' rel='noopener' href='" +
        directions + "'>Get directions ↗</a>";

      results.appendChild(card);
    });

  } catch (error) {
    status.textContent =
      "Could not complete the search. " + error.message +
      " Check your internet connection and try again.";
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();

  const location = document.getElementById("location").value.trim();
  const type = document.getElementById("facilityType").value;

  if (location) searchFacilities(location, type);
});

document.getElementById("locateBtn").addEventListener("click", () => {
  const status = document.getElementById("searchStatus");

  if (!navigator.geolocation) {
    status.textContent = "Your browser does not support location access.";
    return;
  }

  status.textContent = "Requesting your location...";

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      document.getElementById("location").value =
        latitude.toFixed(5) + ", " + longitude.toFixed(5);

      searchFacilities(
        latitude + ", " + longitude,
        document.getElementById("facilityType").value
      );
    },
    () => {
      status.textContent =
        "Location access was unavailable. Enter your town or city instead.";
    },
    { timeout: 10000 }
  );
});

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

function addMessage(text, who) {
  const message = document.createElement("div");
  message.className = "message " + who;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  chatInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    addMessage(data.reply || "Please try asking in a different way.", "bot");
  } catch {
    addMessage(
      "I could not connect right now. Please try again. For an emergency, call 112 in Ghana.",
      "bot"
    );
  }
});
</script>
</body>
</html>
"""


@app.route("/")
def home():
    return render_template_string(PAGE)


@app.route("/api/facilities")
def facilities():
    location = request.args.get("location", "").strip()
    facility_type = request.args.get("type", "all").strip().lower()

    if not location:
        return jsonify({"error": "Enter a location to search."}), 400

    if facility_type not in {"all", "hospital", "clinic", "pharmacy"}:
        return jsonify({"error": "Invalid facility category."}), 400

    headers = {
        "User-Agent": "ERAS-Hackathon-Prototype/1.0 (healthcare location search)"
    }

    try:
        # Support either a town/city name or GPS coordinates.
        parts = location.split(",")

        if len(parts) == 2:
            try:
                lat = float(parts[0].strip())
                lon = float(parts[1].strip())

                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    raise ValueError("Coordinates out of range")

                center = {"lat": lat, "lon": lon}

            except ValueError:
                center = None
        else:
            center = None

        if center is None:
            geocode_response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": location + ", Ghana",
                    "format": "jsonv2",
                    "limit": 1,
                    "countrycodes": "gh"
                },
                headers=headers,
                timeout=15
            )
            geocode_response.raise_for_status()
            geocode_data = geocode_response.json()

            if not geocode_data:
                return jsonify({
                    "error": "Location not found. Try a Ghanaian town or city."
                }), 404

            center = {
                "lat": float(geocode_data[0]["lat"]),
                "lon": float(geocode_data[0]["lon"])
            }

        # Search public OpenStreetMap data within approximately 10 km.
        filters = {
            "hospital": '["amenity"="hospital"]',
            "clinic": '["amenity"~"clinic|doctors"]',
            "pharmacy": '["amenity"="pharmacy"]',
            "all": '["amenity"~"hospital|clinic|doctors|pharmacy"]'
        }

        tag_filter = filters[facility_type]

        query = f"""
        [out:json][timeout:20];
        (
          node{tag_filter}(around:10000,{center["lat"]},{center["lon"]});
          way{tag_filter}(around:10000,{center["lat"]},{center["lon"]});
          relation{tag_filter}(around:10000,{center["lat"]},{center["lon"]});
        );
        out center tags;
        """

        overpass_response = requests.post(
            "https://overpass-api.de/api/interpreter",
            data={"data": query},
            headers=headers,
            timeout=30
        )
        overpass_response.raise_for_status()
        raw_data = overpass_response.json()

        found = []
        seen = set()

        for item in raw_data.get("elements", []):
            tags = item.get("tags", {})
            name = tags.get("name", "").strip()

            if not name:
                continue

            lat = item.get("lat")
            lon = item.get("lon")

            if lat is None or lon is None:
                center_point = item.get("center", {})
                lat = center_point.get("lat")
                lon = center_point.get("lon")

            if lat is None or lon is None:
                continue

            identifier = (round(float(lat), 5), round(float(lon), 5))
            if identifier in seen:
                continue
            seen.add(identifier)

            amenity = tags.get("amenity", "healthcare")
            address_parts = [
                tags.get("addr:housenumber", ""),
                tags.get("addr:street", ""),
                tags.get("addr:suburb", ""),
                tags.get("addr:city", ""),
            ]
            address = ", ".join(part for part in address_parts if part)
            if not address:
                address = tags.get("addr:full", "Address not listed")

            found.append({
                "name": name,
                "category": amenity.replace("_", " ").title(),
                "address": address,
                "lat": float(lat),
                "lon": float(lon)
            })

        found.sort(
            key=lambda item: (
                (item["lat"] - center["lat"]) ** 2
                + (item["lon"] - center["lon"]) ** 2
            )
        )

        return jsonify({
            "center": center,
            "facilities": found[:50]
        })

    except requests.RequestException:
        return jsonify({
            "error": (
                "A public map service is temporarily unavailable. "
                "Please try again shortly."
            )
        }), 502
    except (ValueError, KeyError):
        return jsonify({
            "error": "The location data could not be processed. Please try again."
        }), 502


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip().lower()

    if not message:
        return jsonify({"reply": "Please type a question first."}), 400

    emergency_terms = [
        "can't breathe", "cannot breathe", "not breathing",
        "unconscious", "severe bleeding", "heart attack",
        "stroke", "overdose", "seizure", "chest pain"
    ]

    if any(term in message for term in emergency_terms):
        reply = (
            "This may be a medical emergency. Call 112 in Ghana or seek "
            "immediate help from qualified emergency services. Do not wait "
            "for an online response. Follow the emergency dispatcher's "
            "instructions. I cannot diagnose or assess your condition."
        )

    elif any(word in message for word in ["hospital", "clinic", "pharmacy", "doctor", "near me"]):
        reply = (
            "I can help you look for mapped healthcare facilities. Open the "
            "Search section, enter your town or city in Ghana, and select "
            "the facility category. Public map data may be incomplete, so "
            "contact a facility to confirm its services and availability."
        )

    elif any(word in message for word in ["tutorial", "learn", "first aid", "video"]):
        reply = (
            "Open Tutorials to explore first-aid awareness, emergency "
            "preparedness and links to health-learning resources from "
            "organisations such as WHO and the Red Cross."
        )

    elif any(word in message for word in ["news", "update", "community"]):
        reply = (
            "Open Updates for links to Ghana Health Service, the Ministry "
            "of Health and WHO. Check the source and date of any health "
            "announcement before relying on it."
        )

    elif any(word in message for word in ["hello", "hi", "hey"]):
        reply = (
            "Hello! I'm ERAS, your healthcare-information assistant. "
            "You can ask how to find facilities, use the tutorials, "
            "or access health-information resources."
        )

    elif any(word in message for word in ["medicine", "medication", "prescribe", "diagnose", "symptom"]):
        reply = (
            "I cannot diagnose illnesses or recommend a personal medication "
            "or dosage. Please speak with a qualified healthcare professional. "
            "If symptoms are severe or life-threatening, call 112 in Ghana."
        )

    else:
        reply = (
            "I can help you navigate ERAS, find healthcare facilities, "
            "and locate educational resources. I am a basic demonstration "
            "assistant and cannot provide medical diagnosis or treatment. "
            "What would you like to find: a facility, a tutorial, or a health resource?"
        )

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
