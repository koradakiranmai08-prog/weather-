import React from 'react';
import { Calendar, Droplets, Wind, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DailyForecastData } from '../types/weather';
import { getWeatherConditionInfo } from '../services/weatherService';

interface DailyForecastProps {
  daily: DailyForecastData;
  unit: 'celsius' | 'fahrenheit';
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  const formatTemp = (celsius: number) => {
    if (unit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const getDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Find min and max for range bar
  const allMax = Math.max(...(daily.temperature_2m_max || [30]));
  const allMin = Math.min(...(daily.temperature_2m_min || [10]));
  const totalRange = Math.max(1, allMax - allMin);

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            7-Day Synoptic Weather & Severe Event Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-400">Extended Forecast</span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {daily.time.slice(0, 7).map((date, idx) => {
          const code = daily.weather_code[idx];
          const info = getWeatherConditionInfo(code);
          const maxT = daily.temperature_2m_max[idx];
          const minT = daily.temperature_2m_min[idx];
          const rainSum = daily.precipitation_sum?.[idx] ?? 0;
          const prob = daily.precipitation_probability_max?.[idx] ?? 0;
          const windGust = Math.round(daily.wind_gusts_10m_max?.[idx] ?? 30);

          const isCritical = rainSum >= 45 || windGust >= 75;
          const isWarning = rainSum >= 20 || windGust >= 50;

          // Bar calculation
          const leftPercent = ((minT - allMin) / totalRange) * 100;
          const widthPercent = Math.max(8, ((maxT - minT) / totalRange) * 100);

          return (
            <div
              key={date}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                isCritical ? 'bg-rose-950/15 -mx-2 px-2 rounded-xl' : ''
              }`}
            >
              {/* Day & Condition */}
              <div className="flex items-center space-x-3 sm:w-52">
                <span className="text-xs sm:text-sm font-bold text-white w-24">
                  {getDayName(date, idx)}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {info.label}
                </span>
              </div>

              {/* Rain & Wind Telemetry */}
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center text-cyan-400 font-semibold w-16">
                  <Droplets className="w-3.5 h-3.5 mr-1" />
                  {prob}%
                  {rainSum > 1 && (
                    <span className="text-[10px] text-slate-400 ml-1">({rainSum.toFixed(0)}m)</span>
                  )}
                </span>

                <span className="flex items-center text-slate-400 w-16">
                  <Wind className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {windGust} km/h
                </span>

                {/* Risk Tag */}
                <div className="w-24 text-right">
                  {isCritical ? (
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1 text-rose-400" />
                      Red Alert
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Advisory
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Favorable
                    </span>
                  )}
                </div>
              </div>

              {/* Min/Max Temperature Bar */}
              <div className="flex items-center space-x-3 sm:w-48 justify-end">
                <span className="text-xs text-slate-400 font-semibold w-8 text-right">
                  {formatTemp(minT)}
                </span>

                <div className="w-28 bg-slate-800 h-2 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-amber-400 to-rose-400 rounded-full"
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  />
                </div>

                <span className="text-xs text-white font-bold w-8">
                  {formatTemp(maxT)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
