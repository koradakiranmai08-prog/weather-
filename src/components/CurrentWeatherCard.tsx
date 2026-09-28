import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  Wind,
  Droplets,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { WeatherData, HazardEvaluation } from '../types/weather';
import { getWeatherConditionInfo } from '../services/weatherService';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  hazard: HazardEvaluation;
  unit: 'celsius' | 'fahrenheit';
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  hazard,
  unit,
}) => {
  const current = weather.current;
  const location = weather.location;
  const condition = getWeatherConditionInfo(current.weather_code, current.is_day);

  // Unit conversion
  const formatTemp = (celsius: number) => {
    if (unit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const getConditionIcon = (category: string, size = 'w-16 h-16') => {
    switch (category) {
      case 'clear':
        return current.is_day ? (
          <Sun className={`${size} text-amber-400 animate-spin-slow`} />
        ) : (
          <CloudSun className={`${size} text-indigo-300`} />
        );
      case 'cloudy':
        return <Cloud className={`${size} text-slate-300`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${size} text-cyan-300`} />;
      case 'rain':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'storm':
        return <CloudLightning className={`${size} text-amber-400 animate-pulse`} />;
      case 'snow':
        return <CloudSnow className={`${size} text-blue-200`} />;
      default:
        return <CloudSun className={`${size} text-blue-300`} />;
    }
  };

  const maxTemp = weather.daily.temperature_2m_max?.[0] ?? current.temperature + 3;
  const minTemp = weather.daily.temperature_2m_min?.[0] ?? current.temperature - 4;

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all ${
      hazard.isRedZone
        ? 'bg-slate-900/90 border-rose-500/50 shadow-2xl shadow-rose-950/40'
        : hazard.alertLevel === 'warning'
        ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-950/20'
        : 'bg-slate-900/80 border-slate-800 shadow-xl shadow-black/40'
    }`}>
      {/* Subtle atmospheric ambient glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
        hazard.isRedZone
          ? 'bg-rose-600/10'
          : current.is_day
          ? 'bg-blue-500/10'
          : 'bg-indigo-600/10'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Location & Details */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-400" />
              {location.country_code}
            </span>

            {/* Alert Status Pill */}
            {hazard.isRedZone ? (
              <span className="flex items-center text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-400 animate-pulse" />
                RED ZONE AREA
              </span>
            ) : hazard.alertLevel === 'warning' ? (
              <span className="flex items-center text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
                ADVISORY WATCH
              </span>
            ) : (
              <span className="flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                FAVORABLE CONDITION
              </span>
            )}

            <span className="flex items-center text-xs text-slate-400">
              <Clock className="w-3 h-3 mr-1" />
              Observed Live
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {location.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
              {[location.admin1, location.country].filter(Boolean).join(', ')} •{' '}
              <span className="font-mono text-xs text-slate-500">
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-4 pt-1">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 text-sm font-semibold text-slate-200 border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              {condition.label}
            </span>

            <div className="flex items-center space-x-3 text-xs font-medium text-slate-400">
              <span className="flex items-center text-rose-400">
                <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                {formatTemp(maxTemp)}
              </span>
              <span className="flex items-center text-blue-400">
                <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                {formatTemp(minTemp)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Big Temperature Display & Condition Icon */}
        <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex flex-col items-start md:items-end">
            <div className="text-5xl sm:text-7xl font-black tracking-tighter text-white">
              {formatTemp(current.temperature)}
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              Feels like <span className="text-slate-200 font-bold">{formatTemp(current.apparent_temperature)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-inner flex items-center justify-center">
            {getConditionIcon(condition.category, 'w-16 h-16 sm:w-20 sm:h-20')}
          </div>
        </div>
      </div>
    </div>
  );
};
