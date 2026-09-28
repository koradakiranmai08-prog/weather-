import React from 'react';
import { X, PhoneCall, ShieldAlert, MapPin, Radio, Copy, Check } from 'lucide-react';
import { WeatherData, HazardEvaluation } from '../types/weather';

interface HotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
  hazard: HazardEvaluation;
}

export const HotlinesModal: React.FC<HotlinesModalProps> = ({
  isOpen,
  onClose,
  weather,
  hazard,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const copyNumber = (num: string, idx: number) => {
    navigator.clipboard.writeText(num);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Emergency Response & Helpline Directory
              </h2>
              <p className="text-xs text-slate-400">
                Direct dispatch numbers for {weather.location.name}, {weather.location.country}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Coordinates Info for Dispatchers */}
        <div className="p-4 mx-6 mt-6 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start space-x-3">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200">
            <span className="font-bold text-white">Your GPS Coordinates for Rescuers: </span>
            <span className="font-mono bg-blue-900/50 px-2 py-0.5 rounded text-blue-300">
              {weather.location.latitude.toFixed(4)}°N, {weather.location.longitude.toFixed(4)}°E
            </span>
            <p className="mt-1 text-slate-300">
              When reporting a cyclone, flood entrapment, or medical emergency, relay these exact coordinates to emergency dispatchers.
            </p>
          </div>
        </div>

        {/* Hotlines List */}
        <div className="p-6 space-y-3">
          {hazard.emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="text-sm font-bold text-white">{contact.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{contact.description}</div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm tracking-wide shadow-md shadow-rose-600/30 transition flex items-center space-x-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{contact.number}</span>
                </a>

                <button
                  onClick={() => copyNumber(contact.number, idx)}
                  title="Copy number"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Global Standard Fallback notice */}
        <div className="p-6 pt-0 text-xs text-slate-400">
          <p className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 leading-relaxed">
            <strong className="text-slate-200">Global GSM Standard:</strong> If local lines are congested, dial <strong>112</strong> on any mobile phone worldwide. Satellite SOS or emergency roaming will connect through any operational network carrier even without SIM credit.
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
