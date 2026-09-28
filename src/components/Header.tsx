import React from 'react';
import { ShieldAlert, BookOpen, PhoneCall, RefreshCw, Compass, Bot } from 'lucide-react';
import { AlertLevel } from '../types/weather';

interface HeaderProps {
  unit: 'celsius' | 'fahrenheit';
  onToggleUnit: () => void;
  onOpenGuide: () => void;
  onOpenHotlines: () => void;
  onOpenChat?: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  alertLevel: AlertLevel;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onOpenGuide,
  onOpenHotlines,
  onOpenChat,
  onRefresh,
  isRefreshing = false,
  alertLevel,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-rose-600 shadow-lg shadow-blue-500/20">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
            {alertLevel === 'red_zone' && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-950"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ClimaSafe
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Global Radar
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              City Weather & Severe Hazard Protection Network
            </p>
          </div>
        </div>

        {/* Global Alert Status Pill */}
        <div className="hidden md:flex items-center">
          {alertLevel === 'red_zone' ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Active Red Zone Detected
              </span>
            </div>
          ) : alertLevel === 'warning' ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Weather Advisory Active
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-medium">Standard Meteorological Status</span>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Unit Toggle */}
          <button
            onClick={onToggleUnit}
            title="Toggle Temperature Unit"
            className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-bold text-slate-200 hover:text-white transition shadow-sm"
          >
            <span className={unit === 'celsius' ? 'text-blue-400 font-extrabold' : 'text-slate-400'}>°C</span>
            <span className="mx-1 text-slate-600">/</span>
            <span className={unit === 'fahrenheit' ? 'text-blue-400 font-extrabold' : 'text-slate-400'}>°F</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Atmospheric Data"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* AI Weather Chatbot Trigger */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              title="Open AI Weather & Safety Chatbot"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 hover:border-blue-500 text-xs font-semibold text-blue-300 hover:text-white transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">AI Chatbot</span>
            </button>
          )}

          {/* Emergency Hotline Button */}
          <button
            onClick={onOpenHotlines}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 hover:text-white transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>Hotlines</span>
          </button>

          {/* Safety Manual Modal */}
          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition transform active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disaster Protocols</span>
            <span className="sm:hidden">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
