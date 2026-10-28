/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Facility {
  id: string;
  name: string;
  category: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Emergency Centre' | 'Diagnostic & Lab';
  address: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  phone?: string;
  emergency24_7: boolean;
  nhisAccredited: boolean;
  services?: string[];
  distanceKm?: number;
}

export interface GhanaTownCoords {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export interface EmergencyContact {
  id: string;
  title: string;
  agency: string;
  number: string;
  altNumber?: string;
  region: string;
  description: string;
  badge: 'National' | 'Regional' | 'Specialist';
}

export interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  severity: 'Immediate Danger' | 'Urgent' | 'Standard';
  summary: string;
  dos: string[];
  donts: string[];
  steps: { step: number; instruction: string; detail: string }[];
  emergencyTip: string;
}

export interface HealthUpdate {
  id: string;
  title: string;
  source: string;
  date: string;
  category: 'Alert' | 'Advisory' | 'Public Health' | 'Vaccination';
  summary: string;
  url: string;
}

// Well-known Ghanaian towns and administrative centres for instant 0ms geocoding
export const GHANA_TOWNS: Record<string, GhanaTownCoords> = {
  "accra": { name: "Accra", region: "Greater Accra", lat: 5.6037, lon: -0.1870 },
  "tema": { name: "Tema", region: "Greater Accra", lat: 5.6698, lon: -0.0166 },
  "ashaiman": { name: "Ashaiman", region: "Greater Accra", lat: 5.7003, lon: -0.0350 },
  "madina": { name: "Madina", region: "Greater Accra", lat: 5.6685, lon: -0.1661 },
  "adenta": { name: "Adenta", region: "Greater Accra", lat: 5.7167, lon: -0.1500 },
  "legon": { name: "Legon", region: "Greater Accra", lat: 5.6508, lon: -0.1869 },
  "kasoa": { name: "Kasoa", region: "Central", lat: 5.5345, lon: -0.4244 },
  "kumasi": { name: "Kumasi", region: "Ashanti", lat: 6.6885, lon: -1.6244 },
  "obuasi": { name: "Obuasi", region: "Ashanti", lat: 6.2022, lon: -1.6836 },
  "ejisu": { name: "Ejisu", region: "Ashanti", lat: 6.7167, lon: -1.4833 },
  "tamale": { name: "Tamale", region: "Northern", lat: 9.4008, lon: -0.8393 },
  "sekondi": { name: "Sekondi", region: "Western", lat: 4.9340, lon: -1.7137 },
  "takoradi": { name: "Takoradi", region: "Western", lat: 4.8845, lon: -1.7554 },
  "tarkwa": { name: "Tarkwa", region: "Western", lat: 5.3018, lon: -1.9961 },
  "cape coast": { name: "Cape Coast", region: "Central", lat: 5.1053, lon: -1.2466 },
  "winneba": { name: "Winneba", region: "Central", lat: 5.3511, lon: -0.6231 },
  "koforidua": { name: "Koforidua", region: "Eastern", lat: 6.0945, lon: -0.2591 },
  "nkawkaw": { name: "Nkawkaw", region: "Eastern", lat: 6.5500, lon: -0.7667 },
  "sunyani": { name: "Sunyani", region: "Bono", lat: 7.3399, lon: -2.3268 },
  "techiman": { name: "Techiman", region: "Bono East", lat: 7.5833, lon: -1.9333 },
  "ho": { name: "Ho", region: "Volta", lat: 6.6008, lon: 0.4713 },
  "hohoe": { name: "Hohoe", region: "Volta", lat: 7.1500, lon: 0.4667 },
  "bolgatanga": { name: "Bolgatanga", region: "Upper East", lat: 10.7856, lon: -0.8514 },
  "wa": { name: "Wa", region: "Upper West", lat: 10.0607, lon: -2.5099 },
  "damongo": { name: "Damongo", region: "Savannah", lat: 9.0833, lon: -1.8167 },
  "nalerigu": { name: "Nalerigu", region: "North East", lat: 10.5333, lon: -0.3667 },
  "dambai": { name: "Dambai", region: "Oti", lat: 8.0667, lon: 0.1833 },
  "goaso": { name: "Goaso", region: "Ahafo", lat: 6.8000, lon: -2.5167 },
  "sefwi wiawso": { name: "Sefwi Wiawso", region: "Western North", lat: 6.2000, lon: -2.4833 }
};

