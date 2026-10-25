import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Compass, RefreshCw, Sparkles, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { TravelStats } from '../components/dashboard/TravelStats';
import { TripCard } from '../components/dashboard/TripCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('all');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await api.getTrips(user?.id);
      setTrips(data || []);
    } catch (err) {
      toastError('Could not load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleDeleteTrip = async (tripId) => {
    try {
      await api.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      success('Trip deleted successfully.');
    } catch (err) {
      toastError('Failed to delete trip.');
    }
  };

  const handleDuplicateTrip = async (tripId) => {
    try {
      const duplicated = await api.duplicateTrip(tripId);
      setTrips((prev) => [duplicated, ...prev]);
      success('Trip duplicated successfully!');
    } catch (err) {
      toastError('Failed to duplicate trip.');
    }
  };

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const matchesSearch = (t.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = filterStyle === 'all' || (t.travel_style || '').toLowerCase().includes(filterStyle.toLowerCase());
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Traveler Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.display_name || user?.email?.split('@')[0] || 'Explorer'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your saved journeys, review travel budgets, or plan your next adventure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTrips}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh Trips"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </div>

      {/* Travel Statistics */}
      <TravelStats trips={trips} />

      {/* Trips list section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Saved Itineraries</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredTrips.length} of {trips.length} trips
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destination..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            >
              <option value="all">All Styles</option>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="group">Group</option>
              <option value="culture">Cultural</option>
            </select>
          </div>
        </div>

        {/* Loading state or cards */}
        {loading ? (
          <div className="py-12">
            <LoadingState title="Loading Your Journeys..." message="Retrieving your planned itineraries and transit logs." />
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No Saved Trips Yet"
            description="You haven't saved any trips yet. Generate your very first personalized AI itinerary to get started!"
            actionLabel="Create My First Trip"
            actionPath="/plan"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
                onDuplicate={handleDuplicateTrip}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
