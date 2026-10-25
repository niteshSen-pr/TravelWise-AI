import { Compass, Heart, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                TravelWise <span className="text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Personalized Travel Itinerary Planner in the Transportation domain. Designed with FastAPI, React, 
              Supabase, and intelligent Generative AI to create seamless day-by-day travel journeys, multimodal routes, 
              and budget optimizations.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Full-Stack Academic Engineering Demonstration Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-white transition">Smart Trip Builder</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Trip Dashboard</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Scenarios */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Use Cases</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                <span>Solo Travelers (Weekend Getaways)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>Couples (Romantic & Relaxed)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Groups & Friends (Coordinated)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Multimodal Transportation & Budgeting</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelWise AI — Intelligent Transportation & Travel Planning.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for smart travelers
            </span>
            <span>•</span>
            <span className="text-brand-400">OpenStreetMap Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
