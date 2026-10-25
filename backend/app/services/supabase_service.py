import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx

from ..core.config import settings
from ..schemas.trip import TripCreate, TripUpdate, TripOut

logger = logging.getLogger(__name__)

class SupabaseService:
    """
    Supabase client abstraction.
    Communicates with Supabase REST API (PostgREST) when credentials are provided.
    Seamlessly falls back to an in-memory/local storage repository during demo mode.
    """

    def __init__(self):
        # In-memory store for demo mode
        self._demo_trips: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_trips()

    def _seed_sample_trips(self):
        """Pre-seeds sample trips for solo, couple, and group scenarios."""
        now = datetime.now(timezone.utc).isoformat()
        
        # Scenario 1: Solo Traveler Weekend in Tokyo
        solo_id = "solo-tokyo-demo-01"
        self._demo_trips[solo_id] = {
            "id": solo_id,
            "user_id": "demo-user-123",
            "title": "Solo Exploration: Neon & Ancient Tokyo",
            "destination": "Tokyo, Japan",
            "starting_location": "Narita Airport",
            "start_date": "2026-11-10",
            "end_date": "2026-11-13",
            "traveler_count": 1,
            "budget": 1200.0,
            "currency": "USD",
            "travel_style": "Solo, Cultural exploration, Foodie",
            "preferences": {
                "pace": "Balanced",
                "food_preference": "No preference",
                "accommodation_type": "Hostel",
                "transport_preference": "Public transport"
            },
            "itinerary": {
                "destination": "Tokyo, Japan",
                "summary": "An exhilarating 4-day solo journey diving into ancient temples and futuristic skylines.",
                "currency": "USD",
                "travel_style": "Solo, Cultural exploration, Foodie",
                "traveler_count": 1,
                "total_days": 4,
                "estimated_total_cost": 780.0,
                "estimated_cost_per_person": 780.0,
                "user_budget": 1200.0,
                "budget_remaining": 420.0,
                "is_over_budget": False,
                "days": [],
                "budget_breakdown": {
                    "transportation": 95.0,
                    "accommodation": 280.0,
                    "food": 230.0,
                    "activities": 140.0,
                    "other": 35.0
                },
                "general_tips": ["Purchase a Pasmo/Suica card for seamless train transit."],
                "disclaimer": "Estimates for demonstration purposes.",
                "generated_by": "demo"
            },
            "estimated_total_cost": 780.0,
            "status": "planned",
            "created_at": now,
            "updated_at": now
        }

        # Scenario 2: Couple Romantic Getaway in Paris
        couple_id = "couple-paris-demo-02"
        self._demo_trips[couple_id] = {
            "id": couple_id,
            "user_id": "demo-user-123",
            "title": "Romantic Escape in Paris",
            "destination": "Paris, France",
            "starting_location": "Charles de Gaulle Airport",
            "start_date": "2026-12-05",
            "end_date": "2026-12-09",
            "traveler_count": 2,
            "budget": 2800.0,
            "currency": "EUR",
            "travel_style": "Couple, Romantic, Relaxation",
            "preferences": {
                "pace": "Relaxed",
                "food_preference": "No preference",
                "accommodation_type": "Hotel",
                "transport_preference": "Walking"
            },
            "itinerary": {
                "destination": "Paris, France",
                "summary": "A 5-day relaxed romantic retreat featuring Seine sunsets and candlelit bistros.",
                "currency": "EUR",
                "travel_style": "Couple, Romantic, Relaxation",
                "traveler_count": 2,
                "total_days": 5,
                "estimated_total_cost": 2150.0,
                "estimated_cost_per_person": 1075.0,
                "user_budget": 2800.0,
                "budget_remaining": 650.0,
                "is_over_budget": False,
                "days": [],
                "budget_breakdown": {
                    "transportation": 120.0,
                    "accommodation": 1050.0,
                    "food": 620.0,
                    "activities": 280.0,
                    "other": 80.0
                },
                "general_tips": ["Book Louvre and Eiffel Tower slots at least 2 weeks in advance."],
                "disclaimer": "Estimates for demonstration purposes.",
                "generated_by": "demo"
            },
            "estimated_total_cost": 2150.0,
            "status": "planned",
            "created_at": now,
            "updated_at": now
        }

    async def list_trips(self, user_id: Optional[str] = None) -> List[TripOut]:
        """Fetches all trips for a given user."""
        if settings.is_supabase_configured:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY}",
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/trips?select=*&order=created_at.desc"
                if user_id:
                    url += f"&user_id=eq.{user_id}"

                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        records = resp.json()
                        return [TripOut(**rec) for rec in records]
            except Exception as e:
                logger.warning(f"Supabase list_trips query failed: {e}. Falling back to demo memory.")

        # In-memory fallback
        trips = list(self._demo_trips.values())
        trips.sort(key=lambda x: x["created_at"], reverse=True)
        return [TripOut(**t) for t in trips]

    async def get_trip(self, trip_id: str) -> Optional[TripOut]:
        """Fetches a specific trip by its ID."""
        if settings.is_supabase_configured:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY}",
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/trips?id=eq.{trip_id}&select=*"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data:
                            return TripOut(**data[0])
            except Exception as e:
                logger.warning(f"Supabase get_trip query failed: {e}. Falling back to demo memory.")

        if trip_id in self._demo_trips:
            return TripOut(**self._demo_trips[trip_id])
        return None

    async def create_trip(self, trip_in: TripCreate, user_id: Optional[str] = "demo-user-123") -> TripOut:
        """Saves a newly generated or planned trip."""
        new_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        record = {
            "id": new_id,
            "user_id": user_id,
            "title": trip_in.title,
            "destination": trip_in.destination,
            "starting_location": trip_in.starting_location,
            "start_date": trip_in.start_date,
            "end_date": trip_in.end_date,
            "traveler_count": trip_in.traveler_count,
            "budget": trip_in.budget,
            "currency": trip_in.currency,
            "travel_style": trip_in.travel_style,
            "preferences": trip_in.preferences,
            "itinerary": trip_in.itinerary,
            "estimated_total_cost": trip_in.estimated_total_cost,
            "status": trip_in.status,
            "created_at": now,
            "updated_at": now
        }

        if settings.is_supabase_configured:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/trips"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=record, headers=headers)
                    if resp.status_code in [200, 201]:
                        created_record = resp.json()[0]
                        return TripOut(**created_record)
            except Exception as e:
                logger.warning(f"Supabase create_trip failed: {e}. Storing in demo memory.")

        self._demo_trips[new_id] = record
        return TripOut(**record)

    async def update_trip(self, trip_id: str, trip_update: TripUpdate) -> Optional[TripOut]:
        """Updates an existing trip."""
        now = datetime.now(timezone.utc).isoformat()
        update_data = trip_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = now

        if settings.is_supabase_configured:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/trips?id=eq.{trip_id}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.patch(url, json=update_data, headers=headers)
                    if resp.status_code == 200:
                        updated_records = resp.json()
                        if updated_records:
                            return TripOut(**updated_records[0])
            except Exception as e:
                logger.warning(f"Supabase update_trip failed: {e}. Updating in demo memory.")

        if trip_id in self._demo_trips:
            self._demo_trips[trip_id].update(update_data)
            return TripOut(**self._demo_trips[trip_id])

        return None

    async def delete_trip(self, trip_id: str) -> bool:
        """Deletes a trip."""
        if settings.is_supabase_configured:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY}",
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/trips?id=eq.{trip_id}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.delete(url, headers=headers)
                    if resp.status_code in [200, 204]:
                        return True
            except Exception as e:
                logger.warning(f"Supabase delete_trip failed: {e}. Deleting from demo memory.")

        if trip_id in self._demo_trips:
            del self._demo_trips[trip_id]
            return True
        return False

    async def duplicate_trip(self, trip_id: str) -> Optional[TripOut]:
        """Duplicates an existing trip with a copy title."""
        original = await self.get_trip(trip_id)
        if not original:
            return None

        copy_in = TripCreate(
            title=f"{original.title} (Copy)",
            destination=original.destination,
            starting_location=original.starting_location,
            start_date=original.start_date,
            end_date=original.end_date,
            traveler_count=original.traveler_count,
            budget=original.budget,
            currency=original.currency,
            travel_style=original.travel_style,
            preferences=original.preferences,
            itinerary=original.itinerary,
            estimated_total_cost=original.estimated_total_cost,
            status="planned"
        )
        return await self.create_trip(copy_in, user_id=original.user_id)

supabase_service = SupabaseService()
