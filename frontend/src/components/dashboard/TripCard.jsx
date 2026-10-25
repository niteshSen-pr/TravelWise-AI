import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, MapPin, Eye, Edit3, Trash2, Copy, Sparkles, Navigation } from 'lucide-react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

export const TripCard = ({ trip, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Derive scenic background based on destination
  const getDestinationImage = (dest) => {
    const d = (dest || '').toLowerCase();
    if (d.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80';
    if (d.includes('tokyo')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80';
    if (d.includes('new york') || d.includes('nyc')) return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80';
    if (d.includes('rome') || d.includes('italy')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80';
    if (d.includes('bali')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
  };

  const formattedDates = `${trip.start_date} → ${trip.end_date}`;

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden flex flex-col">
        {/* Cover Image & Badge */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

          {/* Status badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/90 text-slate-800 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="capitalize">{trip.status || 'Planned'}</span>
          </div>

          {/* Destination overlay text */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1 text-xs text-brand-300 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
            <h3 className="text-base font-bold text-white truncate leading-snug">
              {trip.title || `Trip to ${trip.destination}`}
            </h3>
          </div>
        </div>

        {/* Content details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="truncate">{formattedDates}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
              <Users className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{trip.traveler_count} {trip.traveler_count === 1 ? 'Traveler' : 'Travelers'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Est. Cost</span>
              <span className="font-bold text-slate-900 text-sm">
                {trip.currency || '$'} {Number(trip.estimated_total_cost || trip.budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-right max-w-[130px]">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Style</span>
              <span className="font-medium text-slate-700 truncate block">
                {trip.travel_style || 'Exploration'}
              </span>
            </div>
          </div>

          {/* Card Actions */}
          <div className="pt-2 flex items-center justify-between gap-1.5">
            <Link
              to={`/itinerary?trip_id=${trip.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>

            <Link
              to={`/edit?trip_id=${trip.id}`}
              className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="Edit Trip"
            >
              <Edit3 className="w-4 h-4" />
            </Link>

            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(trip.id)}
                className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                title="Duplicate Trip"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Trip?"
        message={`Are you sure you want to delete "${trip.title || trip.destination}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDestructive={true}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          onDelete(trip.id);
        }}
      />
    </>
  );
};
