import React from 'react';
import { DollarSign, PieChart, Users, AlertTriangle, CheckCircle, Bed, Utensils, Ticket, Bus, Shield } from 'lucide-react';
import { BudgetChart } from './BudgetChart';

export const BudgetSummary = ({ itinerary }) => {
  const currency = itinerary.currency || '$';
  const breakdown = itinerary.budget_breakdown || {};
  const isOver = itinerary.is_over_budget || (itinerary.budget_remaining < 0);

  const categories = [
    { label: 'Accommodation', cost: breakdown.accommodation, icon: Bed, color: 'text-teal-600 bg-teal-50' },
    { label: 'Food & Dining', cost: breakdown.food, icon: Utensils, color: 'text-amber-600 bg-amber-50' },
    { label: 'Attractions & Sightseeing', cost: breakdown.activities, icon: Ticket, color: 'text-sky-600 bg-sky-50' },
    { label: 'Transportation & Transit', cost: breakdown.transportation, icon: Bus, color: 'text-purple-600 bg-purple-50' },
    { label: 'Incidental / Contingency', cost: breakdown.other, icon: Shield, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-600" />
            <span>Budget & Expense Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Categorized allocations reflecting your travel party size and length of stay.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
          {itinerary.traveler_count} Traveler{itinerary.traveler_count > 1 ? 's' : ''} • ~{currency} {itinerary.estimated_cost_per_person?.toLocaleString()} / person
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Category Rows */}
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const percentage = itinerary.estimated_total_cost > 0
              ? Math.round(((cat.cost || 0) / itinerary.estimated_total_cost) * 100)
              : 0;

            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 block">{percentage}% of estimated total</span>
                  </div>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {currency} {Number(cat.cost || 0).toLocaleString()}
                </div>
              </div>
            );
          })}

          {/* Grand Total Row */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-sm font-bold">
            <span className="text-slate-800">Estimated Total Expenditure:</span>
            <span className="text-brand-700 text-base">
              {currency} {Number(itinerary.estimated_total_cost || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Pie Chart */}
        <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Expense Allocation
          </span>
          <BudgetChart breakdown={breakdown} currency={currency} />
        </div>
      </div>
    </div>
  );
};
