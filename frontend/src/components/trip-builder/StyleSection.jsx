import React from 'react';
import { User, Users, Heart, Baby, Compass, Coffee, Utensils, Mountain, ShoppingBag, Sparkles, Check } from 'lucide-react';

export const StyleSection = ({ formData, updateFormData }) => {
  const styles = [
    { id: 'Solo', label: 'Solo Traveler', icon: User, desc: 'Solo-friendly spots, hostels, walkability' },
    { id: 'Couple', label: 'Couple / Romantic', icon: Heart, desc: 'Scenic sunsets, cozy bistros, private pace' },
    { id: 'Family', label: 'Family with Kids', icon: Baby, desc: 'Interactive parks, easy access, family dining' },
    { id: 'Friends/Group', label: 'Friends / Group', icon: Users, desc: 'Shared experiences, lively nightlife & group dining' },
    { id: 'Cultural exploration', label: 'Cultural & History', icon: Compass, desc: 'Historic quarters, monuments, architecture' },
    { id: 'Food and culinary tourism', label: 'Food & Culinary', icon: Utensils, desc: 'Artisan food halls, bakeries, tasting spots' },
    { id: 'Nature and wildlife', label: 'Nature & Parks', icon: Mountain, desc: 'Botanical gardens, viewpoints, outdoor trails' },
    { id: 'Relaxation', label: 'Relaxation & Wellness', icon: Coffee, desc: 'Leisurely coffee breaks, spas, slower rhythms' },
    { id: 'Shopping', label: 'Shopping & Boutiques', icon: ShoppingBag, desc: 'Local artisan markets, designer avenues' },
    { id: 'Adventure', label: 'Adventure & Active', icon: Sparkles, desc: 'Bike tours, boat excursions, urban hikes' },
    { id: 'Luxury', label: 'Luxury & Exclusive', icon: Sparkles, desc: 'Refined stays, Michelin spots, premium views' },
  ];

  const currentStyles = Array.isArray(formData.travel_style) ? formData.travel_style : [];

  const toggleStyle = (styleId) => {
    if (currentStyles.includes(styleId)) {
      if (currentStyles.length > 1) {
        updateFormData({ travel_style: currentStyles.filter((s) => s !== styleId) });
      }
    } else {
      updateFormData({ travel_style: [...currentStyles, styleId] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Choose your travel styles & interests</h2>
        <p className="text-sm text-slate-500">
          Select all that apply. We will mold daily activity suggestions around your unique vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {styles.map((style) => {
          const Icon = style.icon;
          const isSelected = currentStyles.includes(style.id);

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => toggleStyle(style.id)}
              className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">{style.label}</span>
                <span className="text-xs text-slate-500 leading-snug block mt-0.5">{style.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
