/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Volume2, VolumeX, HeartPulse } from "lucide-react";

export const CprMetronome: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beat, setBeat] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const BPM = 110; // Target CPR rate (100 - 120 compressions per minute)
  const intervalMs = (60 / BPM) * 1000;

  const playClick = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch click
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    if (!isRunning) {
      setBeat(false);
      return;
    }

    const timer = setInterval(() => {
      setBeat((prev) => !prev);
      playClick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, soundEnabled]);

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-100 ${
              beat ? "bg-red-600 scale-110 shadow-lg shadow-red-500/40 text-white" : "bg-red-100 text-red-700"
            }`}
          >
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-red-950 text-base flex items-center gap-2">
              CPR Rhythm Metronome (110 BPM)
              {isRunning && <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full uppercase tracking-wider font-semibold">Active</span>}
            </h4>
            <p className="text-xs text-red-800/80">
              Push down at least 5cm deep to this exact beat. Push hard, fast, and don't stop.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              isRunning
                ? "bg-red-700 hover:bg-red-800 text-white shadow"
                : "bg-red-600 hover:bg-red-700 text-white shadow"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                Stop Rhythm
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Start CPR Beat
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute audio beep" : "Unmute audio beep"}
            className="p-2.5 rounded-xl border border-red-200 bg-white text-red-800 hover:bg-red-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
