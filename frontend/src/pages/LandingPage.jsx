import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Navigation, Users, ShieldCheck, ArrowRight, Calendar, DollarSign, MapPin, Heart, CheckCircle2, ChevronRight, Bus } from 'lucide-react';

export const LandingPage = () => {
  const sampleActivities = [
    { time: '09:30 AM', name: 'Louvre Museum & Tuileries Garden', mode: 'Walking (~12 min)', cost: '€22' },
    { time: '01:30 PM', name: 'Le Marais Artisan Lunch & Stroll', mode: 'Metro (~15 min)', cost: '€18' },
    { time: '06:00 PM', name: 'Seine Sunset River Cruise', mode: 'Walking (~8 min)', cost: '€16' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                <span>Next-Gen Transportation & Itinerary Planning</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your Next Adventure, <br />
                <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  Planned by AI.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Effortlessly build personalized, day-by-day travel itineraries with synchronized transit routes, 
                attraction schedules, local cuisine, and tailored budget calculations in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/plan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-elevated hover:shadow-lg transition active:scale-[0.98]"
                >
                  <Compass className="w-5 h-5" />
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm shadow-soft transition"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              {/* Trust markers */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Multimodal Transit Routes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>OpenStreetMap Links</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>100% Free Demo Mode</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-elevated border border-slate-200/80">
                {/* Floating Scenic Badge */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80"
                    alt="Paris Travel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent"></div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider block">Sample Journey</span>
                    <h3 className="text-lg font-bold">Parisian Arts & Historic Walk</h3>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900">
                    3 Days • 2 Travelers
                  </div>
                </div>

                {/* Day sample timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Day 1 • Cultural Foundation</span>
                    <span className="text-brand-600">Est. €56</span>
                  </div>

                  {sampleActivities.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{act.name}</span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Bus className="w-3 h-3 text-teal-600" />
                          <span>{act.mode}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700">{act.cost}</span>
                        <span className="block text-[10px] text-slate-400">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <span>Real-time map links generated</span>
                  </div>
                  <Link to="/plan" className="text-brand-600 font-bold hover:underline flex items-center">
                    Plan now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Solo, Couples, Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Tailored For Every Traveler</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Engineered For Solo, Couple & Group Journeys
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No two trips are alike. Our algorithms calibrate walking pace, budget allocation, and dining venues to your specific travel dynamic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solo */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scenario 1: Solo Travelers</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Weekend getaways on a disciplined budget. Enjoy walkable neighborhoods, safe hostel & boutique options, solo-friendly counter cafes, and public transit passes.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Single-ticket transit routes & walking loops</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Solo safety guidelines & cafe work-spots</span>
              </li>
            </ul>
          </div>

          {/* Couple */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scenario 2: Couples</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Romantic escapes curated for two. Paced with serene viewpoints, intimate dining, sunset boat tours, and relaxed morning schedules.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Sunset viewpoints & romantic bistros</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Relaxed pacing with generous downtime</span>
              </li>
            </ul>
          </div>

          {/* Group */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scenario 3: Groups & Friends</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Multi-day trips with friends. Seamlessly balances shared group budgets, bulk bookings, interactive group sights, and vibrant evening areas.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Group dining halls & lively nightlife zones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Coordinated rideshares and group ticket estimates</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="max-w-xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Streamlined Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How TravelWise AI Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From your initial idea to a completely optimized itinerary in 4 steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center">1</div>
              <h4 className="text-base font-bold text-white">Enter Parameters</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose destination, travel dates, party size, and target budget in your currency.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-bold flex items-center justify-center">2</div>
              <h4 className="text-base font-bold text-white">Fine-tune Preferences</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set daily pace, transport preference, dietary guidelines, and hotel types.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center">3</div>
              <h4 className="text-base font-bold text-white">Synthesize Itinerary</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our engine organizes activities geographically, computes inter-attraction transit, and validates expenses.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-bold flex items-center justify-center">4</div>
              <h4 className="text-base font-bold text-white">Edit & Export</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Regenerate specific days, edit activities, print friendly PDF pages, or download JSON.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Core Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Engineered for Modern Travelers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <Bus className="w-8 h-8 text-brand-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Multimodal Transportation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates walking durations, metro lines, and taxi costs with direct OpenStreetMap routing queries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <DollarSign className="w-8 h-8 text-sky-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Live Budget Allocation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides real-time expense calculations with Recharts visual graphs and over-budget alerts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <Sparkles className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Surgical Day Regeneration</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don't like Day 2? Regenerate only that day with custom instructions without losing the rest of your trip!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-sky-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-elevated">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto mb-6">
            Generate your personalized, day-by-day travel itinerary with multimodal transportation in less than 30 seconds.
          </p>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-md hover:bg-slate-50 transition active:scale-[0.98]"
          >
            <Compass className="w-5 h-5 text-brand-600" />
            <span>Launch Smart Trip Builder</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
