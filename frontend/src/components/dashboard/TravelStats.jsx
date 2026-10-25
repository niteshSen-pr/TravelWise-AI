import React from 'react';
import { Plane, Calendar, MapPin, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export const TravelStats = ({ trips = [] }) => {
  const totalTrips = trips.length;
  
  // Calculate unique destinations
  const uniqueDestinations = new Set(trips.map((t) => (t.destination || '').toLowerCase())).size;

  // Total budget managed
  const totalBudget = trips.reduce((acc, t) => acc + Number(t.budget || t.estimated_total_cost || 0), 0);

  // Upcoming trips (end date in future)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingCount = trips.filter((t) => (t.end_date || '') >= todayStr).length;

  const stats = [
    {
      label: 'Saved Journeys',
      value: totalTrips,
      icon: Plane,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Upcoming Adventures',
      value: upcomingCount,
      icon: Calendar,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Unique Destinations',
      value: uniqueDestinations,
      icon: MapPin,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Budget Managed',
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