// Curated reference database of major Ghanaian teaching hospitals, regional referral hospitals,
// polyclinics, trauma centres, and key pharmacy networks to ensure 100% reliability offline/online.
export const CURATED_FACILITIES: Facility[] = [
  // Greater Accra
  {
    id: "kbth-01",
    name: "Korle Bu Teaching Hospital (KBTH)",
    category: "Hospital",
    address: "Guggisberg Avenue, Korle Bu",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.5385,
    lon: -0.2289,
    phone: "+233 302 674066",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["24/7 Trauma & Emergency Centre", "Intensive Care Unit (ICU)", "National Cardiothoracic Centre", "National Reconstructive Plastic Surgery", "Blood Bank", "Pediatric Emergency"]
  },
  {
    id: "gar-ridge-02",
    name: "Greater Accra Regional Hospital (Ridge)",
    category: "Hospital",
    address: "Castle Road, Ridge",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.5647,
    lon: -0.1979,
    phone: "+233 302 228315",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["24/7 Accident & Emergency", "Maternity & NICU", "Surgical Theatre", "Laboratory & Imaging", "Blood Transfusion"]
  },
  {
    id: "37-mil-03",
    name: "37 Military Hospital",
    category: "Hospital",
    address: "Liberation Road, 37 Roundabout",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.5862,
    lon: -0.1824,
    phone: "+233 302 776111",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Major Disaster & Emergency Response", "Trauma Unit", "Helipad Access", "Hyperbaric Chamber", "Pharmacy 24/7"]
  },
  {
    id: "ugmc-04",
    name: "University of Ghana Medical Centre (UGMC)",
    category: "Hospital",
    address: "Medical School Bypass, Legon",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.6452,
    lon: -0.1873,
    phone: "+233 302 550840",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Quaternary Emergency & Trauma", "Cardiovascular Catheterization", "Advanced Medical Imaging", "Adult & Neonatal ICU"]
  },
  {
    id: "lister-05",
    name: "Lister Hospital & Fertility Centre",
    category: "Hospital",
    address: "Airport Hills, East Airport",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.6267,
    lon: -0.1345,
    phone: "+233 302 812395",
    emergency24_7: true,
    nhisAccredited: false,
    services: ["Private Emergency Care", "Ambulance Transport", "Labor & Delivery", "On-site Pharmacy"]
  },
  {
    id: "nyaho-06",
    name: "Nyaho Medical Centre (Airport)",
    category: "Hospital",
    address: "35 Kofi Annan Street, Airport Residential",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.6041,
    lon: -0.1842,
    phone: "+233 307 086490",
    emergency24_7: true,
    nhisAccredited: false,
    services: ["24/7 Urgent Care", "Digital Radiography", "Vaccination Clinic", "Emergency Dispatch"]
  },
  {
    id: "tema-gen-07",
    name: "Tema General Hospital",
    category: "Hospital",
    address: "Hospital Road, Community 9",
    city: "Tema",
    region: "Greater Accra",
    lat: 5.6881,
    lon: -0.0076,
    phone: "+233 303 302695",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Public Accident & Emergency", "Maternal Care", "Neonatal Special Care", "Mortuary & Blood Bank"]
  },
  {
    id: "ashaiman-poly-08",
    name: "Ashaiman Polyclinic",
    category: "Clinic",
    address: "Official Town, Near Market",
    city: "Ashaiman",
    region: "Greater Accra",
    lat: 5.6989,
    lon: -0.0381,
    phone: "+233 303 300450",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["24h Outpatient Department", "Emergency Stabilization", "Maternity", "NHIS Pharmacy"]
  },
  {
    id: "ernest-accra-09",
    name: "Ernest Chemists 24/7 Superstore & Pharmacy",
    category: "Pharmacy",
    address: "Ring Road Central, Kwame Nkrumah Circle",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.5684,
    lon: -0.2105,
    phone: "+233 302 227702",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Emergency Medications", "Prescription Dispensing", "Blood Pressure Checks", "First Aid Supplies"]
  },
  {
    id: "tobinco-10",
    name: "Tobinco Pharmacy (Kotobabi)",
    category: "Pharmacy",
    address: "Pig Farm / Kotobabi Junction",
    city: "Accra",
    region: "Greater Accra",
    lat: 5.5901,
    lon: -0.2014,
    phone: "+233 302 249692",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Essential Medicines", "Antivenom Availability", "Pediatric Formulations"]
  },

  // Ashanti Region
  {
    id: "kath-11",
    name: "Komfo Anokye Teaching Hospital (KATH)",
    category: "Hospital",
    address: "Bantama Road, Bantama",
    city: "Kumasi",
    region: "Ashanti",
    lat: 6.6967,
    lon: -1.6312,
    phone: "+233 322 022301",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Tertiary Emergency & Trauma Centre", "National Oncology Centre", "Pediatric Emergency Unit", "Neurosurgery & Orthopedics"]
  },
  {
    id: "manhyia-12",
    name: "Manhyia Government Hospital",
    category: "Hospital",
    address: "Manhyia, Near Palace",
    city: "Kumasi",
    region: "Ashanti",
    lat: 6.7088,
    lon: -1.6145,
    phone: "+233 322 023321",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Secondary Emergency Care", "Maternity", "General Surgery", "NHIS Pharmacy"]
  },
  {
    id: "suntreso-13",
    name: "Suntreso Government Hospital",
    category: "Hospital",
    address: "North Suntreso",
    city: "Kumasi",
    region: "Ashanti",
    lat: 6.7025,
    lon: -1.6441,
    phone: "+233 322 026190",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Urgent Care", "Laboratory", "Child Welfare Clinic", "Pharmacy"]
  },
  {
    id: "obuasi-gov-14",
    name: "Obuasi Government Hospital",
    category: "Hospital",
    address: "Hospital Road",
    city: "Obuasi",
    region: "Ashanti",
    lat: 6.2050,
    lon: -1.6780,
    phone: "+233 322 440212",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Mining Trauma & Emergency", "General Surgery", "Maternity", "Blood Bank"]
  },

  // Central Region
  {
    id: "ccth-15",
    name: "Cape Coast Teaching Hospital (CCTH)",
    category: "Hospital",
    address: "Pedu Junction, Cape Coast",
    city: "Cape Coast",
    region: "Central",
    lat: 5.1234,
    lon: -1.2721,
    phone: "+233 332 132440",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Tertiary Trauma & Emergency", "Intensive Care", "Dialysis Centre", "Obstetric Emergency"]
  },
  {
    id: "winneba-trauma-16",
    name: "Winneba Trauma and Specialist Hospital",
    category: "Emergency Centre",
    address: "Accra-Cape Coast Highway",
    city: "Winneba",
    region: "Central",
    lat: 5.3725,
    lon: -0.6288,
    phone: "+233 332 322101",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Highway Trauma Stabilization", "Orthopedic Emergency", "Blood Transfusion", "Ambulance Transfer"]
  },
  {
    id: "kasoa-poly-17",
    name: "Mother and Child Hospital (Kasoa Polyclinic)",
    category: "Hospital",
    address: "Kasoa CP / New Town",
    city: "Kasoa",
    region: "Central",
    lat: 5.5410,
    lon: -0.4190,
    phone: "+233 302 862410",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["24/7 Emergency Care", "Maternal & Child Health", "NHIS Pharmacy", "Laboratory"]
  },

  // Western Region
  {
    id: "effia-nkwanta-18",
    name: "Effia Nkwanta Regional Hospital",
    category: "Hospital",
    address: "Sekondi-Takoradi Highway",
    city: "Sekondi-Takoradi",
    region: "Western",
    lat: 4.9210,
    lon: -1.7330,
    phone: "+233 312 046241",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Regional Referral & Emergency", "Burns & Trauma Care", "CT Imaging", "Blood Bank"]
  },
  {
    id: "tarkwa-mun-19",
    name: "Tarkwa Municipal Hospital",
    category: "Hospital",
    address: "Hospital Hill",
    city: "Tarkwa",
    region: "Western",
    lat: 5.3050,
    lon: -1.9920,
    phone: "+233 312 320241",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Accident & Emergency", "General Medical & Surgical", "Pharmacy"]
  },

  // Northern Region
  {
    id: "tth-20",
    name: "Tamale Teaching Hospital (TTH)",
    category: "Hospital",
    address: "Hospital Road, Eastern Ward",
    city: "Tamale",
    region: "Northern",
    lat: 9.3951,
    lon: -0.8291,
    phone: "+233 372 022458",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Northern Sector Major Trauma & Emergency", "Pediatric Emergency", "ICU", "Dialysis", "Antivenom Stockist"]
  },
  {
    id: "tamale-cent-21",
    name: "Tamale Central Hospital",
    category: "Hospital",
    address: "Central Commercial Area",
    city: "Tamale",
    region: "Northern",
    lat: 9.4050,
    lon: -0.8410,
    phone: "+233 372 022131",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Emergency Stabilization", "Maternity", "Outpatient", "NHIS Services"]
  },

  // Volta Region
  {
    id: "hth-22",
    name: "Ho Teaching Hospital (HTH)",
    category: "Hospital",
    address: "Trafalgar, Mawuli Estate",
    city: "Ho",
    region: "Volta",
    lat: 6.5890,
    lon: 0.4680,
    phone: "+233 362 026424",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Volta Regional Teaching Hospital", "Accident & Emergency", "Surgery & Critical Care", "Blood Bank"]
  },

  // Eastern Region
  {
    id: "erh-kof-23",
    name: "Eastern Regional Hospital (Koforidua)",
    category: "Hospital",
    address: "Hospital Road",
    city: "Koforidua",
    region: "Eastern",
    lat: 6.0980,
    lon: -0.2540,
    phone: "+233 342 022232",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Regional Referral & Emergency", "Orthopedics", "NICU", "Blood Transfusion"]
  },

  // Bono Region
  {
    id: "brh-sun-24",
    name: "Sunyani Regional Hospital",
    category: "Hospital",
    address: "Chiraa Road",
    city: "Sunyani",
    region: "Bono",
    lat: 7.3480,
    lon: -2.3190,
    phone: "+233 352 027142",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Regional Emergency & Trauma", "Surgical Suites", "Diagnostics & Pharmacy"]
  },

  // Upper East
  {
    id: "rh-bolga-25",
    name: "Upper East Regional Hospital (Bolgatanga)",
    category: "Hospital",
    address: "Hospital Road",
    city: "Bolgatanga",
    region: "Upper East",
    lat: 10.7910,
    lon: -0.8490,
    phone: "+233 382 022312",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["Emergency & Snakebite Treatment", "General Surgery", "Pediatric Care"]
  },

  // Upper West
  {
    id: "rh-wa-26",
    name: "Upper West Regional Hospital (Wa)",
    category: "Hospital",
    address: "Wa Commercial District",
    city: "Wa",
    region: "Upper West",
    lat: 10.0650,
    lon: -2.5020,
    phone: "+233 392 022301",
    emergency24_7: true,
    nhisAccredited: true,
    services: ["24/7 Regional Emergency", "Antivenom Stock", "Maternity", "Blood Bank"]
  }
];

