import React from 'react';
import { AlertCircle, Flame, Waves, Wind } from 'lucide-react';
import { GeoLocation } from '../types/weather';

interface HotspotItem {
  location: GeoLocation;
  hazardNote: string;
  type: 'cyclone' | 'flood' | 'heat' | 'general';
}

const GLOBAL_WATCH_HOTSPOTS: HotspotItem[] = [
  {
    location: { name: 'Miami', latitude: 25.7617, longitude: -80.1918, country: 'United States', country_code: 'US', admin1: 'Florida' },
    hazardNote: 'Atlantic Hurricane Corridor',
    type: 'cyclone',
  },
  {
    location: { name: 'Manila', latitude: 14.5995, longitude: 120.9842, country: 'Philippines', country_code: 'PH', admin1: 'Metro Manila' },
    hazardNote: 'West Pacific Typhoon Basin',
    type: 'cyclone',
  },
  {
    location: { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', country_code: 'IN', admin1: 'Maharashtra' },
    hazardNote: 'Arabian Sea Monsoon & Coastal Surge',
    type: 'flood',
  },
  {
    location: { name: 'Dhaka', latitude: 23.8103, longitude: 90.4125, country: 'Bangladesh', country_code: 'BD', admin1: 'Dhaka' },
    hazardNote: 'Bay of Bengal Delta Flood Basin',
    type: 'flood',
  },
  {
    location: { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', country_code: 'JP', admin1: 'Tokyo' },
    hazardNote: 'Pacific Coastal Weather Grid',
    type: 'general',
  },
  {
    location: { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'United Arab Emirates', country_code: 'AE', admin1: 'Dubai' },
    hazardNote: 'Thermal Heat Index Corridor',
    type: 'heat',
  },
];

interface GlobalHotspotsBarProps {
  currentCityName: string;
  onSelectCity: (loc: GeoLocation) => void;
}

export const GlobalHotspotsBar: React.FC<GlobalHotspotsBarProps> = ({
  currentCityName,
  onSelectCity,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Active Severe Weather Watch Zones
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any watchpoint to inspect live radar & Red Zone status
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {GLOBAL_WATCH_HOTSPOTS.map((hotspot) => {
          const isSelected = hotspot.location.name.toLowerCase() === currentCityName.toLowerCase();

          return (
            <button
              key={hotspot.location.name}
              onClick={() => onSelectCity(hotspot.location)}
              className={`p-2.5 rounded-xl border text-left transition duration-150 ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs truncate text-white">
                  {hotspot.location.name}
                </span>
                {hotspot.type === 'cyclone' ? (
                  <Wind className="w-3 h-3 text-rose-400 shrink-0" />
                ) : hotspot.type === 'flood' ? (
                  <Waves className="w-3 h-3 text-cyan-400 shrink-0" />
                ) : hotspot.type === 'heat' ? (
                  <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-blue-400 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {hotspot.hazardNote}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
