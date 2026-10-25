import React from 'react';
import { DollarSign, Wallet, Sparkles } from 'lucide-react';

export const BudgetSection = ({ formData, updateFormData, errors }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];

  const categories = [
    { id: 'budget', label: 'Budget', desc: 'Hostels, public transit, street food & free landmarks' },
    { id: 'moderate', label: 'Moderate', desc: '3-star hotels, local bistros, museums & mixed transit' },
    { id: 'premium', label: 'Premium', desc: '4-star boutique hotels, guided excursions & fine dining' },
    { id: 'luxury', label: 'Luxury', desc: '5-star resorts, private transfers, tasting menus & VIP access' },
  ];

  const travelerCount = formData.traveler_count || 1;
  const totalBudget = Number(formData.budget) || 0;
  const perPerson = travelerCount > 0 ? (totalBudget / travelerCount).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Set your budget & spending tier</h2>
        <p className="text-sm text-slate-500">
          We will distribute costs across transport, accommodation, meals, and sightseeing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget Input */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Total Target Budget <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              {formData.currency}
            </span>
            <input
              type="number"
              min="100"
              step="50"
              value={formData.budget}
              onChange={(e) => updateFormData({ budget: parseFloat(e.target.value) || 0 })}
              className={`w-full pl-14 pr-4 py-3 rounded-xl border text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                errors.budget ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.budget && <p className="text-xs text-rose-500 mt-1">{errors.budget}</p>}
        </div>

        {/* Currency selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => updateFormData({ currency: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Per person breakdown helper banner */}
      <div className="bg-brand-50/80 border border-brand-200/60 rounded-xl p-4 flex items-center justify-between text-xs text-brand-900">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-600" />
          <span>Approximate budget per traveler:</span>
        </div>
        <div className="font-bold text-sm text-brand-700">
          {formData.currency} {Number(perPerson).toLocaleString()} / person
        </div>
      </div>

      {/* Budget Category Options */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          Budget Tier Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isSelected = formData.budget_category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFormData({ budget_category: cat.id })}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm text-slate-900">{cat.label}</span>
                  {isSelected && <Sparkles className="w-4 h-4 text-brand-600" />}
                </div>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
