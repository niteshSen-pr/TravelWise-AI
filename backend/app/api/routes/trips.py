from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
import logging

from ...schemas.trip import TripCreate, TripUpdate, TripOut
from ...services.trip_service import trip_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripOut])
async def list_trips(user_id: Optional[str] = Query(None)):
    """
    Returns all saved trips. In demo mode returns pre-seeded and saved demo trips.
    """
    try:
        return await trip_service.get_all_trips(user_id)
    except Exception as exc:
        logger.exception("Failed to list trips")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve trips")

@router.post("", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def create_trip(trip_in: TripCreate, user_id: Optional[str] = Query(None)):
    """
    Saves a newly generated trip to Supabase or demo storage.
    """
    try:
        return await trip_service.create_new_trip(trip_in, user_id)
    except Exception as exc:
        logger.exception("Failed to create trip")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save trip")

@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(trip_id: str):
    """
    Retrieves a single trip by ID.
    """
    trip = await trip_service.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip '{trip_id}' not found")
    return trip

@router.put("/{trip_id}", response_model=TripOut)
async def update_trip(trip_id: str, trip_update: TripUpdate):
    """
    Updates an existing trip (itinerary modifications, title, dates, etc.).
    """
    updated = await trip_service.update_existing_trip(trip_id, trip_update)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip '{trip_id}' not found")
    return updated

@router.delete("/{trip_id}", status_code=status.HTTP_200_OK)
async def delete_trip(trip_id: str):
    """
    Deletes a saved trip.
    """
    success = await trip_service.remove_trip(trip_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip '{trip_id}' not found")
    return {"message": "Trip deleted successfully", "id": trip_id}

@router.post("/{trip_id}/duplicate", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def duplicate_trip(trip_id: str):
    """
    Creates a duplicate copy of a saved trip.
    """
    duplicated = await trip_service.duplicate_trip(trip_id)
    if not duplicated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip '{trip_id}' could not be duplicated")
    return duplicated
