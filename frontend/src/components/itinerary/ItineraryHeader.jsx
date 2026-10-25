import React from 'react';
import { Calendar, Users, DollarSign, Bookmark, Edit3, RotateCw, Printer, Download, Sparkles, MapPin, Share2 } from 'lucide-react';

export const ItineraryHeader = ({
  itinerary,
  onSave,
  onEdit,
  onRegenerateAll,
  onPrint,
  onExportJson,
  isSaving,
  isSaved,
}) => {
  const isOverBudget = itinerary.is_over_budget || (itinerary.budget_remaining < 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
      {/* Top Banner & Destination title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI-Tailored Transportation & Travel Plan</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 sm:w-9 h-9 text-brand-600 shrink-0" />
            <span>{itinerary.destination}</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
            {itinerary.summary}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:self-start">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : isSaved ? 'Saved to Trips' : 'Save Trip'}</span>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-soft transition"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={onRegenerateAll}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-soft transition"
            title="Regenerate Itinerary"
          >
            <RotateCw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-soft transition no-print"
            title="Print or Export PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-soft transition no-print"
            title="Download JSON Backup"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Meta tags and metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Duration & Travelers
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Users className="w-4 h-4 text-brand-600" />
            <span>{itinerary.total_days} Days • {itinerary.traveler_count} Travelers</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Target Budget
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <DollarSign className="w-4 h-4 text-sky-600" />
            <span>{itinerary.currency} {Number(itinerary.user_budget || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Estimated Total Cost
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span>{itinerary.currency} {Number(itinerary.estimated_total_cost || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl ${isOverBudget ? 'bg-rose-50 text-rose-900' : 'bg-emerald-50 text-emerald-900'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">
            {isOverBudget ? 'Budget Exceeded' : 'Budget Remaining'}
          </span>
          <div className="font-bold text-sm">
            {itinerary.currency} {Math.abs(Number(itinerary.budget_remaining || 0)).toLocaleString()}
            {isOverBudget && <span className="text-xs font-normal ml-1">(Over)</span>}
          </div>
        </div>
      </div>

      {/* Over budget warning if needed */}
      {isOverBudget && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
          <span>
            ⚠️ Estimated expenses exceed your target budget by {itinerary.currency} {Math.abs(itinerary.budget_remaining).toLocaleString()}. Consider switching to more affordable dining or public transit.
          </span>
        </div>
      )}
    </div>
  );
};
