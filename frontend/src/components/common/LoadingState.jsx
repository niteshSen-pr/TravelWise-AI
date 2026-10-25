import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, Navigation, DollarSign } from 'lucide-react';

export const LoadingState = ({ title = "Curating Your Ideal Journey", message }) => {
  const steps = [
    { icon: MapPin, text: "Analyzing destination layout and prime districts..." },
    { icon: Navigation, text: "Calculating optimal inter-activity transit & walking routes..." },
    { icon: Sparkles, text: "Curating sights and dining matching your travel style..." },
    { icon: DollarSign, text: "Optimizing budget allocations and schedule balance..." },
    { icon: Compass, text: "Finalizing your personalized day-by-day itinerary..." },
  ];

  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-100 shadow-card">
      {/* Compass animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-teal-400 p-0.5 shadow-elevated">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Compass className="w-10 h-10 text-brand-600 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        {message || "Our intelligent engine is synthesizing activities, transit logistics, and budget guidelines."}
      </p>

      {/* Progress steps animation */}
      <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 transition-all duration-500">
        <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
          <CurrentIcon className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-left text-xs sm:text-sm font-medium text-slate-700 transition-all duration-300">
          {steps[stepIndex].text}
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-500 to-sky-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
