import React from 'react';
import { Clock, Droplets, Wind, Sun, CloudRain, CloudLightning, CloudSnow, Cloud } from 'lucide-react';
import { WeatherData } from '../types/weather';
import { getWeatherConditionInfo } from '../services/weatherService';

interface HourlyForecastProps {
  weather: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather, unit }) => {
  const hourly = weather.hourly;

  const formatTemp = (celsius: number) => {
    if (unit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const formatHour = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString.slice(11, 16);
    }
  };

  const getMiniIcon = (code: number) => {
    const info = getWeatherConditionInfo(code);
    switch (info.category) {
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'storm':
        return <CloudLightning className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'snow':
        return <CloudSnow className="w-5 h-5 text-cyan-200" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            24-Hour Atmospheric Outlook & Rain Probability
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Hourly Track</span>
      </div>

      <div className="flex items-stretch space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
        {hourly.time.map((time, idx) => {
          const temp = hourly.temperature_2m[idx];
          const prob = hourly.precipitation_probability[idx] ?? 0;
          const gusts = Math.round(hourly.wind_gusts_10m?.[idx] ?? hourly.wind_speed_10m[idx] * 1.3);
          const isHighRisk = prob >= 70 || gusts >= 65;

          return (
            <div
              key={time}
              className={`flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-2xl border transition min-w-[85px] ${
                isHighRisk
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold text-slate-400">
                {idx === 0 ? 'Now' : formatHour(time)}
              </span>

              <div className="my-2.5">
                {getMiniIcon(hourly.weather_code[idx])}
              </div>

              <span className="text-base font-extrabold text-white">
                {formatTemp(temp)}
              </span>

              {/* Rain Chance Bar */}
              <div className="mt-2 w-full flex flex-col items-center">
                <span className="text-[10px] font-bold text-cyan-400 flex items-center">
                  <Droplets className="w-2.5 h-2.5 mr-0.5" />
                  {prob}%
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full ${prob >= 60 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.max(4, prob)}%` }}
                  />
                </div>
              </div>

              {/* Gusts */}
              <span className="mt-2 text-[10px] text-slate-500 flex items-center">
                <Wind className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                {gusts}k
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