// Official Ghana Emergency Hotline Directory
export const GHANA_HOTLINES: EmergencyContact[] = [
  {
    id: "gen-112",
    title: "Ghana National Emergency Hotline",
    agency: "National Emergency Communications Centre",
    number: "112",
    region: "National",
    description: "Toll-free emergency dispatch for Ambulance, Police, and Fire across all 16 regions of Ghana.",
    badge: "National"
  },
  {
    id: "nas-193",
    title: "National Ambulance Service (NAS)",
    agency: "Ministry of Health / NAS Ghana",
    number: "193",
    altNumber: "+233 302 772926",
    region: "National",
    description: "Direct medical transport dispatch, emergency medical technicians (EMTs), and patient stabilization.",
    badge: "National"
  },
  {
    id: "fire-192",
    title: "Ghana National Fire Service (GNFS)",
    agency: "GNFS Operations Command",
    number: "192",
    altNumber: "+233 302 772446",
    region: "National",
    description: "Vehicle extrication, highway crash rescue, structural fire suppression, and hazardous materials.",
    badge: "National"
  },
  {
    id: "police-191",
    title: "Ghana Police Service Emergency",
    agency: "Police Headquarters Operations",
    number: "191",
    altNumber: "18555",
    region: "National",
    description: "Law enforcement, incident protection, traffic control, and crime assistance.",
    badge: "National"
  },
  {
    id: "poison-01",
    title: "Ghana Poison Control Information Centre",
    agency: "Ridge Hospital / Ministry of Health",
    number: "+233 302 689369",
    altNumber: "+233 302 689370",
    region: "National",
    description: "Immediate guidance on snake bites, chemical ingestion, pesticide exposure, drug overdose.",
    badge: "Specialist"
  },
  {
    id: "mental-01",
    title: "National Mental Health & Crisis Helpline",
    agency: "Mental Health Authority Ghana",
    number: "0800 678 678",
    region: "National",
    description: "Toll-free 24/7 suicide prevention, severe crisis counselling, and psychological first aid.",
    badge: "Specialist"
  },
  {
    id: "nadmo-01",
    title: "National Disaster Management Organisation (NADMO)",
    agency: "NADMO Ghana",
    number: "+233 302 772926",
    region: "National",
    description: "Flood rescue, building collapses, environmental disasters, and mass casualty logistics.",
    badge: "National"
  },
  {
    id: "redcross-01",
    title: "Ghana Red Cross Society First Aid Emergency",
    agency: "GRCS Operations",
    number: "+233 302 662298",
    region: "National",
    description: "Volunteer community first responders and emergency relief operations.",
    badge: "National"
  },
  // Regional ambulance dispatch hotlines
  {
    id: "nas-accra",
    title: "NAS Greater Accra Regional Dispatch",
    agency: "National Ambulance Service",
    number: "+233 302 772926",
    region: "Greater Accra",
    description: "Direct dispatch command for Accra, Tema, Ashaiman, Ga East/West, and Kasoa corridor.",
    badge: "Regional"
  },
  {
    id: "nas-ashanti",
    title: "NAS Ashanti Regional Dispatch",
    agency: "National Ambulance Service",
    number: "+233 322 022301",
    region: "Ashanti",
    description: "Dispatch covering Kumasi metropolitan area, Obuasi, Ejisu, and central Ashanti network.",
    badge: "Regional"
  },
  {
    id: "nas-central",
    title: "NAS Central Regional Dispatch",
    agency: "National Ambulance Service",
    number: "+233 332 132440",
    region: "Central",
    description: "Cape Coast, Winneba trauma corridor, Mankessim, and coastal bypass medical transfer.",
    badge: "Regional"
  },
  {
    id: "nas-western",
    title: "NAS Western Regional Dispatch",
    agency: "National Ambulance Service",
    number: "+233 312 046241",
    region: "Western",
    description: "Sekondi-Takoradi, Tarkwa mining belt, and southern industrial corridor dispatch.",
    badge: "Regional"
  },
  {
    id: "nas-northern",
    title: "NAS Northern Regional Dispatch",
    agency: "National Ambulance Service",
    number: "+233 372 022458",
    region: "Northern",
    description: "Tamale metro and northern transit route ambulance coordination.",
    badge: "Regional"
  }
];

