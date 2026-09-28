import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Wind,
  Droplets,
  Flame,
  CloudLightning,
  Package,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyGuideModal: React.FC<EmergencyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'cyclone' | 'flood' | 'heat' | 'storm' | 'kit'>('cyclone');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Disaster Safety Handbook & Protocols
              </h2>
              <p className="text-xs text-slate-400">
                Official civil protection, meteorological survival, and Red Zone response guidelines
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

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-4 border-b border-slate-800/80 overflow-x-auto scrollbar-none bg-slate-950/40">
          <button
            onClick={() => setActiveTab('cyclone')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'cyclone'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4 text-rose-400" />
            <span>Cyclones & Typhoons (Red Zone)</span>
          </button>

          <button
            onClick={() => setActiveTab('flood')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'flood'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Flash Floods & Inundation</span>
          </button>

          <button
            onClick={() => setActiveTab('storm')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'storm'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudLightning className="w-4 h-4 text-amber-400" />
            <span>Severe Storms & Lightning</span>
          </button>

          <button
            onClick={() => setActiveTab('heat')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'heat'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Extreme Heatwaves</span>
          </button>

          <button
            onClick={() => setActiveTab('kit')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'kit'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span>72-Hour Survival Kit</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'cyclone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-300">Cyclone Red Zone Criteria</h4>
                  <p className="text-xs text-rose-200/90 mt-1">
                    Marked when sustained winds exceed 65 km/h, gusts exceed 85 km/h, barometric pressure plunges below 995 hPa, or an official tropical cyclone landfall warning is active.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white flex items-center">
                    <ShieldCheck className="w-4 h-4 text-blue-400 mr-2" />
                    Pre-Landfall Precautions (24 - 48 Hours)
                  </h5>
                  <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                    <li>Trim hanging tree branches near roofing, power cables, and vehicles.</li>
                    <li>Fasten aluminum storm shutters or board windows with marine plywood.</li>
                    <li>Anchor external loose objects: propane tanks, water barrels, garbage receptacles.</li>
                    <li>Top off vehicle fuel tanks and charge all lithium power banks.</li>
                    <li>Know your designated municipal evacuation center route.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white flex items-center">
                    <AlertTriangle className="w-4 h-4 text-rose-400 mr-2" />
                    During Landfall & Storm Eye Warning
                  </h5>
                  <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                    <li>Retreat to an interior room, hallway, or under stairwells with zero exterior glass.</li>
                    <li><strong className="text-rose-300">EYE OF THE STORM:</strong> If wind suddenly ceases, do not go outside. The eye will pass and hurricane-force winds will violently reverse in opposite direction.</li>
                    <li>Shut off main power circuit breakers if roof or window seals fail.</li>
                    <li>Keep battery radio tuned to emergency broadcast channels.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flood' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-cyan-300">Flash Flood Red Zone Criteria</h4>
                  <p className="text-xs text-cyan-200/90 mt-1">
                    Marked when accumulated 24-hour rainfall exceeds 50–70 mm, cloudburst showers occur, or river overflow/storm surge models threaten low-lying residential sectors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">"Turn Around, Don't Drown" Golden Rule</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Over 50% of all flood-related fatalities occur in vehicles. Never attempt to drive through water-covered roads or underpasses. Pavement may have eroded beneath the surface, or the vehicle may be lifted and swept into canals.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-400">
                    • 15 cm (6 in) sweeps pedestrians off feet<br />
                    • 30 cm (12 in) floats compact sedans<br />
                    • 60 cm (24 in) sweeps heavy SUVs & trucks
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">Electrical & Contamination Hazards</h5>
                  <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                    <li>Never touch electrical fixtures or appliances while standing in standing water.</li>
                    <li>Assume all downed utility poles and sagging wires are energized and lethal.</li>
                    <li>Avoid direct contact with floodwaters which carry sewage, industrial chemicals, and displaced venomous reptiles.</li>
                    <li>Disinfect and boil all drinking water before consumption.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">Severe Thunderstorm & Lightning Protocol</h4>
                  <p className="text-xs text-amber-200/90 mt-1">
                    Lightning can strike up to 15 kilometers away from the rain core. When thunder roars, go indoors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">The 30-30 Rule</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Count seconds between lightning flash and thunder sound. If less than 30 seconds, the strike is within 10 km. Immediately seek shelter in a substantial enclosed building or hard-topped metal vehicle. Stay indoors until 30 minutes after the last thunderclap.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">Indoor Precautions</h5>
                  <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                    <li>Unplug high-value computers, TVs, and air conditioners to prevent surge burnout.</li>
                    <li>Avoid using corded plumbing fixtures (sinks, baths, showers) as metal pipes conduct strikes.</li>
                    <li>Stay clear of concrete walls and foundations with embedded steel rebar.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heat' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-orange-300">Heatwave & Thermal Emergency Guidelines</h4>
                  <p className="text-xs text-orange-200/90 mt-1">
                    High temperatures combined with humidity create lethal heat indices that disrupt the body's natural evaporative cooling mechanisms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">Recognizing Heatstroke vs Heat Exhaustion</h5>
                  <div className="text-xs space-y-2">
                    <p><strong className="text-amber-400">Heat Exhaustion:</strong> Heavy sweating, pale clammy skin, fast weak pulse, nausea, muscle cramps. Move to shade, sip cool water, loosen clothing.</p>
                    <p><strong className="text-rose-400">Heatstroke (Medical Emergency):</strong> High core temp (&gt;40°C), hot red dry or damp skin, confusion, fainting, vomiting. Call emergency dispatch immediately; apply ice packs to neck, armpits, and groin.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-white">Hydration & Shelter Rules</h5>
                  <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                    <li>Drink 250ml of water or electrolyte solution every 20-30 minutes of exertion.</li>
                    <li>Avoid caffeinated sodas and alcohol, which exacerbate cellular dehydration.</li>
                    <li>Never leave children, disabled individuals, or pets in locked parked vehicles for any duration.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start space-x-3">
                <Package className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-300">72-Hour Rapid Evacuation Go-Bag Packing List</h4>
                  <p className="text-xs text-purple-200/90 mt-1">
                    Essential provisions required to sustain a family during the first 72 hours following a disaster before external relief arrives.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-blue-400">Sustenance</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    <li>4L water/person/day</li>
                    <li>Non-perishable canned food</li>
                    <li>Energy bars & dried fruits</li>
                    <li>Manual can opener</li>
                    <li>Water purification tablets</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400">Survival & Power</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    <li>High-lumen LED flashlight</li>
                    <li>Hand-crank NOAA radio</li>
                    <li>20,000mAh Power banks & cables</li>
                    <li>Multi-tool or swiss army knife</li>
                    <li>Emergency thermal foil blankets</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-400">Medical & Documents</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    <li>Comprehensive First Aid kit</li>
                    <li>7-day prescription medicines</li>
                    <li>Waterproof document pouch</li>
                    <li>Photocopies of IDs & insurance</li>
                    <li>Emergency cash in small bills</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compliant with WMO, NOAA, and National Disaster Management Frameworks.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
