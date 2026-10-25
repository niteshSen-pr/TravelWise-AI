import React from 'react';
import { Bus, Clock, DollarSign, Compass, Info, CheckCircle2 } from 'lucide-react';

export const TransportationCard = ({ summary, currency = '$' }) => {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-teal-50/50 via-sky-50/30 to-white rounded-2xl border border-teal-200/70 p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Daily Transportation Logistics</h4>
            <span className="text-xs text-slate-500">Multimodal route synthesis</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Transit Cost</span>
          <span className="text-sm font-bold text-teal-800">
            {currency} {Number(summary.estimated_transport_cost || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Primary Transit</span>
            <span className="font-semibold text-slate-800">{summary.primary_mode}</span>
          </div>
        </div>
        <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Total In-Transit</span>
            <span className="font-semibold text-slate-800">~{summary.total_travel_time_minutes} mins</span>
          </div>
        </div>
      </div>

      {summary.highlights && summary.highlights.length > 0 && (
        <ul className="space-y-1 text-xs text-slate-600 pt-1 border-t border-teal-100/60">
          {summary.highlights.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
