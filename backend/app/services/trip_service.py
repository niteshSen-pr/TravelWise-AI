from typing import List, Optional
from ..schemas.trip import TripCreate, TripUpdate, TripOut
from .supabase_service import supabase_service

class TripService:
    @staticmethod
    async def get_all_trips(user_id: Optional[str] = None) -> List[TripOut]:
        return await supabase_service.list_trips(user_id)

    @staticmethod
    async def get_trip_by_id(trip_id: str) -> Optional[TripOut]:
        return await supabase_service.get_trip(trip_id)

    @staticmethod
    async def create_new_trip(trip_in: TripCreate, user_id: Optional[str] = None) -> TripOut:
        return await supabase_service.create_trip(trip_in, user_id)

    @staticmethod
    async def update_existing_trip(trip_id: str, trip_update: TripUpdate) -> Optional[TripOut]:
        return await supabase_service.update_trip(trip_id, trip_update)

    @staticmethod
    async def remove_trip(trip_id: str) -> bool:
        return await supabase_service.delete_trip(trip_id)

    @staticmethod
    async def duplicate_trip(trip_id: str) -> Optional[TripOut]:
        return await supabase_service.duplicate_trip(trip_id)

trip_service = TripService()
