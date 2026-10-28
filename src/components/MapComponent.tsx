/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Facility } from "../types";

interface MapComponentProps {
  center: { lat: number; lon: number; label: string };
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (fac: Facility) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center,
  facilities,
  selectedFacility,
  onSelectFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: 12,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markers = L.layerGroup().addTo(map);
      markersLayerRef.current = markers;
      mapInstanceRef.current = map;

      // Allow map resize calculations
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update center view
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lon], 12);
      mapInstanceRef.current.invalidateSize();
    }
  }, [center.lat, center.lon]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersLayerRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    // 1. Center Search Pin (Gold/Amber pulsing badge)
    const centerHtml = `
      <div style="
        background: #087f5b;
        color: white;
        border: 2px solid white;
        box-shadow: 0 0 12px rgba(8, 127, 91, 0.6);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      ">
        📍
      </div>
    `;
    const centerIcon = L.divIcon({
      html: centerHtml,
      className: "custom-center-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([center.lat, center.lon], { icon: centerIcon })
      .bindPopup(`<strong>Search Center:</strong><br>${center.label}`)
      .addTo(markers);

    // 2. Facility Pins
    facilities.forEach((fac) => {
      let bgColor = "#087f5b";
      let symbol = "🏥";

      if (fac.category === "Pharmacy") {
        bgColor = "#059669";
        symbol = "💊";
      } else if (fac.category === "Clinic") {
        bgColor = "#0284c7";
        symbol = "🩺";
      } else if (fac.emergency24_7) {
        bgColor = "#dc2626";
        symbol = "🚨";
      }

      const isSelected = selectedFacility?.id === fac.id;
      const markerHtml = `
        <div style="
          background: ${bgColor};
          color: white;
          border: ${isSelected ? "3px solid #facc15" : "2px solid white"};
          transform: ${isSelected ? "scale(1.25)" : "scale(1)"};
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          transition: transform 0.2s ease;
          cursor: pointer;
        ">
          ${symbol}
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: `custom-facility-marker-${fac.id}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 180px;">
          <strong style="font-size: 14px; color: #12332b;">${fac.name}</strong><br/>
          <span style="display:inline-block; margin: 4px 0; padding: 2px 6px; background: #e3f4eb; color: #087f5b; border-radius: 4px; font-weight: 600; font-size: 11px;">
            ${fac.category} ${fac.emergency24_7 ? "• 24/7 Emergency" : ""}
          </span>
          <div style="color: #64756e; margin: 4px 0;">${fac.address}</div>
          ${fac.distanceKm !== undefined ? `<div style="font-weight: 600; color: #087f5b;">Dist: ${fac.distanceKm} km</div>` : ""}
          ${fac.phone ? `<a href="tel:${fac.phone}" style="color: #dc2626; font-weight: bold; text-decoration: none; display: block; margin-top: 4px;">📞 Call ${fac.phone}</a>` : ""}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lon}" target="_blank" rel="noopener noreferrer" style="color: #087f5b; font-weight: 600; display: inline-block; margin-top: 6px;">
            Get Directions ↗
          </a>
        </div>
      `;

      const marker = L.marker([fac.lat, fac.lon], { icon })
        .bindPopup(popupContent)
        .addTo(markers);

      marker.on("click", () => {
        onSelectFacility(fac);
      });

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [facilities, selectedFacility, center, onSelectFacility]);

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-emerald-900/10 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-200 text-xs flex flex-wrap gap-3 z-[1000]">
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          24/7 Emergency
        </div>
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block"></span>
          Hospital
        </div>
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
          Clinic
        </div>
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
          Pharmacy
        </div>
      </div>
    </div>
  );
};
