import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, Navigation, ExternalLink, ChevronDown, ChevronUp, Tag, Compass } from 'lucide-react';

export const ActivityCard = ({ activity, currency = '$' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const periodColors = {
    morning: 'bg-amber-50 text-amber-800 border-amber-200',
    afternoon: 'bg-sky-50 text-sky-800 border-sky-200',
    evening: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  };

  const periodBadge = periodColors[activity.period?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-card transition duration-200 overflow-hidden">
      {/* Activity Title Bar */}
      <div
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex flex-col items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${periodBadge}`}>
              {activity.period || 'Day'}
            </span>
            <span className="text-xs font-bold text-slate-600 mt-1.5 whitespace-nowrap">
              {activity.time}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition">
              {activity.name}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{activity.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activity.duration_minutes} mins</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-800">
                {activity.estimated_cost === 0 ? 'Free Entry' : `${currency} ${activity.estimated_cost}`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 space-y-3.5 border-t border-slate-100 mt-1">
          <p className="text-sm text-slate-600 leading-relaxed pt-3">
            {activity.description}
          </p>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activity.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* OpenStreetMap verified search / details link */}
          {activity.booking_info_link && (
            <div className="pt-1">
              <a
                href={activity.booking_info_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Search Location on OpenStreetMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Inter-activity Transportation routing bar */}
          {activity.transport_to_next && (
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    Next Leg: {activity.transport_to_next.mode} (~{activity.transport_to_next.estimated_duration_minutes} min)
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {activity.transport_to_next.notes || 'Recommended route to next stop'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center">
                <span className="font-bold text-slate-700">
                  {activity.transport_to_next.estimated_cost === 0
                    ? 'Free'
                    : `${currency} ${activity.transport_to_next.estimated_cost}`}
                </span>

                {activity.transport_to_next.directions_url && (
                  <a
                    href={activity.transport_to_next.directions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-medium transition shadow-2xs"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
