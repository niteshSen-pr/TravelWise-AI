import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, RotateCw, Edit3, Bookmark, Printer, Download, Sparkles, MapPin, Bus, Coffee, Bed, Utensils, Info, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ItineraryHeader } from '../components/itinerary/ItineraryHeader';
import { ActivityCard } from '../components/itinerary/ActivityCard';
import { TransportationCard } from '../components/itinerary/TransportationCard';
import { BudgetSummary } from '../components/itinerary/BudgetSummary';
import { LoadingState } from '../components/common/LoadingState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { EmptyState } from '../components/common/EmptyState';

export const ItineraryPage = () => {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get('trip_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [itinerary, setItinerary] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0); // 0 = Day 1
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState(tripIdParam || null);

  // Single Day Regeneration State
  const [dayRegenModalOpen, setDayRegenModalOpen] = useState(false);
  const [dayToRegen, setDayToRegen] = useState(1);
  const [dayRegenInstructions, setDayRegenInstructions] = useState('');
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);

  // Full Regeneration Modal
  const [fullRegenModalOpen, setFullRegenModalOpen] = useState(false);

  useEffect(() => {
    loadItinerary();
  }, [tripIdParam]);

  const loadItinerary = async () => {
    setLoading(true);
    try {
      if (tripIdParam) {
        // Load saved trip from API
        const trip = await api.getTrip(tripIdParam);
        if (trip && trip.itinerary) {
          setItinerary(trip.itinerary);
          setSavedTripId(trip.id);
          setIsSaved(true);
        }
      } else {
        // Load from session storage
        const stored = sessionStorage.getItem('current_itinerary');
        if (stored) {
          setItinerary(JSON.parse(stored));
        } else {
          // If no stored itinerary, generate a default one for Paris to ensure immediate interactivity
          const defaultPrefs = {
            destination: 'Paris, France',
            start_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            traveler_count: 2,
            budget: 2000,
            currency: 'EUR',
            travel_style: ['Cultural exploration', 'Couple', 'Food and culinary tourism'],
            pace: 'Balanced',
            food_preference: 'No preference',
            accommodation_type: 'Hotel',
            transport_preference: 'Mixed'
          };
          const generated = await api.generateItinerary(defaultPrefs);
          sessionStorage.setItem('current_itinerary', JSON.stringify(generated));
          sessionStorage.setItem('current_preferences', JSON.stringify(defaultPrefs));
          setItinerary(generated);
        }
      }
    } catch (err) {
      console.error('Failed to load itinerary:', err);
      toastError('Failed to load itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;
    setIsSaving(true);
    try {
      const storedPrefs = sessionStorage.getItem('current_preferences');
      const prefs = storedPrefs ? JSON.parse(storedPrefs) : {};

      const tripPayload = {
        title: `${itinerary.destination} Journey (${itinerary.total_days} Days)`,
        destination: itinerary.destination,
        starting_location: prefs.starting_location || '',
        start_date: itinerary.days[0]?.date || new Date().toISOString().split('T')[0],
        end_date: itinerary.days[itinerary.days.length - 1]?.date || new Date().toISOString().split('T')[0],
        traveler_count: itinerary.traveler_count || 1,
        budget: itinerary.user_budget || 0,
        currency: itinerary.currency || 'USD',
        travel_style: itinerary.travel_style || 'Exploration',
        preferences: prefs,
        itinerary: itinerary,
        estimated_total_cost: itinerary.estimated_total_cost || 0,
        status: 'planned',
      };

      let saved;
      if (savedTripId) {
        saved = await api.updateTrip(savedTripId, tripPayload);
      } else {
        saved = await api.createTrip(tripPayload, user?.id);
        setSavedTripId(saved.id);
      }

      setIsSaved(true);
      success('Trip successfully saved to your dashboard!');
    } catch (err) {
      console.error('Save failed:', err);
      toastError('Could not save trip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!itinerary) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itinerary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TravelWise_${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Itinerary JSON backup downloaded!');
  };

  const handleRegenerateDay = async () => {
    if (!itinerary) return;
    setIsRegeneratingDay(true);
    try {
      const storedPrefs = sessionStorage.getItem('current_preferences');
      const prefs = storedPrefs ? JSON.parse(storedPrefs) : {
        destination: itinerary.destination,
        start_date: itinerary.days[0]?.date,
        end_date: itinerary.days[itinerary.days.length - 1]?.date,
        traveler_count: itinerary.traveler_count,
        budget: itinerary.user_budget,
        currency: itinerary.currency,
        travel_style: [itinerary.travel_style],
        pace: 'Balanced',
        food_preference: 'No preference',
        accommodation_type: 'Hotel',
        transport_preference: 'Mixed'
      };

      const updatedDay = await api.regenerateDay({
        trip_preferences: prefs,
        current_itinerary: itinerary,
        day_number: dayToRegen,
        instructions: dayRegenInstructions,
      });

      // Substitute only the specific day into the current itinerary
      const newDays = itinerary.days.map((d) => (d.day_number === dayToRegen ? updatedDay : d));
      const updatedItinerary = { ...itinerary, days: newDays };

      setItinerary(updatedItinerary);
      sessionStorage.setItem('current_itinerary', JSON.stringify(updatedItinerary));

      // If already saved to database, sync update
      if (savedTripId) {
        await api.updateTrip(savedTripId, { itinerary: updatedItinerary });
      }

      setDayRegenModalOpen(false);
      setDayRegenInstructions('');
      success(`Day ${dayToRegen} regenerated with fresh activities!`);
    } catch (err) {
      console.error('Day regen failed:', err);
      toastError('Could not regenerate day. Please try again.');
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  const handleRegenerateAll = async () => {
    setFullRegenModalOpen(false);
    setLoading(true);
    try {
      const storedPrefs = sessionStorage.getItem('current_preferences');
      const prefs = storedPrefs ? JSON.parse(storedPrefs) : {
        destination: itinerary.destination,
        start_date: itinerary.days[0]?.date,
        end_date: itinerary.days[itinerary.days.length - 1]?.date,
        traveler_count: itinerary.traveler_count,
        budget: itinerary.user_budget,
        currency: itinerary.currency,
      };

      const newItinerary = await api.generateItinerary(prefs);
      setItinerary(newItinerary);
      sessionStorage.setItem('current_itinerary', JSON.stringify(newItinerary));

      if (savedTripId) {
        await api.updateTrip(savedTripId, { itinerary: newItinerary });
      }

      success('Complete itinerary regenerated!');
    } catch (err) {
      toastError('Failed to regenerate itinerary.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingState title="Loading Itinerary..." message="Fetching day schedules, route links, and budget metrics." />
      </div>
    );
  }

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          title="No Itinerary Found"
          description="We couldn't locate an active itinerary. Start by creating a customized trip."
          actionLabel="Plan a Trip"
          actionPath="/plan"
        />
      </div>
    );
  }

  const currentDay = itinerary.days[activeDayIndex] || itinerary.days[0];
  const currency = itinerary.currency || '$';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header and Action Bar */}
      <ItineraryHeader
        itinerary={itinerary}
        onSave={handleSaveTrip}
        onEdit={() => navigate(`/edit?${savedTripId ? `trip_id=${savedTripId}` : ''}`)}
        onRegenerateAll={() => setFullRegenModalOpen(true)}
        onPrint={handlePrint}
        onExportJson={handleExportJson}
        isSaving={isSaving}
        isSaved={isSaved}
      />

      {/* Main Content Layout: Tabs + Active Day Activities */}
      <div className="space-y-6">
        {/* Day Tabs Navigation */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none no-print border-b border-slate-200">
          <div className="flex items-center gap-2">
            {itinerary.days.map((day, idx) => (
              <button
                key={day.day_number}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  activeDayIndex === idx
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Day {day.day_number}</span>
                <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${
                  activeDayIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {day.date.slice(5)}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setDayToRegen(currentDay.day_number);
              setDayRegenModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Regenerate Day {currentDay.day_number}</span>
          </button>
        </div>

        {/* Active Day Detail Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Day {currentDay.day_number} • {currentDay.date}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentDay.theme}</h2>
          </div>
          <div className="text-right sm:self-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Daily Spend</span>
            <span className="text-base font-bold text-slate-900">
              {currency} {Number(currentDay.daily_estimated_cost || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transportation summary for the day */}
        <TransportationCard summary={currentDay.transportation_summary} currency={currency} />

        {/* Activities list */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-600" />
            <span>Scheduled Activities</span>
          </h3>

          <div className="space-y-3">
            {currentDay.activities && currentDay.activities.map((act) => (
              <ActivityCard key={act.id} activity={act} currency={currency} />
            ))}
          </div>
        </div>

        {/* Dining & Accommodation Section for Active Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Meals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Dining Recommendations</span>
            </h4>
            <div className="space-y-2">
              {currentDay.meals && currentDay.meals.map((meal, mIdx) => (
                <div key={mIdx} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 capitalize block">{meal.type}: {meal.suggestion}</span>
                    <span className="text-amber-700 block text-[11px]">{meal.cuisine || 'Local culinary spot'}</span>
                  </div>
                  <span className="font-bold text-amber-900">{currency} {meal.estimated_cost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation & Tips */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600" />
              <span>Lodging & Daily Tips</span>
            </h4>

            {currentDay.accommodation && (
              <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-xs">
                <div className="flex items-center justify-between font-bold text-teal-900">
                  <span>{currentDay.accommodation.name}</span>
                  <span>{currency} {currentDay.accommodation.estimated_nightly_cost} / night</span>
                </div>
                <p className="text-teal-700 text-[11px] mt-0.5">{currentDay.accommodation.notes}</p>
              </div>
            )}

            {currentDay.travel_tips && currentDay.travel_tips.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-600 pt-1">
                {currentDay.travel_tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Budget & Expense Breakdown with Interactive Chart */}
      <BudgetSummary itinerary={itinerary} />

      {/* Regenerate Single Day Modal */}
      {dayRegenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Regenerate Day {dayToRegen}
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This will generate fresh alternative activities and meals for Day {dayToRegen} while leaving all other days untouched.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Custom Instructions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={dayRegenInstructions}
                onChange={(e) => setDayRegenInstructions(e.target.value)}
                placeholder="e.g. Focus on historic architecture, more open-air parks, or relaxed evening live music"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDayRegenModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateDay}
                disabled={isRegeneratingDay}
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRegeneratingDay ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Regenerate Day {dayToRegen}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Full Regeneration */}
      <ConfirmationDialog
        isOpen={fullRegenModalOpen}
        title="Regenerate Entire Itinerary?"
        message="This will re-synthesize all days and activities based on your trip parameters. Any unsaved manual edits will be replaced."
        confirmLabel="Regenerate All"
        isDestructive={false}
        onCancel={() => setFullRegenModalOpen(false)}
        onConfirm={handleRegenerateAll}
      />
    </div>
  );
};
