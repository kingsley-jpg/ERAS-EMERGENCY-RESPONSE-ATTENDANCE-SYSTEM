/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Search,
  MapPin,
  Bot,
  HeartPulse,
  BookOpen,
  Radio,
  Send,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
  Info,
  Clock,
  Compass,
  Volume2,
  RotateCcw,
  Hospital,
  Building2,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { Facility, EmergencyContact, FirstAidGuide, HealthUpdate, ChatMessage, PageTab } from "./types";
import { MapComponent } from "./components/MapComponent";
import { CprMetronome } from "./components/CprMetronome";
import { DispatchCardModal } from "./components/DispatchCardModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>("home");
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Search State
  const [searchLocation, setSearchLocation] = useState("Accra");
  const [facilityType, setFacilityType] = useState<"all" | "hospital" | "clinic" | "pharmacy" | "emergency">("all");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number; label: string }>({
    lat: 5.6037,
    lon: -0.1870,
    label: "Accra, Greater Accra",
  });
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchStatusText, setSearchStatusText] = useState("Search a Ghanaian town or use your current location.");
  const [searchSource, setSearchSource] = useState("");

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "Hello! I am **ERAS**, your emergency response & healthcare navigation assistant for Ghana.\n\nI can help you:\n- 🏥 Find nearby accredited hospitals, clinics, and 24/7 pharmacies\n- 🚨 Triage symptoms and know when to call 112\n- 🩹 Provide step-by-step verified first aid protocols\n- 🚑 Guide you through calling Ghana Emergency Services (112 / 193)\n\n*If you are facing an immediate life-threatening emergency, please dial 112 right now.*",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "gemini",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // First Aid State
  const [firstAidGuides, setFirstAidGuides] = useState<FirstAidGuide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string>("cpr-adult");

  // Hotlines State
  const [hotlines, setHotlines] = useState<EmergencyContact[]>([]);
  const [hotlineRegionFilter, setHotlineRegionFilter] = useState<string>("all");

  // Health Updates State
  const [updates, setUpdates] = useState<HealthUpdate[]>([]);

  // Backend Health Status
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    geminiConfigured: boolean;
    uptimeSeconds: number;
  } | null>(null);

  // Load initial backend health, hotlines, guides & updates
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null));

    fetch("/api/first-aid")
      .then((r) => r.json())
      .then((data) => {
        if (data.guides) setFirstAidGuides(data.guides);
      })
      .catch(console.error);

    fetch("/api/emergency/hotlines")
      .then((r) => r.json())
      .then((data) => {
        if (data.hotlines) setHotlines(data.hotlines);
      })
      .catch(console.error);

    fetch("/api/updates")
      .then((r) => r.json())
      .then((data) => {
        if (data.updates) setUpdates(data.updates);
      })
      .catch(console.error);

    // Initial search for Accra
    performSearch("Accra", "all");
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Perform facility search via backend API
  const performSearch = async (loc: string, type: string) => {
    if (!loc.trim()) return;
    setSearchLoading(true);
    setSearchStatusText("Querying Ghana healthcare database & OpenStreetMap...");

    try {
      const url = `/api/facilities?location=${encodeURIComponent(loc.trim())}&type=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to locate facilities.");
      }

      if (data.center) {
        setMapCenter(data.center);
      }

      const results = (data.facilities || []) as Facility[];
      setFacilities(results);
      setSearchSource(data.source || "");

      if (results.length === 0) {
        setSearchStatusText(`No facilities returned around "${loc}". Try an adjacent town or select "All facilities".`);
      } else {
        setSearchStatusText(`Found ${results.length} mapped healthcare institution(s) near ${data.center?.label || loc}.`);
        setSelectedFacility(results[0]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error contacting map backend";
      setSearchStatusText(`Search error: ${message}. Check connection and retry.`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchLocation, facilityType);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchStatusText("Your browser does not support Geolocation.");
      return;
    }

    setSearchLoading(true);
    setSearchStatusText("Acquiring GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setSearchLocation(coords);
        performSearch(coords, facilityType);
      },
      (err) => {
        setSearchLoading(false);
        setSearchStatusText(`Location permission denied or unavailable (${err.message}). Enter town name.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Chat submit
  const handleChatSubmit = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput;
    if (!query.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        text: data.reply || "I am unable to answer right now. In an emergency, dial 112 in Ghana.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: data.isEmergency,
        source: data.source,
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `m-err-${Date.now()}`,
          role: "model",
          text: "I experienced a temporary communication hiccup. If this is a medical crisis, please call **112 (Ghana Emergency Services)** or **193 (National Ambulance)** immediately.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEmergency: true,
          source: "fallback",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSpeakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Filtered hotlines
  const displayedHotlines = hotlines.filter((h) => {
    if (hotlineRegionFilter === "all") return true;
    if (hotlineRegionFilter === "national") return h.region.toLowerCase() === "national";
    return h.region.toLowerCase().includes(hotlineRegionFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f4faf7] text-[#12332b] flex flex-col font-sans">
      {/* -------------------------------------------------------- */}
      {/* 1. TOP EMERGENCY DIRECT ACTION BAR                        */}
      {/* -------------------------------------------------------- */}
      <div className="bg-red-700 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span>GHANA EMERGENCY HOTLINES:</span>
          <span className="bg-red-900/60 px-2 py-0.5 rounded text-white text-xs font-mono">112 (TOLL-FREE)</span>
          <span className="hidden md:inline text-red-200">| Ambulance: 193 | Fire: 192 | Police: 191</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setDispatchModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            112 Dispatch Script Prep
          </button>
          <a
            href="tel:112"
            className="bg-white text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 fill-red-700" />
            Dial 112
          </a>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 2. STICKY MAIN NAVIGATION HEADER                         */}
      {/* -------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dce9e1] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="w-10 h-10 rounded-xl bg-[#087f5b] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#087f5b]/20">
            ✚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-[#087f5b]">ERAS</span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-[#087f5b] rounded-full uppercase tracking-wider">
                Ghana Health Network
              </span>
            </div>
            <p className="text-[11px] text-[#64756e] font-medium leading-none hidden sm:block">
              Emergency Response & Healthcare Locator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 text-xs sm:text-sm font-semibold text-gray-700">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === "home"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "search"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Facility Search
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Triage
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
          <button
            onClick={() => setActiveTab("firstaid")}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "firstaid"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            First Aid & CPR
          </button>
          <button
            onClick={() => setActiveTab("hotlines")}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "hotlines"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Radio className="w-4 h-4" />
            Hotlines
          </button>
          <button
            onClick={() => setActiveTab("updates")}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "updates"
                ? "bg-[#e3f4eb] text-[#087f5b] font-bold"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Updates
          </button>
        </nav>
      </header>

      {/* -------------------------------------------------------- */}
      {/* 3. MAIN CONTENT CONTAINER                                */}
      {/* -------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ====================================================== */}
        {/* TAB 1: HOME OVERVIEW                                   */}
        {/* ====================================================== */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0b4938] via-[#087f5b] to-[#046246] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-4 text-emerald-100 border border-white/20">
                  <Shield className="w-3.5 h-3.5" />
                  National Healthcare & Emergency Response System
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                  Help when you need it most.
                </h1>
                <p className="text-emerald-50 text-base sm:text-lg mb-8 leading-relaxed">
                  Instant location of accredited Ghanaian hospitals, clinics, and 24/7 pharmacies.
                  Equipped with an AI medical triage navigator, verified first aid protocols, and
                  streamlined Ghana 112 emergency dispatch assistance.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("search")}
                    className="px-6 py-3.5 rounded-xl bg-white text-[#087f5b] hover:bg-emerald-50 font-bold text-sm sm:text-base shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Find Nearby Facilities →
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="px-6 py-3.5 rounded-xl bg-[#044c37] hover:bg-[#033c2b] text-white border border-emerald-400/30 font-bold text-sm sm:text-base transition active:scale-95 flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI Triage Navigator
                  </button>
                  <button
                    onClick={() => setDispatchModalOpen(true)}
                    className="px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    112 Call Script
                  </button>
                </div>
              </div>

              {/* Decorative element */}
              <div className="hidden lg:flex absolute right-12 bottom-6 top-6 items-center justify-center opacity-90 select-none pointer-events-none">
                <div className="text-[130px] filter drop-shadow-2xl animate-pulse">
                  🏥
                </div>
              </div>
            </div>

            {/* Emergency Action Banner */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md">
                  <Phone className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Experiencing a medical emergency?</h3>
                  <p className="text-xs sm:text-sm text-red-900/80">
                    If you are anywhere in Ghana and need urgent ambulance, police, or fire response, dial 112 immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:112"
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  Call 112
                </a>
                <a
                  href="tel:193"
                  className="px-5 py-3 rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-100 font-bold text-sm transition"
                >
                  NAS Ambulance 193
                </a>
              </div>
            </div>

            {/* Quick Interactive Features Grid */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-black text-gray-900">What ERAS can do for you</h2>
                <p className="text-sm text-[#64756e]">
                  Built for rapid public health access, community safety, and emergency guidance across Ghana.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                  onClick={() => setActiveTab("search")}
                  className="bg-white border border-[#dce9e1] rounded-2xl p-6 hover:shadow-md hover:border-[#087f5b]/40 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#e3f4eb] text-[#087f5b] flex items-center justify-center text-2xl mb-4">
                      📍
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Find Healthcare Facilities</h3>
                    <p className="text-xs sm:text-sm text-[#64756e] leading-relaxed mb-4">
                      Locate Teaching Hospitals (Korle Bu, KATH, CCTH, TTH, Ridge), district polyclinics, and 24/7 pharmacies with NHIS accreditation status.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#087f5b] flex items-center gap-1">
                    Open Facility Map <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("chat")}
                  className="bg-white border border-[#dce9e1] rounded-2xl p-6 hover:shadow-md hover:border-[#087f5b]/40 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#e3f4eb] text-[#087f5b] flex items-center justify-center text-2xl mb-4">
                      💬
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">AI Medical Triage Assistant</h3>
                    <p className="text-xs sm:text-sm text-[#64756e] leading-relaxed mb-4">
                      Powered by Gemini 3.8 Flash. Rapidly assess symptoms, identify emergency warning signs, and receive calm step-by-step guidance.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#087f5b] flex items-center gap-1">
                    Start ERAS Consultation <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("firstaid")}
                  className="bg-white border border-[#dce9e1] rounded-2xl p-6 hover:shadow-md hover:border-[#087f5b]/40 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#e3f4eb] text-[#087f5b] flex items-center justify-center text-2xl mb-4">
                      🩹
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">First Aid & CPR Beat</h3>
                    <p className="text-xs sm:text-sm text-[#64756e] leading-relaxed mb-4">
                      Interactive CPR audio metronome (110 BPM), West African snake bite management, severe bleeding control, and choking relief.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#087f5b] flex items-center gap-1">
                    View Emergency Protocols <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Ghana Health Statistics / Trust Banner */}
            <div className="bg-white rounded-2xl border border-[#dce9e1] p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-[#087f5b]">112</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">National Toll-Free Emergency</div>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">16</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">Ghana Administrative Regions</div>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">26+</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">Tertiary & Regional Hospitals</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#087f5b]">24/7</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">Ambulance & Poison Support</div>
              </div>
            </div>

            {/* Disclaimer notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Important Notice:</strong> ERAS is an emergency triage navigation and assistance tool.
                It is designed to accelerate finding care and organizing distress calls. It is not a replacement
                for medical doctors or licensed emergency dispatch. Do not delay emergency hospital transport while browsing.
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 2: FACILITY SEARCH & INTERACTIVE MAP               */}
        {/* ====================================================== */}
        {activeTab === "search" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Healthcare Facility Locator
              </h1>
              <p className="text-xs sm:text-sm text-[#64756e]">
                Explore accredited hospitals, emergency trauma centres, clinics, and pharmacies across Ghana.
              </p>
            </div>

            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dce9e1] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter Ghanaian town (e.g. Accra, Kumasi, Ashaiman, Cape Coast, Tamale, Takoradi)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#087f5b]"
                  />
                </div>

                <select
                  value={facilityType}
                  onChange={(e) => {
                    const newType = e.target.value as "all" | "hospital" | "clinic" | "pharmacy" | "emergency";
                    setFacilityType(newType);
                    performSearch(searchLocation, newType);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#087f5b]"
                >
                  <option value="all">All Healthcare Facilities</option>
                  <option value="hospital">Hospitals & Medical Centres</option>
                  <option value="clinic">Clinics & Doctors</option>
                  <option value="pharmacy">Pharmacies</option>
                  <option value="emergency">24/7 Emergency Ready Only</option>
                </select>

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#087f5b] hover:bg-[#066749] text-white font-bold text-sm shadow transition disabled:opacity-50"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={searchLoading}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#dce9e1] text-[#087f5b] hover:bg-emerald-50 font-bold text-sm transition flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" />
                  Use my location
                </button>
              </div>

              {/* Quick suggestion tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Popular hubs:</span>
                {["Accra", "Kumasi", "Ashaiman", "Tema", "Cape Coast", "Tamale", "Takoradi", "Kasoa"].map((town) => (
                  <button
                    key={town}
                    type="button"
                    onClick={() => {
                      setSearchLocation(town);
                      performSearch(town, facilityType);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 transition font-medium"
                  >
                    {town}
                  </button>
                ))}
              </div>
            </form>

            {/* Status Feedback */}
            <div className="flex items-center justify-between text-xs text-[#64756e] px-1">
              <span>{searchStatusText}</span>
              {searchSource && (
                <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {searchSource}
                </span>
              )}
            </div>

            {/* Interactive Map */}
            <MapComponent
              center={mapCenter}
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />

            {/* Facilities List Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">
                  Mapped Healthcare Results ({facilities.length})
                </h3>
                <span className="text-xs text-gray-500">Sorted by proximity to search centre</span>
              </div>

              {facilities.length === 0 && !searchLoading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
                  No matching facilities found. Try searching for a major town or selecting "All Healthcare Facilities".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.map((fac) => {
                    const isSelected = selectedFacility?.id === fac.id;
                    return (
                      <div
                        key={fac.id}
                        onClick={() => setSelectedFacility(fac)}
                        className={`bg-white rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-[#dce9e1] hover:border-emerald-300 hover:shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#087f5b] flex items-center gap-1">
                              {fac.category === "Pharmacy" ? <Pill className="w-3 h-3" /> : <Hospital className="w-3 h-3" />}
                              {fac.category}
                            </span>
                            {fac.emergency24_7 && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-red-600" />
                                24/7 Emergency
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-gray-900 text-base leading-snug mb-1">
                            {fac.name}
                          </h4>
                          <p className="text-xs text-[#64756e] mb-3 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {fac.address || fac.city}
                          </p>

                          {fac.distanceKm !== undefined && (
                            <div className="text-xs font-bold text-emerald-800 mb-2">
                              Approx. {fac.distanceKm} km away
                            </div>
                          )}

                          {fac.services && fac.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {fac.services.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                          {fac.phone ? (
                            <a
                              href={`tel:${fac.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {fac.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">Phone not listed</span>
                          )}

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#087f5b] hover:underline flex items-center gap-1"
                          >
                            Directions <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 3: AI MEDICAL TRIAGE CHAT (GEMINI 3.8 FLASH)       */}
        {/* ====================================================== */}
        {activeTab === "chat" && (
          <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Chat with ERAS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#64756e]">
                AI-assisted healthcare guidance, symptom triage, first aid instructions, and hospital recommendation.
              </p>
            </div>

            {/* Red Flag Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-950 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Emergency Safety Disclaimer:</strong> ERAS Chat is an informational triage aid.
                It cannot perform formal medical diagnosis or prescribe medicine. If you or someone nearby is experiencing
                severe chest pain, choking, unconsciousness, heavy bleeding, or a venomous snake bite,
                <strong className="text-red-700"> call 112 in Ghana immediately.</strong>
              </div>
            </div>

            {/* Chat Box */}
            <div className="bg-white rounded-3xl border border-[#dce9e1] shadow-sm flex flex-col h-[520px] overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {chatMessages.map((msg) => {
                  const isBot = msg.role === "model";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                          isBot
                            ? msg.isEmergency
                              ? "bg-red-50 text-red-950 border border-red-200"
                              : "bg-[#e9f5ee] text-[#12332b] border border-emerald-100"
                            : "bg-[#087f5b] text-white"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-gray-400">
                        <span>{msg.timestamp}</span>
                        {isBot && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => handleSpeakText(msg.text)}
                              title="Listen to audio"
                              className="hover:text-emerald-700 flex items-center gap-0.5"
                            >
                              <Volume2 className="w-3 h-3" /> Read
                            </button>
                            {msg.source && (
                              <span className="font-mono text-[10px] text-emerald-700 uppercase">
                                [{msg.source}]
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl w-fit text-xs text-gray-500 animate-pulse">
                    <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                    ERAS is analyzing symptoms and local healthcare options...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Preset prompt buttons */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70 flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-gray-500 font-bold whitespace-nowrap text-[11px]">Suggested:</span>
                {[
                  "Severe chest pain and cold sweat",
                  "Child with high fever and convulsion",
                  "Suspected snake bite in leg",
                  "How to stop heavy bleeding?",
                  "Where is nearest trauma centre in Accra?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChatSubmit(undefined, prompt)}
                    className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-800 whitespace-nowrap font-medium transition text-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleChatSubmit} className="p-3 sm:p-4 border-t border-[#dce9e1] flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask ERAS a health or emergency navigation question..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#087f5b]"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 rounded-2xl bg-[#087f5b] hover:bg-[#066749] text-white disabled:opacity-40 transition shadow-xs"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 4: FIRST AID PROTOCOLS & CPR METRONOME             */}
        {/* ====================================================== */}
        {activeTab === "firstaid" && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Verified Emergency First Aid Protocols
              </h1>
              <p className="text-xs sm:text-sm text-[#64756e]">
                Clinical emergency actions to keep patients stable while waiting for ambulance transport.
              </p>
            </div>

            {/* CPR Metronome always accessible */}
            <CprMetronome />

            {/* Guides Selection & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guide List Sidebar */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">
                  Protocols Library
                </span>
                {firstAidGuides.map((guide) => {
                  const isSelected = selectedGuideId === guide.id;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                          : "bg-white/80 border-[#dce9e1] hover:bg-white"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {guide.category}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1.5">{guide.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                        {guide.severity}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Guide Detailed View */}
              <div className="lg:col-span-2">
                {(() => {
                  const current = firstAidGuides.find((g) => g.id === selectedGuideId) || firstAidGuides[0];
                  if (!current) return null;

                  return (
                    <div className="bg-white rounded-3xl border border-[#dce9e1] p-6 sm:p-8 space-y-6 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-[#087f5b]">
                            {current.category}
                          </span>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                            Severity: {current.severity}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">{current.title}</h2>
                        <p className="text-sm text-[#64756e] mt-1">{current.summary}</p>
                      </div>

                      {/* Numbered Steps */}
                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          Action Steps (Execute in Order):
                        </h4>
                        <div className="space-y-3">
                          {current.steps.map((st) => (
                            <div key={st.step} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex gap-3.5">
                              <span className="w-7 h-7 rounded-full bg-[#087f5b] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {st.step}
                              </span>
                              <div>
                                <h5 className="font-bold text-gray-900 text-sm">{st.instruction}</h5>
                                <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{st.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DOs and DONTs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                          <h4 className="font-bold text-emerald-950 text-sm mb-2 flex items-center gap-1.5">
                            <span className="text-emerald-700 font-black">✓</span> DO:
                          </h4>
                          <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-4">
                            {current.dos.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4">
                          <h4 className="font-bold text-red-950 text-sm mb-2 flex items-center gap-1.5">
                            <span className="text-red-700 font-black">✗</span> DO NOT:
                          </h4>
                          <ul className="text-xs text-red-900 space-y-1.5 list-disc pl-4">
                            {current.donts.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Tip */}
                      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Clinical Pro-Tip:</strong> {current.emergencyTip}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 5: GHANA EMERGENCY HOTLINES DIRECTORY              */}
        {/* ====================================================== */}
        {activeTab === "hotlines" && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Ghana Emergency Hotlines Directory
                </h1>
                <p className="text-xs sm:text-sm text-[#64756e]">
                  Official toll-free numbers and regional dispatch commands for medical, fire, disaster, and mental health.
                </p>
              </div>

              {/* Region Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Region:</span>
                <select
                  value={hotlineRegionFilter}
                  onChange={(e) => setHotlineRegionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-semibold"
                >
                  <option value="all">All (National & Regional)</option>
                  <option value="national">National Emergency Core</option>
                  <option value="greater accra">Greater Accra</option>
                  <option value="ashanti">Ashanti</option>
                  <option value="central">Central</option>
                  <option value="western">Western</option>
                  <option value="northern">Northern</option>
                </select>
              </div>
            </div>

            {/* Hotlines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedHotlines.map((hotline) => (
                <div
                  key={hotline.id}
                  className="bg-white rounded-2xl border border-[#dce9e1] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {hotline.badge}
                      </span>
                      <span className="text-xs font-semibold text-[#087f5b]">{hotline.region}</span>
                    </div>

                    <h4 className="font-black text-gray-900 text-base leading-snug mb-1">
                      {hotline.title}
                    </h4>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{hotline.agency}</p>
                    <p className="text-xs text-[#64756e] mb-4 leading-relaxed">{hotline.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-lg text-red-600">
                      {hotline.number}
                    </span>
                    <a
                      href={`tel:${hotline.number}`}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      Dial Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 6: HEALTH UPDATES & COMMUNITY RESOURCES            */}
        {/* ====================================================== */}
        {activeTab === "updates" && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Official Health Advisories & Community Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#64756e]">
                Verified announcements from the Ghana Health Service (GHS), Ministry of Health, and World Health Organization.
              </p>
            </div>

            <div className="space-y-4">
              {updates.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#dce9e1] p-6 shadow-xs hover:border-[#087f5b]/40 transition"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#087f5b]">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                  </div>

                  <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-[#64756e] leading-relaxed mb-4">{item.summary}</p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-500">Source: {item.source}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#087f5b] hover:underline flex items-center gap-1"
                    >
                      Visit Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------- */}
      {/* 4. FOOTER                                                */}
      {/* -------------------------------------------------------- */}
      <footer className="mt-16 bg-white border-t border-[#dce9e1] py-8 px-6 text-center text-xs text-[#64756e] space-y-2">
        <div className="font-extrabold text-sm text-[#087f5b] flex items-center justify-center gap-2">
          <span>✚ ERAS</span>
          <span>•</span>
          <span>Emergency Response and Assistance System</span>
        </div>
        <p className="max-w-xl mx-auto leading-relaxed">
          Developed to enhance rapid access to emergency healthcare, hospital listings, and life-saving first-aid information across Ghana.
        </p>
        <p className="text-[11px] text-gray-400">
          In any life-threatening situation, dial Ghana National Emergency Hotline <strong>112</strong> immediately.
        </p>
        {backendHealth && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-mono mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Backend Active • Gemini AI: {backendHealth.geminiConfigured ? "Ready" : "Local Triage Active"} • Uptime: {backendHealth.uptimeSeconds}s
          </div>
        )}
      </footer>

      {/* Dispatch Preparedness Modal */}
      <DispatchCardModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        defaultLocation={searchLocation}
      />
    </div>
  );
}
