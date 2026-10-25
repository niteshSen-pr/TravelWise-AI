/**
 * Centralized API service for communicating with FastAPI backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data !== null && data.detail
        ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        : `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Itinerary
  generateItinerary: (preferences) =>
    request('/itinerary/generate', {
      method: 'POST',
      body: JSON.stringify(preferences),
    }),

  regenerateDay: ({ trip_preferences, current_itinerary, day_number, instructions }) =>
    request('/itinerary/regenerate-day', {
      method: 'POST',
      body: JSON.stringify({
        trip_preferences,
        current_itinerary,
        day_number,
        instructions,
      }),
    }),

  reviseItinerary: ({ current_itinerary, instructions }) =>
    request('/itinerary/revise', {
      method: 'POST',
      body: JSON.stringify({ current_itinerary, instructions }),
    }),

  // Trips CRUD
  getTrips: (userId) =>
    request(`/trips${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`),

  getTrip: (tripId) => request(`/trips/${encodeURIComponent(tripId)}`),

  createTrip: (tripData, userId) =>
    request(`/trips${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(tripData),
    }),

  updateTrip: (tripId, tripUpdate) =>
    request(`/trips/${encodeURIComponent(tripId)}`, {
      method: 'PUT',
      body: JSON.stringify(tripUpdate),
    }),

  deleteTrip: (tripId) =>
    request(`/trips/${encodeURIComponent(tripId)}`, {
      method: 'DELETE',
    }),

  duplicateTrip: (tripId) =>
    request(`/trips/${encodeURIComponent(tripId)}/duplicate`, {
      method: 'POST',
    }),

  // Auth
  getAuthStatus: () => request('/auth/status'),
  demoLogin: () => request('/auth/demo-login', { method: 'POST' }),
};
