import React from 'react';
import { MapPin, Calendar, Users, DollarSign, Compass, Utensils, Home, Bus, Sparkles, CheckCircle2 } from 'lucide-react';

export const SummarySection = ({ formData, isSubmitting, onGenerate }) => {
  const stylesStr = Array.isArray(formData.travel_style) ? formData.travel_style.join(', ') : 'Custom Explorer';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Review your trip parameters</h2>
        <p className="text-sm text-slate-500">
          Everything looks great! Review your details below before generating your personalized itinerary.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
        {/* Core summary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Destination
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="truncate">{formData.destination || 'Not specified'}</span>
            </div>
            {formData.starting_location && (
              <span className="text-xs text-slate-500 mt-1 block truncate">
                From: {formData.starting_location}
              </span>
            )}
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Travel Dates
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{formData.start_date} → {formData.end_date}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Party & Budget
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{formData.traveler_count} Travelers • {formData.currency} {Number(formData.budget).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pacing & Logistics
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Bus className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{formData.pace} Pace • {formData.transport_preference}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Dining & Lodging
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{formData.food_preference} • {formData.accommodation_type}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Travel Styles
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 truncate">
              <Compass className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="truncate">{stylesStr}</span>
            </div>
          </div>
        </div>

        {/* Accessibility or special notes if present */}
        {(formData.accessibility || formData.special_requests) && (
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            {formData.accessibility && (
              <p><strong className="text-slate-800">Accessibility:</strong> {formData.accessibility}</p>
            )}
            {formData.special_requests && (
              <p><strong className="text-slate-800">Special Notes:</strong> {formData.special_requests}</p>
            )}
          </div>
        )}
      </div>

      {/* Prominent Generate CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-teal-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-base shadow-elevated hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Synthesizing Your Custom Journey...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Generate My Personalized Itinerary</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
          Multimodal transportation routes & daily cost breakdown will be computed automatically.
        </p>
      </div>
    </div>
  );
};
