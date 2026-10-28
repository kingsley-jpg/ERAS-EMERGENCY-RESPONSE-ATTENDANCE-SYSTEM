/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Phone, Copy, Check, Share2, MapPin, AlertCircle, X, ShieldAlert } from "lucide-react";

interface DispatchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
}

export const DispatchCardModal: React.FC<DispatchCardModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = "",
}) => {
  const [location, setLocation] = useState(defaultLocation);
  const [landmark, setLandmark] = useState("");
  const [emergencyType, setEmergencyType] = useState("Road Traffic Accident");
  const [patientCount, setPatientCount] = useState(1);
  const [isConscious, setIsConscious] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);
  const [extraDetails, setExtraDetails] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);

  if (!isOpen) return null;

  const handleUseGps = () => {
    if (!navigator.geolocation) return;
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setLoadingLoc(false);
      },
      () => {
        setLoadingLoc(false);
      },
      { timeout: 8000 }
    );
  };

  const scriptText = `Hello Operator, this is an emergency call!
- Nature: ${emergencyType}
- Location: ${location || "Location not entered yet"} ${landmark ? `(Landmark: ${landmark})` : ""}
- Number of Victims: ${patientCount}
- Patient Status: ${isConscious ? "Conscious" : "UNCONSCIOUS"}, ${isBreathing ? "Breathing" : "NOT BREATHING NORMALLY"}
${extraDetails ? `- Additional Info: ${extraDetails}` : ""}
Please dispatch an ambulance and first responders immediately!`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🚨 EMERGENCY ALERT (ERAS GHANA):\n\n${scriptText}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-red-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">
              112 Dispatch Preparedness Card
            </h3>
            <p className="text-xs text-gray-500">
              Generate an immediate 15-second clear script to read to the 112 / 193 operator.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">Where is the patient? (Location & Town)</label>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={loadingLoc}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {loadingLoc ? "Locating..." : "Use GPS Coordinates"}
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Spintex Road, near Kotobabi Junction, Accra"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Prominent Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Shell Station / Palace Mall"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nature of Emergency</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="Road Traffic Crash / Accident">Road Traffic Accident</option>
                <option value="Unconscious / Non-responsive Person">Unconscious / Collapse</option>
                <option value="Severe Difficulty Breathing">Severe Difficulty Breathing</option>
                <option value="Heart Attack / Severe Chest Pain">Heart Attack / Chest Pain</option>
                <option value="Severe Uncontrolled Bleeding">Severe Bleeding</option>
                <option value="Snake or Scorpion Envenomation">Snake / Scorpion Bite</option>
                <option value="Poisoning or Overdose">Poisoning / Chemical Ingestion</option>
                <option value="Severe Burns / Fire Scald">Severe Fire / Scalds</option>
                <option value="Seizure / Convulsion">Prolonged Seizure</option>
                <option value="Maternal / Labor Complication">Maternal Emergency</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 py-2 border-y border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={isConscious}
                onChange={(e) => setIsConscious(e.target.checked)}
                className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              Is Conscious?
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={isBreathing}
                onChange={(e) => setIsBreathing(e.target.checked)}
                className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              Is Breathing?
            </label>

            <div className="flex items-center gap-2 ml-auto text-xs font-semibold text-gray-700">
              <span>Victims:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={patientCount}
                onChange={(e) => setPatientCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-14 px-2 py-1 rounded-lg border border-gray-300 text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Special Notes / Hazards (Optional)</label>
            <input
              type="text"
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              placeholder="e.g. Patient is trapped in car, or severe head injury"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Read aloud block */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Read this aloud word-for-word to 112:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyScript}
                className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={shareWhatsApp}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
          <p className="text-sm font-mono text-gray-900 bg-white p-3 rounded-xl border border-red-100 whitespace-pre-line leading-relaxed select-all">
            {scriptText}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/30 transition-transform active:scale-95"
          >
            <Phone className="w-5 h-5 fill-white" />
            Dial 112 (National Emergency)
          </a>
          <a
            href="tel:193"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-md transition-transform active:scale-95"
          >
            <Phone className="w-5 h-5 fill-white" />
            Dial 193 (NAS Ambulance)
          </a>
        </div>
      </div>
    </div>
  );
};
