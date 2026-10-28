/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  GHANA_TOWNS,
  CURATED_FACILITIES,
  GHANA_HOTLINES,
  FIRST_AID_GUIDES,
  HEALTH_UPDATES,
  calculateDistanceKm,
  Facility,
} from "./src/server/ghanaData.ts";
import { generateERASChatResponse, detectEmergencyKeywords } from "./src/server/gemini.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory LRU-like TTL cache for facility queries (10 min TTL)
interface CacheEntry {
  timestamp: number;
  data: {
    center: { lat: number; lon: number; label: string };
    facilities: Facility[];
    source: string;
  };
}
const facilityCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key: string) {
  const entry = facilityCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    facilityCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: CacheEntry["data"]) {
  if (facilityCache.size > 200) {
    const oldestKey = facilityCache.keys().next().value;
    if (oldestKey) facilityCache.delete(oldestKey);
  }
  facilityCache.set(key, { timestamp: Date.now(), data });
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "ERAS Ghana",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    cachedSearches: facilityCache.size,
    curatedFacilitiesCount: CURATED_FACILITIES.length,
    hotlinesCount: GHANA_HOTLINES.length,
  });
});

// -------------------------------------------------------------
// Facilities Search Endpoint (Nominatim + Overpass + Curated Fallback)
// -------------------------------------------------------------
app.get("/api/facilities", async (req: Request, res: Response) => {
  const locationParam = (req.query.location as string || "").trim();
  const facilityType = ((req.query.type as string) || "all").toLowerCase().trim();

  if (!locationParam) {
    res.status(400).json({ error: "Please enter a location or coordinates to search." });
    return;
  }

  const validTypes = new Set(["all", "hospital", "clinic", "pharmacy", "emergency"]);
  if (!validTypes.has(facilityType)) {
    res.status(400).json({ error: "Invalid facility category selected." });
    return;
  }

  const cacheKey = `${locationParam.toLowerCase()}_${facilityType}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.json({ ...cached, cached: true });
    return;
  }

  let center: { lat: number; lon: number; label: string } | null = null;

  // 1. Check if user provided direct coordinates (e.g., "5.6037, -0.1870")
  const coordParts = locationParam.split(",");
  if (coordParts.length === 2) {
    const lat = parseFloat(coordParts[0].trim());
    const lon = parseFloat(coordParts[1].trim());
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      center = { lat, lon, label: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
    }
  }

  // 2. Check known Ghanaian towns index (0ms geocoding, ultra fast)
  if (!center) {
    const cleanTownKey = locationParam.toLowerCase().replace(/[^a-z ]/g, "").trim();
    if (GHANA_TOWNS[cleanTownKey]) {
      const town = GHANA_TOWNS[cleanTownKey];
      center = { lat: town.lat, lon: town.lon, label: `${town.name}, ${town.region} Region` };
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim with User-Agent & timeout
  if (!center) {
    try {
      const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
      nominatimUrl.searchParams.set("q", `${locationParam}, Ghana`);
      nominatimUrl.searchParams.set("format", "jsonv2");
      nominatimUrl.searchParams.set("limit", "1");
      nominatimUrl.searchParams.set("countrycodes", "gh");

      const geoRes = await fetch(nominatimUrl.toString(), {
        headers: {
          "User-Agent": "ERAS-Healthcare-Ghana-System/2.0 (contact: info@eras.gh)",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (geoRes.ok) {
        const geoData = (await geoRes.json()) as Array<{ lat: string; lon: string; display_name: string }>;
        if (geoData && geoData.length > 0) {
          center = {
            lat: parseFloat(geoData[0].lat),
            lon: parseFloat(geoData[0].lon),
            label: geoData[0].display_name.split(",").slice(0, 3).join(","),
          };
        }
      }
    } catch {
      // Nominatim timed out or failed; will fallback to default Ghana center or Accra
    }
  }

  // If still not resolved, default to central Accra to prevent user failure
  if (!center) {
    center = {
      lat: 5.6037,
      lon: -0.1870,
      label: `${locationParam} (Approx. Ghana Regional Hub)`,
    };
  }

  // Query facilities from Overpass API (Live OSM) with curated dataset integration
  const aggregatedFacilities: Facility[] = [];
  const seenKeys = new Set<string>();

  // Add curated institutions that fall within proximity or match query
  for (const fac of CURATED_FACILITIES) {
    // Type filtering
    if (facilityType === "hospital" && fac.category !== "Hospital") continue;
    if (facilityType === "clinic" && fac.category !== "Clinic") continue;
    if (facilityType === "pharmacy" && fac.category !== "Pharmacy") continue;
    if (facilityType === "emergency" && !fac.emergency24_7) continue;

    const dist = calculateDistanceKm(center.lat, center.lon, fac.lat, fac.lon);
    // Include all curated facilities within 65km, or closest ones
    if (dist <= 65) {
      aggregatedFacilities.push({
        ...fac,
        distanceKm: dist,
      });
      seenKeys.add(`${fac.lat.toFixed(3)}_${fac.lon.toFixed(3)}`);
      seenKeys.add(fac.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
    }
  }

  // Attempt Overpass live query with 8s timeout
  try {
    const filters: Record<string, string> = {
      hospital: '["amenity"="hospital"]',
      clinic: '["amenity"~"clinic|doctors"]',
      pharmacy: '["amenity"="pharmacy"]',
      emergency: '["emergency"="yes"]',
      all: '["amenity"~"hospital|clinic|doctors|pharmacy"]',
    };
    const tagFilter = filters[facilityType] || filters.all;

    const overpassQuery = `
      [out:json][timeout:10];
      (
        node${tagFilter}(around:18000,${center.lat},${center.lon});
        way${tagFilter}(around:18000,${center.lat},${center.lon});
      );
      out center tags 40;
    `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ERAS-Healthcare-Ghana-System/2.0",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(8000),
    });

    if (overpassRes.ok) {
      const overpassJson = (await overpassRes.json()) as {
        elements: Array<{
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }>;
      };

      for (const item of overpassJson.elements || []) {
        const tags = item.tags || {};
        const name = tags.name || tags["operator"] || "";
        if (!name) continue;

        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;
        if (lat === undefined || lon === undefined) continue;

        const coordKey = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
        const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (seenKeys.has(coordKey) || seenKeys.has(nameKey)) continue;
        seenKeys.add(coordKey);
        seenKeys.add(nameKey);

        const amenity = tags.amenity || "healthcare";
        let category: Facility["category"] = "Hospital";
        if (amenity === "pharmacy") category = "Pharmacy";
        else if (amenity === "clinic" || amenity === "doctors") category = "Clinic";

        const addressParts = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:suburb"],
          tags["addr:city"] || tags["addr:town"],
        ].filter(Boolean);

        const address = addressParts.length > 0 ? addressParts.join(", ") : (tags["addr:full"] || "Ghana Healthcare Directory");
        const dist = calculateDistanceKm(center.lat, center.lon, lat, lon);

        aggregatedFacilities.push({
          id: `osm-${item.id}`,
          name,
          category,
          address,
          city: tags["addr:city"] || tags["addr:town"] || "Ghana",
          region: tags["addr:state"] || "Ghana",
          lat,
          lon,
          phone: tags.phone || tags["contact:phone"] || undefined,
          emergency24_7: tags["emergency"] === "yes" || tags["opening_hours"] === "24/7",
          nhisAccredited: true, // Most public clinics & pharmacies accept NHIS
          services: tags.operator ? [`Operator: ${tags.operator}`] : undefined,
          distanceKm: dist,
        });
      }
    }
  } catch {
    // Overpass failed or timed out. Our curated dataset already handles this gracefully!
  }

  // Sort by closest distance first
  aggregatedFacilities.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

  // If no nearby facilities in 65km radius, attach top Ghanaian emergency referral centres
  if (aggregatedFacilities.length === 0) {
    for (const fac of CURATED_FACILITIES.slice(0, 10)) {
      const dist = calculateDistanceKm(center.lat, center.lon, fac.lat, fac.lon);
      aggregatedFacilities.push({ ...fac, distanceKm: dist });
    }
    aggregatedFacilities.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }

  const responsePayload = {
    center,
    totalFound: aggregatedFacilities.length,
    facilities: aggregatedFacilities.slice(0, 60),
    source: "ERAS Multi-Tiered Geodata Engine (Curated + OpenStreetMap)",
  };

  setCache(cacheKey, responsePayload);
  res.json(responsePayload);
});

// -------------------------------------------------------------
// AI Chat & Emergency Triage Endpoint (Gemini 3.8 Flash)
// -------------------------------------------------------------
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, history } = req.body as {
    message?: string;
    history?: Array<{ role: "user" | "model"; text: string }>;
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Please provide a valid question or message." });
    return;
  }

  try {
    const result = await generateERASChatResponse(message.trim(), history || []);
    res.json(result);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      reply: "We encountered a temporary technical glitch. If this is an emergency, please dial 112 in Ghana immediately.",
      isEmergency: detectEmergencyKeywords(message),
      source: "fallback",
    });
  }
});

// -------------------------------------------------------------
// Emergency Hotlines Directory Endpoint
// -------------------------------------------------------------
app.get("/api/emergency/hotlines", (req: Request, res: Response) => {
  const region = (req.query.region as string || "").trim().toLowerCase();
  const badge = (req.query.badge as string || "").trim().toLowerCase();

  let filtered = [...GHANA_HOTLINES];

  if (region) {
    filtered = filtered.filter(
      (h) => h.region.toLowerCase() === region || h.region.toLowerCase() === "national"
    );
  }

  if (badge) {
    filtered = filtered.filter((h) => h.badge.toLowerCase() === badge);
  }

  res.json({
    count: filtered.length,
    hotlines: filtered,
  });
});

// -------------------------------------------------------------
// Emergency Dispatch Preparation Assistant Endpoint
// -------------------------------------------------------------
app.post("/api/emergency/dispatch-prep", (req: Request, res: Response) => {
  const {
    location,
    landmark,
    patientCount,
    emergencyType,
    conscious,
    breathing,
    callerPhone,
    extraDetails,
  } = req.body as {
    location?: string;
    landmark?: string;
    patientCount?: number;
    emergencyType?: string;
    conscious?: boolean;
    breathing?: boolean;
    callerPhone?: string;
    extraDetails?: string;
  };

  if (!location || !emergencyType) {
    res.status(400).json({ error: "Location and emergency nature are required to prepare a dispatch script." });
    return;
  }

  const count = patientCount && patientCount > 0 ? patientCount : 1;
  const consciousStatus = conscious === false ? "UNCONSCIOUS" : "Conscious / responsive";
  const breathingStatus = breathing === false ? "NOT BREATHING NORMALLY" : "Breathing";

  // Formulate concise, professional 15-second dispatcher read-aloud script
  const script = `Hello Operator, this is an emergency!
- Nature of Emergency: ${emergencyType}
- Location: ${location} ${landmark ? `(Near landmark: ${landmark})` : ""}
- Number of Patients: ${count}
- Patient Status: ${consciousStatus}, ${breathingStatus}
${extraDetails ? `- Vital Notes: ${extraDetails}` : ""}
${callerPhone ? `- My Contact Number: ${callerPhone}` : ""}
Please dispatch an ambulance and response team immediately.`;

  const instructionsForCaller = [
    "Stay on the line until the dispatcher confirms the address and ends the call.",
    "Send a bystander or relative with a flashlight or bright cloth to the nearest main junction or landmark to flag down the ambulance.",
    "Keep patient still; do not give food or drink while waiting.",
    "If the patient is unconscious and not breathing, begin chest compressions immediately (100-120 BPM).",
  ];

  res.json({
    readAloudScript: script,
    emergencyNumber: "112",
    ambulanceNumber: "193",
    instructions: instructionsForCaller,
    summary: {
      location,
      landmark: landmark || "None specified",
      emergencyType,
      patientCount: count,
      urgentFlags: conscious === false || breathing === false,
    },
  });
});

// -------------------------------------------------------------
// First Aid Guides Endpoint
// -------------------------------------------------------------
app.get("/api/first-aid", (req: Request, res: Response) => {
  const category = (req.query.category as string || "").trim().toLowerCase();
  let guides = [...FIRST_AID_GUIDES];

  if (category) {
    guides = guides.filter((g) => g.category.toLowerCase().includes(category));
  }

  res.json({
    count: guides.length,
    guides,
  });
});

// -------------------------------------------------------------
// Official Health Updates Endpoint
// -------------------------------------------------------------
app.get("/api/updates", (_req: Request, res: Response) => {
  res.json({
    count: HEALTH_UPDATES.length,
    updates: HEALTH_UPDATES,
  });
});

// -------------------------------------------------------------
// Dev vs Production Server Setup (Vite middleware integration)
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    // Dynamic import vite for development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build assets in production
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ERAS] Backend active on http://0.0.0.0:${PORT} (${isProd ? "production" : "development"})`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start ERAS server:", err);
  process.exit(1);
});
