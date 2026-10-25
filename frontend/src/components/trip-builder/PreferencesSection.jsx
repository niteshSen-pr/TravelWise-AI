import React from 'react';
import { Clock, Utensils, Home, Bus, Accessibility, MessageSquare } from 'lucide-react';

export const PreferencesSection = ({ formData, updateFormData }) => {
  const paces = [
    { id: 'Relaxed', label: 'Relaxed', desc: '1–2 activities daily. Lots of leisure time & café breaks.' },
    { id: 'Balanced', label: 'Balanced', desc: '2–3 activities daily. Balanced sightseeing and downtime.' },
    { id: 'Packed', label: 'Packed', desc: '4+ activities daily. Maximize sights from morning to night.' },
  ];

  const foodPrefs = ['No preference', 'Vegetarian', 'Vegan', 'Non-vegetarian'];
  const accommodationTypes = ['Hotel', 'Budget hotel', 'Hostel', 'Resort', 'Boutique Stay'];
  const transportPrefs = ['Mixed', 'Public transport', 'Walking', 'Taxi/Rideshare', 'Rental vehicle'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pacing, Dining & Logistics</h2>
        <p className="text-sm text-slate-500">
          Tailor how you move around, where you stay, and your dietary needs.
        </p>
      </div>

      {/* Daily Pace */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          Daily Activity Pace
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paces.map((pace) => {
            const isSelected = formData.pace === pace.id;
            return (
              <button
                key={pace.id}
                type="button"
                onClick={() => updateFormData({ pace: pace.id })}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm text-slate-900">{pace.label}</span>
                </div>
                <p className="text-xs text-slate-500">{pace.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transportation Preference */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-slate-400" />
            <span>Primary Transportation Mode</span>
          </label>
          <select
            value={formData.transport_preference}
            onChange={(e) => updateFormData({ transport_preference: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          >
            {transportPrefs.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Food Preference */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-slate-400" />
            <span>Food & Dietary Preference</span>
          </label>
          <select
            value={formData.food_preference}
            onChange={(e) => updateFormData({ food_preference: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          >
            {foodPrefs.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Accommodation Preference */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-slate-400" />
            <span>Lodging & Accommodation Type</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {accommodationTypes.map((type) => {
              const isSelected = formData.accommodation_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateFormData({ accommodation_type: type })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accessibility Requirements */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-slate-400" />
            <span>Accessibility Requirements <span className="text-slate-400 font-normal">(Optional)</span></span>
          </label>
          <input
            type="text"
            value={formData.accessibility || ''}
            onChange={(e) => updateFormData({ accessibility: e.target.value })}
            placeholder="e.g. Wheelchair accessible, elevator access, minimal stairs"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Special Requests / Notes <span className="text-slate-400 font-normal">(Optional)</span></span>
          </label>
          <input
            type="text"
            value={formData.special_requests || ''}
            onChange={(e) => updateFormData({ special_requests: e.target.value })}
            placeholder="e.g. Sunset viewing spots, coffee shops with WiFi"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>
      </div>
    </div>
  );
};
