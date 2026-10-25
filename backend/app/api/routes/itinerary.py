from fastapi import APIRouter, HTTPException, status
import logging
from ...schemas.trip import TripPreferences, RegenerateDayRequest, ReviseItineraryRequest
from ...schemas.itinerary import ItineraryResponse, ItineraryDay
from ...services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])

@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(prefs: TripPreferences):
    """
    Validates preferences and generates a structured, day-by-day travel plan
    using configured Generative AI or intelligent demo engine.
    """
    try:
        itinerary = await ai_service.generate_itinerary(prefs)
        return itinerary
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(val_err))
    except Exception as exc:
        logger.exception("Error while generating itinerary")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Generation failed: {str(exc)}")

@router.post("/regenerate-day", response_model=ItineraryDay)
async def regenerate_itinerary_day(req: RegenerateDayRequest):
    """
    Regenerates only one specified day while preserving the rest of the itinerary.
    """
    try:
        new_day = ai_service.regenerate_itinerary_day(
            prefs=req.trip_preferences,
            day_number=req.day_number,
            current_itinerary=req.current_itinerary,
            instructions=req.instructions
        )
        return new_day
    except Exception as exc:
        logger.exception("Error regenerating day")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Day regeneration failed: {str(exc)}")

@router.post("/revise", response_model=ItineraryResponse)
async def revise_itinerary(req: ReviseItineraryRequest):
    """
    Revises the complete itinerary based on user natural language instructions.
    """
    try:
        revised = ai_service.revise_itinerary(req.current_itinerary, req.instructions)
        return revised
    except Exception as exc:
        logger.exception("Error revising itinerary")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Revision failed: {str(exc)}")
