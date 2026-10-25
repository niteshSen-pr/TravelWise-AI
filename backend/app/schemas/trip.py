from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Dict
from datetime import date
from .itinerary import ItineraryResponse

class TripPreferences(BaseModel):
    destination: str = Field(..., min_length=2, max_length=150, description="City, region, or country")
    starting_location: Optional[str] = Field(None, max_length=150, description="Origin location (optional)")
    country: Optional[str] = Field(None, max_length=100)
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    traveler_count: int = Field(default=1, ge=1, le=50, description="Number of travelers")
    budget: float = Field(default=1000.0, ge=0, description="Total budget")
    currency: str = Field(default="USD", max_length=10)
    travel_style: List[str] = Field(default_factory=lambda: ["Cultural exploration", "Relaxation"])
    pace: str = Field(default="Balanced", description="Relaxed, Balanced, or Packed")
    food_preference: str = Field(default="No preference", description="Vegetarian, Vegan, Non-vegetarian, No preference")
    accommodation_type: str = Field(default="Hotel", description="Budget hotel, Hotel, Hostel, Resort, Other")
    transport_preference: str = Field(default="Mixed", description="Public transport, Walking, Taxi/Rideshare, Rental vehicle, Mixed")
    accessibility: Optional[str] = Field(None, description="Accessibility requirements")
    special_requests: Optional[str] = Field(None, description="Special requests or notes")

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, end_val, info):
        start_val = info.data.get('start_date')
        if start_val and end_val:
            try:
                d_start = date.fromisoformat(start_val)
                d_end = date.fromisoformat(end_val)
                if d_end < d_start:
                    raise ValueError("End date cannot be earlier than start date")
                delta_days = (d_end - d_start).days + 1
                if delta_days > 30:
                    raise ValueError("Trip duration cannot exceed 30 days for optimal planning")
            except ValueError as e:
                if "End date cannot" in str(e) or "Trip duration" in str(e):
                    raise e
                raise ValueError("Dates must be valid ISO format (YYYY-MM-DD)")
        return end_val

class RegenerateDayRequest(BaseModel):
    trip_preferences: TripPreferences
    current_itinerary: ItineraryResponse
    day_number: int = Field(..., ge=1)
    instructions: Optional[str] = None

class ReviseItineraryRequest(BaseModel):
    current_itinerary: ItineraryResponse
    instructions: str = Field(..., min_length=3, description="User instruction for revising itinerary")

class TripCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    destination: str = Field(..., min_length=2, max_length=150)
    starting_location: Optional[str] = None
    start_date: str
    end_date: str
    traveler_count: int = Field(default=1, ge=1)
    budget: float = Field(default=0.0, ge=0)
    currency: str = "USD"
    travel_style: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    itinerary: Dict[str, Any] = Field(default_factory=dict)
    estimated_total_cost: float = Field(default=0.0, ge=0)
    status: str = Field(default="planned")

class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    starting_location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    traveler_count: Optional[int] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    travel_style: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    itinerary: Optional[Dict[str, Any]] = None
    estimated_total_cost: Optional[float] = None
    status: Optional[str] = None

class TripOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    destination: str
    starting_location: Optional[str] = None
    start_date: str
    end_date: str
    traveler_count: int
    budget: float
    currency: str
    travel_style: Optional[str] = None
    preferences: Dict[str, Any]
    itinerary: Dict[str, Any]
    estimated_total_cost: float
    status: str
    created_at: str
    updated_at: str
