import React from 'react';
import { MapPin, Navigation, Calendar, Users, Globe2 } from 'lucide-react';

export const DestinationSection = ({ formData, updateFormData, errors }) => {
  // Preset quick picks for inspiration
  const quickPicks = [
    { name: 'Tokyo, Japan', desc: 'Futuristic & Ancient' },
    { name: 'Paris, France', desc: 'Culture & Romance' },
    { name: 'New York, USA', desc: 'Urban Energy & Broadway' },
    { name: 'Rome, Italy', desc: 'History & Gastronomy' },
    { name: 'Kyoto, Japan', desc: 'Temples & Zen Gardens' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Where are you heading?</h2>
        <p className="text-sm text-slate-500">
          Enter your target destination, starting point, and schedule.
        </p>
      </div>

      {/* Quick pick chips */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Popular Inspirations:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPicks.map((pick) => (
            <button
              key={pick.name}
              type="button"
              onClick={() => updateFormData({ destination: pick.name })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                formData.destination === pick.name
                  ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {pick.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destination Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Destination City or Region <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => updateFormData({ destination: e.target.value })}
              placeholder="e.g. Paris, France or Kyoto"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                errors.destination ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.destination && (
            <p className="text-xs text-rose-500 mt-1">{errors.destination}</p>
          )}
        </div>

        {/* Starting location (optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Starting Location / Arrival Hub <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Navigation className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.starting_location || ''}
              onChange={(e) => updateFormData({ starting_location: e.target.value })}
              placeholder="e.g. CDG Airport or Central Station"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>
        </div>

        {/* Travel Start Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                errors.start_date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.start_date && (
            <p className="text-xs text-rose-500 mt-1">{errors.start_date}</p>
          )}
        </div>

        {/* Travel End Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            End Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                errors.end_date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.end_date && (
            <p className="text-xs text-rose-500 mt-1">{errors.end_date}</p>
          )}
        </div>

        {/* Number of Travelers */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Traveler Count: <span className="text-brand-600 font-bold">{formData.traveler_count} {formData.traveler_count === 1 ? 'Person' : 'People'}</span>
          </label>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Users className="w-6 h-6 text-slate-500 shrink-0" />
            <input
              type="range"
              min="1"
              max="20"
              value={formData.traveler_count}
              onChange={(e) => updateFormData({ traveler_count: parseInt(e.target.value, 10) || 1 })}
              className="flex-1 accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="w-12 text-center font-bold text-slate-800 bg-white border border-slate-200 py-1.5 rounded-lg text-sm">
              {formData.traveler_count}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
