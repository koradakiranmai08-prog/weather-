import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, AlertTriangle, ShieldCheck, Flame, CloudRain } from 'lucide-react';
import { GeoLocation, HazardType } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/weatherService';

interface SearchBarProps {
  currentLocation: GeoLocation;
  onSelectCity: (location: GeoLocation) => void;
  onDetectLocation: () => void;
  isLocating: boolean;
  simulationMode?: HazardType;
  onSelectSimulation: (mode: HazardType) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentLocation,
  onSelectCity,
  onDetectLocation,
  isLocating,
  simulationMode = 'none',
  onSelectSimulation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const found = await searchCities(query);
        setResults(found);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    onSelectCity(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Search Input Box */}
      <div ref={searchContainerRef} className="relative z-30">
        <div className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition duration-200">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search any city worldwide (e.g. Miami, Mumbai, Tokyo, London, Manila)..."
            className="w-full py-4 pr-10 text-sm sm:text-base font-medium text-white placeholder-slate-400 bg-transparent focus:outline-none"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="p-1.5 mr-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="pr-2 border-l border-slate-800 flex items-center">
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={isLocating}
              title="Detect your current city"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs sm:text-sm font-semibold border border-blue-500/30 hover:border-blue-500/50 transition disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">My Location</span>
            </button>
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && (query.trim().length >= 2 || results.length > 0) && (
          <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-slate-400">
                <div className="inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2 align-middle"></div>
                Searching global meteorological registry...
              </div>
            ) : results.length > 0 ? (
              results.map((loc, idx) => (
                <button
                  key={`${loc.latitude}-${loc.longitude}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-600/10 hover:border-blue-500/30 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-400 group-hover:scale-110 transition shrink-0" />
                    <div>
                      <span className="font-semibold text-white group-hover:text-blue-300">
                        {loc.name}
                      </span>
                      {loc.admin1 && (
                        <span className="text-xs text-slate-400 ml-1.5">
                          {loc.admin1},
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-1.5 font-medium">
                        {loc.country}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">
                No matching cities found. Try another city name.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Select Cities & Scenario Testing Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
        {/* Popular Cities */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-slate-400 font-medium shrink-0 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-slate-500" />
            Quick:
          </span>
          {POPULAR_CITIES.slice(0, 6).map((city) => {
            const isActive =
              currentLocation.name.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                onClick={() => handleSelect(city)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-500/60 text-blue-300 font-semibold'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* Red Zone Hazard Testing / Simulation Selector */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-1.5 flex items-center">
            <AlertTriangle className="w-3 h-3 text-amber-400 mr-1" />
            Simulate Hazard:
          </span>
          <button
            onClick={() => onSelectSimulation('none')}
            title="Use live real-time Open-Meteo weather data"
            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition flex items-center space-x-1 ${
              simulationMode === 'none'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Live Data</span>
          </button>
          <button
            onClick={() => onSelectSimulation('cyclone')}
            title="Simulate Red Zone: Category 3+ Cyclone with 118 km/h gusts and severe low pressure"
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
              simulationMode === 'cyclone'
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/60 shadow-sm'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Cyclone (Red Zone)</span>
          </button>
          <button
            onClick={() => onSelectSimulation('flood')}
            title="Simulate Red Zone: Flash Flood with 135mm rain and cloudburst inundation"
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
              simulationMode === 'flood'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 shadow-sm'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <CloudRain className="w-3 h-3 text-cyan-400" />
            <span>Flood (Red Zone)</span>
          </button>
          <button
            onClick={() => onSelectSimulation('extreme_heat')}
            title="Simulate Heatwave: 42.5°C thermal emergency"
            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition hidden md:flex items-center space-x-1 ${
              simulationMode === 'extreme_heat'
                ? 'bg-orange-500/30 text-orange-300 border border-orange-500/60'
                : 'text-slate-400 hover:text-orange-300'
            }`}
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Heatwave</span>
          </button>
        </div>
      </div>
    </div>
  );
};
