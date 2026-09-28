import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { GeoLocation, WeatherData, HazardEvaluation, HazardType } from './types/weather';
import { POPULAR_CITIES, fetchWeatherData, reverseGeocode } from './services/weatherService';
import { evaluateHazards } from './services/safetyEngine';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { RedZoneAlertBanner } from './components/RedZoneAlertBanner';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { PrecautionsPanel } from './components/PrecautionsPanel';
import { HazardMap } from './components/HazardMap';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { EmergencyGuideModal } from './components/EmergencyGuideModal';
import { HotlinesModal } from './components/HotlinesModal';
import { GlobalHotspotsBar } from './components/GlobalHotspotsBar';
import { WeatherChatbot } from './components/WeatherChatbot';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation>(POPULAR_CITIES[1]); // Miami default
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hazardEvaluation, setHazardEvaluation] = useState<HazardEvaluation | null>(null);
  const [simulationMode, setSimulationMode] = useState<HazardType>('none');
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHotlinesOpen, setIsHotlinesOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load weather
  const loadWeather = useCallback(async (location: GeoLocation, simMode?: HazardType) => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
      const hazard = evaluateHazards(data, simMode ?? simulationMode);
      setHazardEvaluation(hazard);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to retrieve meteorological data for this location.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [simulationMode]);

  // Initial load
  useEffect(() => {
    loadWeather(selectedLocation, simulationMode);
  }, [selectedLocation, loadWeather]);

  // When simulation mode toggles, update hazard evaluation immediately
  const handleSelectSimulation = (mode: HazardType) => {
    setSimulationMode(mode);
    if (weatherData) {
      const hazard = evaluateHazards(weatherData, mode);
      setHazardEvaluation(hazard);
    }
  };

  // City selection
  const handleSelectCity = (location: GeoLocation) => {
    setSelectedLocation(location);
    loadWeather(location, simulationMode);
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          setSelectedLocation(loc);
          await loadWeather(loc, simulationMode);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
        alert('Could not obtain your location. Please check your browser permissions or use the search bar.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleScrollToPrecautions = () => {
    const el = document.getElementById('precautions-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        unit={unit}
        onToggleUnit={toggleUnit}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHotlines={() => setIsHotlinesOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onRefresh={() => loadWeather(selectedLocation, simulationMode)}
        isRefreshing={isRefreshing}
        alertLevel={hazardEvaluation?.alertLevel ?? 'safe'}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Location Bar */}
        <section>
          <SearchBar
            currentLocation={selectedLocation}
            onSelectCity={handleSelectCity}
            onDetectLocation={handleDetectLocation}
            isLocating={isLocating}
            simulationMode={simulationMode}
            onSelectSimulation={handleSelectSimulation}
          />
        </section>

        {/* Global Hotspots Ticker / Watchlist */}
        <section>
          <GlobalHotspotsBar
            currentCityName={selectedLocation.name}
            onSelectCity={handleSelectCity}
          />
        </section>

        {/* Error State */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => loadWeather(selectedLocation, simulationMode)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !weatherData && (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">
              Synchronizing atmospheric telemetry and hazard radar...
            </p>
          </div>
        )}

        {/* Weather Dashboard When Data Available */}
        {weatherData && hazardEvaluation && (
          <div className="space-y-6">
            {/* 1. Red Zone Banner (Only displayed if cyclone, flood or severe hazard is detected or simulated) */}
            {hazardEvaluation.isRedZone && (
              <section>
                <RedZoneAlertBanner
                  hazard={hazardEvaluation}
                  weather={weatherData}
                  onScrollToPrecautions={handleScrollToPrecautions}
                  onOpenHotlines={() => setIsHotlinesOpen(true)}
                />
              </section>
            )}

            {/* 2. Hero Current Weather Card */}
            <section>
              <CurrentWeatherCard
                weather={weatherData}
                hazard={hazardEvaluation}
                unit={unit}
              />
            </section>

            {/* 3. Comprehensive Weather Metrics Grid */}
            <section>
              <WeatherMetricsGrid
                weather={weatherData}
                hazard={hazardEvaluation}
                unit={unit}
              />
            </section>

            {/* 4. Spatial Hazard Radar Map & 24h Hourly Forecast */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Map */}
              <div className="space-y-2">
                <HazardMap
                  weather={weatherData}
                  hazard={hazardEvaluation}
                />
              </div>

              {/* 24-Hour & 7-Day Forecast Tabs / Stacks */}
              <div className="space-y-6">
                <HourlyForecast
                  weather={weatherData}
                  unit={unit}
                />
                <DailyForecast
                  daily={weatherData.daily}
                  unit={unit}
                />
              </div>
            </section>

            {/* 5. City-Specific Precautions Panel (Core User Requirement) */}
            <section>
              <PrecautionsPanel
                hazard={hazardEvaluation}
                weather={weatherData}
                onOpenHotlines={() => setIsHotlinesOpen(true)}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">ClimaSafe Global</span>
            <span>•</span>
            <span>Worldwide Meteorological & Red Zone Protection System</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-blue-400 transition"
            >
              Disaster Protocols
            </button>
            <button
              onClick={() => setIsHotlinesOpen(true)}
              className="hover:text-blue-400 transition"
            >
              Emergency Hotlines
            </button>
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              Data by Open-Meteo
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Emergency Guide Modal */}
      <EmergencyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Hotlines Modal */}
      {weatherData && hazardEvaluation && (
        <HotlinesModal
          isOpen={isHotlinesOpen}
          onClose={() => setIsHotlinesOpen(false)}
          weather={weatherData}
          hazard={hazardEvaluation}
        />
      )}

      {/* Weather AI Chatbot connected to n8n Webhook */}
      <WeatherChatbot
        weather={weatherData}
        hazard={hazardEvaluation}
        isOpen={isChatOpen}
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