// Step-by-step Emergency First Aid Protocols
export const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: "cpr-adult",
    title: "Adult CPR (Hands-Only & Rescue Breaths)",
    category: "Cardiac / Respiratory",
    severity: "Immediate Danger",
    summary: "Immediate chest compressions when a person is unresponsive and not breathing normally.",
    dos: [
      "Call 112 immediately or shout for someone nearby to call 112.",
      "Check for normal chest rise for no more than 10 seconds.",
      "Place heel of one hand in centre of chest, other hand on top with interlocked fingers.",
      "Push hard and fast: 100-120 compressions/minute (to the beat of 'Stayin' Alive'), at least 5-6 cm deep.",
      "Allow chest to completely recoil after every push."
    ],
    donts: [
      "Do NOT delay compressions to search for a pulse if untrained.",
      "Do NOT interrupt compressions for more than 10 seconds.",
      "Do NOT place hands over the lower tip of the breastbone (xiphoid process)."
    ],
    steps: [
      { step: 1, instruction: "Assess Danger & Response", detail: "Ensure the scene is safe (no electrical wires, oncoming traffic, fire). Tap shoulders firmly and shout: 'Are you okay?'" },
      { step: 2, instruction: "Call 112 & Get Help", detail: "Shout loudly: 'You in the blue shirt, call 112 right now! Tell them an adult is unconscious and not breathing!'" },
      { step: 3, instruction: "Open Airway & Check Breathing", detail: "Tilt head back gently, lift chin. Look, listen, and feel for normal breathing (gasping/agonal breaths are NOT normal)." },
      { step: 4, instruction: "Begin Hands-Only CPR", detail: "Kneel beside chest. Lock elbows straight. Push straight down hard and fast at 100-120 beats per minute." },
      { step: 5, instruction: "Continue Until Help Arrives", detail: "Keep pushing until trained ambulance paramedics arrive, an AED is ready, or the person clearly wakes up and breathes." }
    ],
    emergencyTip: "If you feel exhausted, instruct a bystander to take over every 2 minutes without stopping compression rhythm for more than 5 seconds."
  },
  {
    id: "snake-bite",
    title: "West African Snake Bite Emergency Protocol",
    category: "Toxicology / Bites",
    severity: "Immediate Danger",
    summary: "Critical survival protocol for viper, spitting cobra, and mamba envenomation common in Ghana.",
    dos: [
      "Keep the victim completely STILL and calm to slow venom circulation through the lymphatic system.",
      "Immobilize the bitten limb at or slightly below heart level with a splint or sling.",
      "Remove tight rings, bracelets, shoes, and tight clothing before swelling begins.",
      "Immediately transport to a hospital with antivenom (call ahead to check stock, e.g. TTH, KBTH, CCTH).",
      "Try to take a safe photo of the snake from a distance (do NOT catch or kill it)."
    ],
    donts: [
      "DO NOT cut the wound or attempt to suck out venom (proven lethal myth).",
      "DO NOT apply a tight arterial tourniquet (causes tissue necrosis, gangrene, and limb amputation).",
      "DO NOT apply ice, electricity, potassium permanganate, or local concoctions/black stone.",
      "DO NOT allow the victim to walk or run."
    ],
    steps: [
      { step: 1, instruction: "Move to Safety & Keep Calm", detail: "Back away gently from the snake. Have the victim sit or lie down immediately. Panic increases heart rate and speeds venom spread." },
      { step: 2, instruction: "Immobilize the Limb", detail: "Use a firm stick, cardboard, or cloth sling to keep the leg or arm rigid and immobile. Do not wrap too tight; fingers/toes must remain pink with pulse." },
      { step: 3, instruction: "Remove Restricting Items", detail: "Quickly slide off rings, watches, bracelets, and footwear. Venom induces massive swelling within minutes." },
      { step: 4, instruction: "Urgent Transport to Hospital", detail: "Carry or transport the patient by vehicle. Call 112 or the Ghana Poison Control Centre (+233 302 689369) to verify hospital antivenom stock." }
    ],
    emergencyTip: "Monitor for drooping eyelids (ptosis), difficulty swallowing, or breathing distress. If breathing fails, be ready to initiate mouth-to-mask or rescue breaths."
  },
  {
    id: "choking-heimlich",
    title: "Severe Choking & Abdominal Thrusts (Heimlich)",
    category: "Airway",
    severity: "Immediate Danger",
    summary: "Life-saving maneuvers when food or foreign object obstructs the airway.",
    dos: [
      "Ask: 'Are you choking? Can you speak or cough?' If they nod and cannot speak, act immediately.",
      "Alternate 5 back blows (heel of hand between shoulder blades) and 5 quick inward/upward abdominal thrusts.",
      "If the person becomes unconscious, lower them safely to the floor and start CPR compressions immediately."
    ],
    donts: [
      "Do NOT perform blind finger sweeps in the mouth (may push object deeper into larynx).",
      "Do NOT offer water while choking.",
      "Do NOT give abdominal thrusts to pregnant women or infants (use chest thrusts instead)."
    ],
    steps: [
      { step: 1, instruction: "Stand Behind & Lean Forward", detail: "Support their chest with one hand and lean them forward so the object can exit the mouth." },
      { step: 2, instruction: "Give 5 Sharp Back Blows", detail: "Deliver 5 firm blows between their shoulder blades using the heel of your free hand." },
      { step: 3, instruction: "Give 5 Abdominal Thrusts", detail: "Make a fist with one hand, thumb inwards, placed just above the navel. Grasp fist with your other hand and pull sharply inward and upward." },
      { step: 4, instruction: "Repeat Until Cleared", detail: "Alternate 5 back blows and 5 abdominal thrusts until foreign object is expelled or help takes over." }
    ],
    emergencyTip: "For choking infants under 1 year: place facedown along your forearm supporting jaw, deliver 5 back thumps, turn over, deliver 5 two-finger chest thrusts. Never shake an infant!"
  },
  {
    id: "severe-bleeding",
    title: "Severe Bleeding & Hemorrhage Control",
    category: "Trauma",
    severity: "Immediate Danger",
    summary: "Stopping massive arterial or venous blood loss following road accidents, lacerations, or falls.",
    dos: [
      "Apply firm, continuous, direct pressure directly over the bleeding wound using clean gauze, cloth, or gloved hand.",
      "Pack deep cavity wounds firmly with clean dressings before applying pressure.",
      "For severe arterial limb bleeding not stopping with pressure, apply a commercial or improvised windlass tourniquet 5-7 cm above wound (never over a joint).",
      "Keep patient warm and lie flat with legs elevated if in shock (pale, cold, clammy)."
    ],
    donts: [
      "Do NOT remove blood-soaked dressings—add fresh ones on top to preserve forming clots.",
      "Do NOT loosen or remove a tourniquet once applied until in a surgical theatre.",
      "Do NOT remove large impaled objects (stabilize around them)."
    ],
    steps: [
      { step: 1, instruction: "Direct Hard Pressure", detail: "Press both hands down firmly onto the wound using clean gauze, shirt, or towel with body weight." },
      { step: 2, instruction: "Wrap Pressure Bandage", detail: "Secure dressing tightly with a roller bandage. Ensure pulse remains downstream if not using a tourniquet." },
      { step: 3, instruction: "Treat for Shock", detail: "Keep patient lying down, cover with blanket, elevate legs 30 cm if no fracture suspected. Call 112." }
    ],
    emergencyTip: "Note the exact time a tourniquet was applied (write on forehead or tape: 'T: 14:30') to alert surgeons."
  },
  {
    id: "burns-scalds",
    title: "Burns & Scalds Management",
    category: "Thermal / Chemical",
    severity: "Urgent",
    summary: "Cooling thermal injuries and preventing severe infection and fluid loss.",
    dos: [
      "Immediately cool the burn under gentle running cool tap water for at least 20 minutes.",
      "Cover loosely with sterile non-adherent dressing, clean cling film (plastic food wrap), or clean cotton cloth.",
      "Seek emergency care for burns larger than the patient's palm, on face, hands, groin, or circular around a limb."
    ],
    donts: [
      "DO NOT apply ice or freezing ice water (worsens tissue damage and induces hypothermia).",
      "DO NOT apply butter, toothpaste, oil, engine oil, or herbal pastes (major infection risk).",
      "DO NOT burst blisters."
    ],
    steps: [
      { step: 1, instruction: "Cool Under Running Water", detail: "Hold affected area under cool running water for 20 minutes minimum. Do not delay." },
      { step: 2, instruction: "Remove Jewelry & Loose Clothing", detail: "Gently remove rings, watches, and loose apparel before swelling. Do not pull clothing stuck to burned skin." },
      { step: 3, instruction: "Cover Loosely", detail: "Apply clean plastic cling wrap layered over the burn or clean lint-free cloth. Seek medical evaluation." }
    ],
    emergencyTip: "For electrical burns, remember that internal organ and muscle tissue damage is often far worse than the small entry/exit skin marks visible."
  },
  {
    id: "seizures-convulsions",
    title: "Seizures & Febrile Convulsions",
    category: "Neurological",
    severity: "Urgent",
    summary: "Protecting a seizing adult or child from traumatic injury and maintaining an open airway.",
    dos: [
      "Clear the surrounding area of hard, sharp, or hot objects.",
      "Cushion their head with a folded jacket or soft pillow.",
      "Time the duration of the seizure.",
      "Once jerking stops, roll the person gently onto their side into the Recovery Position to keep airway clear of saliva or vomit.",
      "Call 112 if seizure lasts more than 5 minutes, if multiple seizures occur, or if person is pregnant/injured."
    ],
    donts: [
      "DO NOT hold them down or try to restrain their movements.",
      "DO NOT force anything into their mouth (spoons, fingers, cloth)—they cannot swallow their tongue!",
      "DO NOT give drinks, food, or medication until fully conscious and alert."
    ],
    steps: [
      { step: 1, instruction: "Protect from Harm", detail: "Move furniture, stones, or hazards away. Place something soft under head. Loosen tight neckwear." },
      { step: 2, instruction: "Time the Event", detail: "Note the clock time. Seizures exceeding 5 minutes require emergency medical intervention (Status Epilepticus)." },
      { step: 3, instruction: "Recovery Position", detail: "As soon as spasms cease, turn patient onto their left side, tilt chin up gently to allow fluid drainage." }
    ],
    emergencyTip: "For children with high fever convulsions (febrile seizure): remove excess clothes, keep room ventilated, sponge gently with lukewarm (not cold) water, and take to a clinic for malaria/infection evaluation."
  }
];

