import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Home,
  Car,
  HeartPulse,
  PackageCheck,
  Printer,
  Share2,
  PhoneCall,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Wrench,
  Sparkles,
  ArrowRightCircle,
  HelpCircle,
} from 'lucide-react';
import { HazardEvaluation, PrecautionItem, WeatherData } from '../types/weather';

interface PrecautionsPanelProps {
  hazard: HazardEvaluation;
  weather: WeatherData;
  onOpenHotlines: () => void;
}

export const PrecautionsPanel: React.FC<PrecautionsPanelProps> = ({
  hazard,
  weather,
  onOpenHotlines,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [appliedSteps, setAppliedSteps] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleCheck = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSolution = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleStepApplied = (key: string, itemId: string, totalSteps: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAppliedSteps((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Check if all steps for this item are now applied
      let allDone = true;
      for (let i = 1; i <= totalSteps; i++) {
        if (!next[`${itemId}-${i}`]) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        setCompletedItems((c) => ({ ...c, [itemId]: true }));
      }
      return next;
    });
  };

  const applyAllResolutions = (itemId: string, totalSteps: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAppliedSteps((prev) => {
      const next = { ...prev };
      for (let i = 1; i <= totalSteps; i++) {
        next[`${itemId}-${i}`] = true;
      }
      return next;
    });
    setCompletedItems((c) => ({ ...c, [itemId]: true }));
  };

  const categories = [
    'All',
    'Immediate Safety',
    'Home & Property',
    'Travel & Transit',
    'Health & Water',
    'Disaster Kit',
  ];

  const filteredPrecautions = hazard.precautions.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const completedCount = hazard.precautions.filter((p) => completedItems[p.id]).length;
  const totalCount = hazard.precautions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `🚨 Safety Precautions for ${weather.location.name} (${hazard.hazardTitle}). Check ClimaSafe for active Red Zone & weather advisories!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather Precautions: ${weather.location.name}`,
          text,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Immediate Safety':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Home & Property':
        return <Home className="w-4 h-4 text-blue-400" />;
      case 'Travel & Transit':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'Health & Water':
        return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      case 'Disaster Kit':
        return <PackageCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case 'physical':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'equipment':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'medical':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'infrastructure':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'communication':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div id="precautions-section" className="space-y-6">
      {/* Header with Title and Readiness Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Safety Precautions & Problem Resolution System
            </h2>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Tailored emergency advisories for{' '}
            <span className="font-semibold text-white">{weather.location.name}</span> with actionable root problem resolution steps.
          </p>
        </div>

        {/* Readiness Meter & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Progress Pill */}
          <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Resolutions Applied</div>
              <div className="text-xs font-bold text-white">
                {completedCount} of {totalCount} completed ({progressPercent}%)
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400 border border-blue-500/30">
              {progressPercent}%
            </div>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            title="Print or Save Safety Briefing"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Plan</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Share safety alert"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition border border-blue-500/30"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Share Alert'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === 'All'
              ? hazard.precautions.length
              : hazard.precautions.filter((p) => p.category === cat).length;

          if (count === 0 && cat !== 'All') return null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Precautions Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrecautions.map((item) => {
          const isDone = completedItems[item.id] || false;
          const isExpanded = expandedSolutions[item.id] || false;
          const isCritical = item.urgency === 'critical';
          const isHigh = item.urgency === 'high';
          const steps = item.resolutionSteps || [];
          const stepCount = steps.length;
          const appliedCount = steps.filter((_, i) => appliedSteps[`${item.id}-${i + 1}`]).length;

          return (
            <div
              key={item.id}
              className={`group relative p-5 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-900/40 border-slate-800/80'
                  : isCritical
                  ? 'bg-gradient-to-br from-rose-950/40 to-slate-900/90 border-rose-500/60 shadow-md shadow-rose-950/20 hover:border-rose-400'
                  : isHigh
                  ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                      {getCategoryIcon(item.category)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Urgency Badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      }`}
                    >
                      {item.urgency}
                    </span>

                    {/* Overall Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      title={isDone ? 'Mark as unresolved' : 'Mark as resolved'}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-700 hover:border-slate-400 bg-slate-950/60'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Precaution Title & Basic Description */}
                <div className="mt-3">
                  <h3
                    className={`text-sm sm:text-base font-bold transition ${
                      isDone ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1 text-xs sm:text-sm leading-relaxed transition ${
                      isDone ? 'text-slate-500' : 'text-slate-300/90'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Root Problem Identified Box */}
                {item.problemSummary && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center text-amber-400 font-semibold mb-1">
                      <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      Root Hazard / Problem
                    </div>
                    <p className="text-slate-400 leading-normal">
                      {item.problemSummary}
                    </p>
                  </div>
                )}

                {/* Step-by-Step Resolution Action Section */}
                {steps.length > 0 && (
                  <div className="mt-3.5 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => toggleSolution(item.id, e)}
                        className="flex items-center space-x-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Resolution Plan ({appliedCount}/{stepCount} applied)</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>

                      {/* Apply All Action Button */}
                      {!isDone && (
                        <button
                          type="button"
                          onClick={(e) => applyAllResolutions(item.id, stepCount, e)}
                          className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Apply All Steps</span>
                        </button>
                      )}
                    </div>

                    {/* Expanded Steps List */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {steps.map((st) => {
                          const stepKey = `${item.id}-${st.step}`;
                          const isApplied = appliedSteps[stepKey] || false;

                          return (
                            <div
                              key={st.step}
                              onClick={(e) => toggleStepApplied(stepKey, item.id, stepCount, e)}
                              className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2.5 transition cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                    isApplied
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isApplied ? <Check className="w-3 h-3" /> : st.step}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span
                                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getActionBadgeColor(
                                        st.actionType
                                      )}`}
                                    >
                                      {st.actionType}
                                    </span>
                                  </div>
                                  <p className={isApplied ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}>
                                    {st.instruction}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 transition ${
                                  isApplied
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                                }`}
                              >
                                {isApplied ? 'Applied' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom footer for precaution card */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span className="flex items-center">
                  {isDone ? (
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Resolution Applied & Verified
                    </span>
                  ) : (
                    <span>Click steps or checkbox to resolve</span>
                  )}
                </span>
                {item.actionRequired && !isDone && (
                  <span className="text-amber-400/90 font-medium flex items-center">
                    <ArrowRightCircle className="w-3 h-3 mr-1" />
                    Immediate Action
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Contacts Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <PhoneCall className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Emergency Response Directory ({weather.location.country || 'Global'})
              </h3>
              <p className="text-xs text-slate-400">
                Direct disaster management & rescue contact lines
              </p>
            </div>
          </div>

          <button
            onClick={onOpenHotlines}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            View Full Protocol & Helpline Directory →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hazard.emergencyContacts.map((contact, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="text-xs font-semibold text-slate-300">{contact.title}</div>
              <div className="text-lg font-black text-rose-400 tracking-wide mt-0.5">
                {contact.number}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-1">
                {contact.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

