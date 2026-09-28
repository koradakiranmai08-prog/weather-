import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, ShieldAlert, Crosshair, AlertOctagon } from 'lucide-react';
import { WeatherData, HazardEvaluation } from '../types/weather';

interface HazardMapProps {
  weather: WeatherData;
  hazard: HazardEvaluation;
}

export const HazardMap: React.FC<HazardMapProps> = ({ weather, hazard }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [showRadius, setShowRadius] = useState(true);

  const { latitude, longitude, name } = weather.location;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter tiles (sleek dark aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update map view smoothly
    map.setView([latitude, longitude], hazard.isRedZone ? 9 : 10, { animate: true });

    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Create Custom Pin Icon
    const pinColor = hazard.isRedZone
      ? '#ef4444'
      : hazard.alertLevel === 'warning'
      ? '#f59e0b'
      : '#3b82f6';

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${pinColor};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px ${pinColor};
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${hazard.isRedZone ? 'pulse 1.5s infinite' : 'none'};
        ">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    const popupContent = `
      <div style="padding: 4px; min-width: 180px;">
        <div style="font-weight: 800; font-size: 14px; color: #ffffff; margin-bottom: 2px;">
          ${name}
        </div>
        <div style="font-size: 11px; font-weight: 700; color: ${pinColor}; text-transform: uppercase; margin-bottom: 4px;">
          ${hazard.isRedZone ? '⚠️ RED ZONE HAZARD AREA' : hazard.hazardTitle}
        </div>
        <div style="font-size: 12px; color: #94a3b8;">
          Temp: <b style="color: #ffffff;">${Math.round(weather.current.temperature)}°C</b> | Wind: <b style="color: #ffffff;">${Math.round(weather.current.wind_speed_10m)} km/h</b>
        </div>
        ${hazard.isRedZone ? '<div style="margin-top: 6px; font-size: 10px; background: rgba(239,68,68,0.2); color: #fca5a5; padding: 4px 6px; border-radius: 4px;">High disaster alert perimeter active</div>' : ''}
      </div>
    `;
    marker.bindPopup(popupContent);

    // If Red Zone or Warning, render Danger Radius Overlay
    if (showRadius) {
      const radiusMeters = hazard.isRedZone ? 35000 : 15000;
      const circle = L.circle([latitude, longitude], {
        color: pinColor,
        fillColor: pinColor,
        fillOpacity: hazard.isRedZone ? 0.22 : 0.08,
        weight: hazard.isRedZone ? 2.5 : 1.5,
        dashArray: hazard.isRedZone ? '6, 8' : undefined,
        radius: radiusMeters,
      }).addTo(map);

      circleRef.current = circle;
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, [latitude, longitude, hazard, showRadius]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 10, { animate: true });
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-xl">
      {/* Top Map Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-lg">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Hazard Zone Spatial Radar
          </span>
          {hazard.isRedZone && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase border border-rose-500/40 animate-pulse flex items-center">
              <AlertOctagon className="w-3 h-3 mr-1 text-rose-400" />
              Red Perimeter
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Toggle Danger Radius */}
          <button
            onClick={() => setShowRadius(!showRadius)}
            title="Toggle Danger Radius Perimeter"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition ${
              showRadius
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            {showRadius ? 'Perimeter Visible' : 'Hide Perimeter'}
          </button>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            title="Recenter Map on City"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition shadow"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-10" />

      {/* Bottom Map Legend */}
      <div className="p-3.5 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            Red Zone (High Inundation / Cyclone Eye Path)
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5"></span>
            Amber Advisory Zone
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></span>
            Safe Perimeter
          </span>
        </div>

        <div className="text-slate-500 font-mono">
          Radar Center: {latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E
        </div>
      </div>
    </div>
  );
};
