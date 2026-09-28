import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Wind,
  Droplets,
  Volume2,
  VolumeX,
  ArrowDown,
  PhoneForwarded,
  Layers,
  Radio,
} from 'lucide-react';
import { HazardEvaluation, WeatherData } from '../types/weather';

interface RedZoneAlertBannerProps {
  hazard: HazardEvaluation;
  weather: WeatherData;
  onScrollToPrecautions: () => void;
  onOpenHotlines: () => void;
}

export const RedZoneAlertBanner: React.FC<RedZoneAlertBannerProps> = ({
  hazard,
  weather,
  onScrollToPrecautions,
  onOpenHotlines,
}) => {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sirenIntervalRef = React.useRef<number | null>(null);

  const toggleEmergencyAudio = () => {
    if (isPlayingSiren) {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsPlayingSiren(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      setIsPlayingSiren(true);

      let high = false;
      const playChime = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(high ? 780 : 540, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
        high = !high;
      };

      playChime();
      sirenIntervalRef.current = window.setInterval(playChime, 650);

      // Auto shutoff after 12 seconds
      setTimeout(() => {
        if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setIsPlayingSiren(false);
      }, 12000);
    } catch (e) {
      console.warn('Audio not allowed or supported', e);
      setIsPlayingSiren(false);
    }
  };

  const isCyclone = hazard.primaryHazard === 'cyclone' || hazard.cycloneRiskScore >= 55;
  const isFlood = hazard.primaryHazard === 'flood' || hazard.floodRiskScore >= 55;

  const current = weather.current;
  const windGust = Math.round(current.wind_gusts_10m || current.wind_speed_10m * 1.3);
  const rainSum = Math.round(weather.daily.precipitation_sum?.[0] || current.rain * 4);

  return (
    <div className="w-full relative overflow-hidden rounded-3xl border-2 border-rose-500/80 bg-gradient-to-br from-rose-950/90 via-slate-950/95 to-red-950/80 shadow-[0_0_50px_rgba(239,68,68,0.25)] p-5 sm:p-8 animate-red-zone transition-all">
      {/* Background Warning Radar Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Warning Context */}
        <div className="space-y-3.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-rose-600/40">
              <AlertOctagon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              CRITICAL RED ZONE DECLARED
            </span>

            {isCyclone && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold tracking-wide">
                <Wind className="w-3.5 h-3.5 mr-1 text-rose-400" />
                Severe Cyclonic Danger
              </span>
            )}

            {isFlood && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold tracking-wide">
                <Droplets className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Catastrophic Inundation & Flash Flood
              </span>
            )}

            {hazard.evacuationAdvisory === 'mandatory_evacuation' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                Mandatory Evacuation Standby
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                High Disaster Readiness Level
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500 shrink-0 animate-bounce" />
              <span>
                {weather.location.name}: {hazard.hazardTitle}
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-rose-100/90 leading-relaxed font-medium">
              {hazard.hazardSummary}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-rose-500/30">
              <div className="text-[11px] font-semibold text-rose-300/80 flex items-center">
                <Wind className="w-3 h-3 mr-1 text-rose-400" />
                Peak Gusts
              </div>
              <div className="text-lg font-extrabold text-white">
                {windGust} <span className="text-xs font-normal text-rose-300">km/h</span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-rose-500/30">
              <div className="text-[11px] font-semibold text-rose-300/80 flex items-center">
                <Droplets className="w-3 h-3 mr-1 text-cyan-400" />
                24h Rain Vol
              </div>
              <div className="text-lg font-extrabold text-white">
                {rainSum} <span className="text-xs font-normal text-rose-300">mm</span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-rose-500/30">
              <div className="text-[11px] font-semibold text-rose-300/80 flex items-center">
                <Layers className="w-3 h-3 mr-1 text-amber-400" />
                Pressure
              </div>
              <div className="text-lg font-extrabold text-white">
                {Math.round(current.pressure_msl)} <span className="text-xs font-normal text-rose-300">hPa</span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-rose-500/30">
              <div className="text-[11px] font-semibold text-rose-300/80 flex items-center">
                <Radio className="w-3 h-3 mr-1 text-rose-400" />
                Hazard Index
              </div>
              <div className="text-lg font-extrabold text-rose-400">
                {Math.max(hazard.cycloneRiskScore, hazard.floodRiskScore)}% <span className="text-xs font-normal text-rose-300">Severity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[240px]">
          <button
            onClick={onScrollToPrecautions}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/40 hover:shadow-rose-600/60 transition active:scale-95"
          >
            <span>Review Life-Saving Actions</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <button
            onClick={onOpenHotlines}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-rose-200 border border-rose-500/40 text-sm font-semibold transition"
          >
            <PhoneForwarded className="w-4 h-4 text-rose-400" />
            <span>Emergency Hotlines</span>
          </button>

          <button
            onClick={toggleEmergencyAudio}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              isPlayingSiren
                ? 'bg-rose-500/30 text-rose-200 border-rose-400 animate-pulse'
                : 'bg-slate-950/70 text-slate-300 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {isPlayingSiren ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Silence Audio Alarm</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Test Auditory Siren</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