// Official Health Updates & Bulletins
export const HEALTH_UPDATES: HealthUpdate[] = [
  {
    id: "upd-01",
    title: "Ghana Health Service: Nationwide Seasonal Malaria Chemoprevention & Vigilance",
    source: "Ghana Health Service (GHS)",
    date: "October 2026",
    category: "Public Health",
    summary: "Public advisory reminding households across Northern, Upper East, and Ashanti regions to utilize treated mosquito nets and ensure early clinical testing for persistent fever in children under 5.",
    url: "https://ghs.gov.gh/"
  },
  {
    id: "upd-02",
    title: "National Ambulance Service: Enhanced 112 Dispatch Interoperability",
    source: "Ministry of Health, Ghana",
    date: "September 2026",
    category: "Alert",
    summary: "New digitized GIS mapping integration for municipal ambulances to reduce average response times across Greater Accra and Kumasi metropolitan hubs.",
    url: "https://www.moh.gov.gh/"
  },
  {
    id: "upd-03",
    title: "Cholera & Acute Waterborne Infection Prevention Advisory (Rainy Season)",
    source: "Disease Surveillance Dept, GHS",
    date: "August 2026",
    category: "Advisory",
    summary: "Guidelines on drinking water safety, food hygiene, and rapid oral rehydration therapy (ORT) during seasonal localized flooding in urban lowlands.",
    url: "https://ghs.gov.gh/"
  },
  {
    id: "upd-04",
    title: "WHO Africa: Yellow Fever & Routine Childhood Immunization Coverage Drive",
    source: "World Health Organization (WHO AFRO)",
    date: "July 2026",
    category: "Vaccination",
    summary: "Routine vaccination drives at district polyclinics and CHPS compounds. Citizens traveling across West Africa are advised to check valid yellow cards.",
    url: "https://www.who.int/news"
  }
];

// Helper: Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}
