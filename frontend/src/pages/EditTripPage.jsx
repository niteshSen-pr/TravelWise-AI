import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, RotateCw, ArrowLeft, Clock, DollarSign, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { LoadingState } from '../components/common/LoadingState';

export const EditTripPage = () => {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get('trip_id');
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Day Regeneration in editor
  const [regenConfirmOpen, setRegenConfirmOpen] = useState(false);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [tripIdParam]);

  const loadTripData = async () => {
    setLoading(true);
    try {
      if (tripIdParam) {
        const data = await api.getTrip(tripIdParam);
        setTrip(data);
        setItinerary(data.itinerary);
      } else {
        const stored = sessionStorage.getItem('current_itinerary');
        if (stored) {
          const parsed = JSON.parse(stored);
          setItinerary(parsed);
          setTrip({
            title: `Trip to ${parsed.destination}`,
            destination: parsed.destination,
            traveler_count: parsed.traveler_count || 1,
            budget: parsed.user_budget || 0,
            itinerary: parsed,
          });
        }
      }
    } catch (err) {
      toastError('Could not load trip data for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActivity = (dayIndex, actIndex, field, value) => {
    const updatedDays = [...itinerary.days];
    const targetDay = { ...updatedDays[dayIndex] };
    const targetActivities = [...targetDay.activities];

    targetActivities[actIndex] = {
      ...targetActivities[actIndex],
      [field]: field === 'estimated_cost' ? (parseFloat(value) || 0) : value,
    };

    targetDay.activities = targetActivities;
    updatedDays[dayIndex] = targetDay;

    setItinerary({ ...itinerary, days: updatedDays });
  };

  const handleAddActivity = (dayIndex) => {
    const updatedDays = [...itinerary.days];
    const targetDay = { ...updatedDays[dayIndex] };
    const targetActivities = [...targetDay.activities];

    const newAct = {
      id: `act-custom-${Date.now()}`,
      time: '04:00 PM',
      period: 'afternoon',
      name: 'New Custom Attraction or Activity',
      description: 'Explore local sights, enjoy coffee, or shop artisan wares.',
      location: `${itinerary.destination} City Center`,
      duration_minutes: 60,
      estimated_cost: 15.0,
      tags: ['Custom'],
    };

    targetDay.activities = [...targetActivities, newAct];
    updatedDays[dayIndex] = targetDay;
    setItinerary({ ...itinerary, days: updatedDays });
    success('New activity added to the schedule!');
  };

  const handleDeleteActivity = (dayIndex, actIndex) => {
    const updatedDays = [...itinerary.days];
    const targetDay = { ...updatedDays[dayIndex] };
    targetDay.activities = targetDay.activities.filter((_, idx) => idx !== actIndex);
    updatedDays[dayIndex] = targetDay;
    setItinerary({ ...itinerary, days: updatedDays });
    success('Activity removed.');
  };

  const handleMoveActivity = (dayIndex, actIndex, direction) => {
    const updatedDays = [...itinerary.days];
    const targetDay = { ...updatedDays[dayIndex] };
    const acts = [...targetDay.activities];

    const targetIdx = actIndex + direction;
    if (targetIdx < 0 || targetIdx >= acts.length) return;

    const temp = acts[actIndex];
    acts[actIndex] = acts[targetIdx];
    acts[targetIdx] = temp;

    targetDay.activities = acts;
    updatedDays[dayIndex] = targetDay;
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const handleRegenerateThisDay = async () => {
    setRegenConfirmOpen(false);
    setIsRegeneratingDay(true);
    try {
      const activeDay = itinerary.days[activeDayIndex];
      const prefs = {
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
        transport_preference: 'Mixed',
      };

      const freshDay = await api.regenerateDay({
        trip_preferences: prefs,
        current_itinerary: itinerary,
        day_number: activeDay.day_number,
        instructions: 'Provide exciting refreshed sightseeing choices',
      });

      const updatedDays = itinerary.days.map((d, i) => (i === activeDayIndex ? freshDay : d));
      const newItin = { ...itinerary, days: updatedDays };
      setItinerary(newItin);
      sessionStorage.setItem('current_itinerary', JSON.stringify(newItin));

      if (tripIdParam) {
        await api.updateTrip(tripIdParam, { itinerary: newItin });
      }

      success(`Day ${activeDay.day_number} regenerated successfully!`);
    } catch (err) {
      toastError('Failed to regenerate this day.');
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Recalculate total estimated cost
      let totalCost = 0;
      itinerary.days.forEach((day) => {
        day.activities.forEach((act) => {
          totalCost += Number(act.estimated_cost || 0);
        });
        day.meals?.forEach((m) => {
          totalCost += Number(m.estimated_cost || 0);
        });
        if (day.accommodation) {
          totalCost += Number(day.accommodation.estimated_nightly_cost || 0);
        }
      });

      const updatedItin = {
        ...itinerary,
        estimated_total_cost: totalCost,
        budget_remaining: Number(itinerary.user_budget || 0) - totalCost,
        is_over_budget: (Number(itinerary.user_budget || 0) - totalCost) < 0,
      };

      sessionStorage.setItem('current_itinerary', JSON.stringify(updatedItin));

      if (tripIdParam) {
        await api.updateTrip(tripIdParam, {
          title: trip.title,
          destination: trip.destination,
          traveler_count: trip.traveler_count,
          itinerary: updatedItin,
          estimated_total_cost: totalCost,
        });
        success('Trip modifications saved!');
        navigate(`/itinerary?trip_id=${tripIdParam}`);
      } else {
        success('Itinerary changes updated!');
        navigate('/itinerary');
      }
    } catch (err) {
      toastError('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingState title="Loading Trip Editor..." message="Preparing editable itinerary blocks and activity timelines." />
      </div>
    );
  }

  if (!itinerary || !itinerary.days) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">No trip details available to edit.</p>
        <button
          onClick={() => navigate('/plan')}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-sm"
        >
          Plan a New Trip
        </button>
      </div>
    );
  }

  const currentDay = itinerary.days[activeDayIndex] || itinerary.days[0];
  const currency = itinerary.currency || '$';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Itinerary</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Itinerary Editor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize activity names, times, estimated expenses, or regenerate individual days.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* General Trip Info Editor */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          General Trip Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Title</label>
            <input
              type="text"
              value={trip?.title || ''}
              onChange={(e) => setTrip({ ...trip, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
            <input
              type="text"
              value={itinerary.destination}
              onChange={(e) => {
                setItinerary({ ...itinerary, destination: e.target.value });
                setTrip({ ...trip, destination: e.target.value });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Traveler Count</label>
            <input
              type="number"
              min="1"
              max="30"
              value={itinerary.traveler_count || 1}
              onChange={(e) => {
                const count = parseInt(e.target.value, 10) || 1;
                setItinerary({ ...itinerary, traveler_count: count });
                setTrip({ ...trip, traveler_count: count });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {itinerary.days.map((day, idx) => (
            <button
              key={day.day_number}
              type="button"
              onClick={() => setActiveDayIndex(idx)}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                activeDayIndex === idx
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Day {day.day_number} ({day.date.slice(5)})
            </button>
          ))}
        </div>

        {/* Regenerate This Day Button */}
        <button
          type="button"
          onClick={() => setRegenConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition shrink-0"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Regenerate Day {currentDay.day_number}</span>
        </button>
      </div>

      {/* Active Day Activities List Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Day {currentDay.day_number} Activities ({currentDay.activities?.length || 0})
          </h3>
          <button
            type="button"
            onClick={() => handleAddActivity(activeDayIndex)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>

        <div className="space-y-4">
          {currentDay.activities && currentDay.activities.map((act, actIdx) => (
            <div
              key={act.id || actIdx}
              className="bg-white rounded-2xl border border-slate-200 shadow-soft p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {actIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={act.name}
                    onChange={(e) => handleUpdateActivity(activeDayIndex, actIdx, 'name', e.target.value)}
                    className="font-bold text-slate-900 text-sm sm:text-base border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none px-1 py-0.5 rounded"
                  />
                </div>

                {/* Move & Delete controls */}
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveActivity(activeDayIndex, actIdx, -1)}
                    disabled={actIdx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveActivity(activeDayIndex, actIdx, 1)}
                    disabled={actIdx === currentDay.activities.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(activeDayIndex, actIdx)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 ml-1"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form fields for activity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Time</label>
                  <input
                    type="text"
                    value={act.time}
                    onChange={(e) => handleUpdateActivity(activeDayIndex, actIdx, 'time', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={act.location}
                    onChange={(e) => handleUpdateActivity(activeDayIndex, actIdx, 'location', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Estimated Cost ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={act.estimated_cost}
                    onChange={(e) => handleUpdateActivity(activeDayIndex, actIdx, 'estimated_cost', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={act.description}
                  onChange={(e) => handleUpdateActivity(activeDayIndex, actIdx, 'description', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog for Day Regeneration */}
      <ConfirmationDialog
        isOpen={regenConfirmOpen}
        title={`Regenerate Day ${currentDay.day_number}?`}
        message="Regenerating will replace the activities on this day with a fresh alternative set of attractions, but will leave all other days untouched. Continue?"
        confirmLabel="Yes, Regenerate Day"
        isDestructive={false}
        onCancel={() => setRegenConfirmOpen(false)}
        onConfirm={handleRegenerateThisDay}
      />
    </div>
  );
};
