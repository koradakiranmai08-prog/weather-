import React from 'react';
import {
  Wind,
  Droplets,
  Gauge,
  Sun,
  ShieldAlert,
  Waves,
  Cloud,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { WeatherData, HazardEvaluation } from '../types/weather';

interface WeatherMetricsGridProps {
  weather: WeatherData;
  hazard: HazardEvaluation;
  unit: 'celsius' | 'fahrenheit';
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  weather,
  hazard,
  unit,
}) => {
  const current = weather.current;
  const daily = weather.daily;
  const aqi = weather.airQuality?.us_aqi;
  const uv = daily.uv_index_max?.[0] ?? 4;
  const rainSum = daily.precipitation_sum?.[0] ?? current.rain * 4;
  const rainProb = daily.precipitation_probability_max?.[0] ?? (current.precipitation > 0 ? 80 : 20);

  // Wind speed conversion if needed
  const windSpeedKmH = Math.round(current.wind_speed_10m);
  const windGustKmH = Math.round(current.wind_gusts_10m || current.wind_speed_10m * 1.3);

  const getWindDirectionName = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
  };

  const getAQIDescription = (val?: number) => {
    if (!val) return { label: 'Good (Est)', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (val <= 50) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (val <= 100) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (val <= 150) return { label: 'Sensitive', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (val <= 200) return { label: 'Unhealthy', color: 'text-rose-400', bg: 'bg-rose-500/10' };
    return { label: 'Hazardous', color: 'text-purple-400', bg: 'bg-purple-500/10' };
  };

  const getUVDescription = (val: number) => {
    if (val <= 2) return { label: 'Low', color: 'text-emerald-400' };
    if (val <= 5) return { label: 'Moderate', color: 'text-amber-400' };
    if (val <= 7) return { label: 'High', color: 'text-orange-400' };
    if (val <= 10) return { label: 'Very High', color: 'text-rose-400' };
    return { label: 'Extreme', color: 'text-purple-400' };
  };

  const aqiInfo = getAQIDescription(aqi);
  const uvInfo = getUVDescription(uv);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Flood Risk Indicator */}
      <div className={`p-5 rounded-2xl border transition-all ${
        hazard.floodRiskScore >= 60
          ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-cyan-400" />
            Flood Risk Assessment
          </span>
          {hazard.floodRiskScore >= 60 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              RED ZONE RISK
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-black text-white">
            {hazard.floodRiskScore}%
          </div>
          <span className={`text-xs font-bold ${
            hazard.floodRiskScore >= 60
              ? 'text-rose-400'
              : hazard.floodRiskScore >= 35
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {hazard.floodRiskScore >= 60
              ? 'Critical Flash Danger'
              : hazard.floodRiskScore >= 35
              ? 'Moderate Inundation'
              : 'Minimal Flood Risk'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              hazard.floodRiskScore >= 60
                ? 'bg-rose-500'
                : hazard.floodRiskScore >= 35
                ? 'bg-amber-400'
                : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.max(5, hazard.floodRiskScore)}%` }}
          />
        </div>

        <p className="mt-2.5 text-[11px] text-slate-400">
          24h Rain: <strong className="text-slate-200">{rainSum.toFixed(1)} mm</strong> • Precip Prob: <strong className="text-slate-200">{rainProb}%</strong>
        </p>
      </div>

      {/* 2. Cyclone / Wind Threat */}
      <div className={`p-5 rounded-2xl border transition-all ${
        hazard.cycloneRiskScore >= 60
          ? 'bg-gradient-to-br from-rose-950/80 to-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/40'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-blue-400" />
            Wind & Cyclone Threat
          </span>
          {hazard.cycloneRiskScore >= 60 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              CYCLONE RED ZONE
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-black text-white">
            {windSpeedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <span className="text-xs text-slate-300 font-semibold flex items-center">
            <Compass className="w-3 h-3 mr-1 text-slate-400" />
            {getWindDirectionName(current.wind_direction_10m)} ({Math.round(current.wind_direction_10m)}°)
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              windGustKmH >= 80 ? 'bg-rose-500' : windGustKmH >= 50 ? 'bg-amber-400' : 'bg-blue-400'
            }`}
            style={{ width: `${Math.min(100, (windGustKmH / 120) * 100)}%` }}
          />
        </div>

        <p className="mt-2.5 text-[11px] text-slate-400">
          Max Gusts: <strong className="text-rose-300">{windGustKmH} km/h</strong> • Risk Score: <strong className="text-slate-200">{hazard.cycloneRiskScore}/100</strong>
        </p>
      </div>

      {/* 3. Barometric Pressure */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-purple-400" />
            Atmospheric Pressure
          </span>
          {current.pressure_msl < 995 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
              DEEP DEPRESSION
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-black text-white">
            {Math.round(current.pressure_msl)} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <span className={`text-xs font-medium ${
            current.pressure_msl < 995
              ? 'text-rose-400 font-bold'
              : current.pressure_msl < 1010
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {current.pressure_msl < 995 ? 'Severe Low' : current.pressure_msl > 1020 ? 'High Stability' : 'Standard'}
          </span>
        </div>

        <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
          {current.pressure_msl < 995
            ? 'Intense cyclonic depression vortex indicates incoming squalls.'
            : 'Normal barometric pressure gradient across the sector.'}
        </p>
      </div>

      {/* 4. Air Quality & Humidity */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Humidity & Air Quality
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aqiInfo.bg} ${aqiInfo.color}`}>
            AQI {aqi ?? 35}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-black text-white">
            {Math.round(current.relative_humidity)}% <span className="text-xs font-normal text-slate-400">Humidity</span>
          </div>
          <span className={`text-xs font-semibold ${aqiInfo.color}`}>
            {aqiInfo.label}
          </span>
        </div>

        <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
          Cloud Cover: <strong className="text-slate-200">{Math.round(current.cloud_cover)}%</strong> • UV Index: <strong className={uvInfo.color}>{uv.toFixed(1)} ({uvInfo.label})</strong>
        </p>
      </div>
    </div>
  );
};
