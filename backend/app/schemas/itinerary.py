from pydantic import BaseModel, Field
from typing import List, Optional

class TransportToNext(BaseModel):
    mode: str = Field(..., description="Mode of transport e.g. walking, metro, taxi")
    estimated_duration_minutes: int = Field(default=15, ge=0)
    estimated_cost: float = Field(default=0.0, ge=0)
    notes: str = Field(default="")
    origin: Optional[str] = None
    destination: Optional[str] = None
    directions_url: Optional[str] = None

class Activity(BaseModel):
    id: str = Field(..., description="Unique activity identifier")
    time: str = Field(..., description="Scheduled time e.g. 09:30 AM")
    period: str = Field(default="morning", description="morning, afternoon, or evening")
    name: str = Field(..., description="Activity or attraction name")
    description: str = Field(..., description="Detailed description")
    location: str = Field(..., description="Specific location or address")
    duration_minutes: int = Field(default=60, ge=10)
    estimated_cost: float = Field(default=0.0, ge=0)
    transport_to_next: Optional[TransportToNext] = None
    booking_info_link: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class MealSuggestion(BaseModel):
    type: str = Field(..., description="breakfast, lunch, or dinner")
    suggestion: str = Field(..., description="Restaurant name or food spot")
    estimated_cost: float = Field(default=0.0, ge=0)
    cuisine: Optional[str] = None
    location: Optional[str] = None

class AccommodationRecommendation(BaseModel):
    name: str
    type: str = "Hotel"
    estimated_nightly_cost: float = 0.0
    notes: str = ""
    location: Optional[str] = None

class DayTransportationSummary(BaseModel):
    primary_mode: str = "Public transit & walking"
    total_travel_time_minutes: int = 30
    estimated_transport_cost: float = 0.0
    highlights: List[str] = Field(default_factory=list)

class ItineraryDay(BaseModel):
    day_number: int = Field(..., ge=1)
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    theme: str = Field(..., description="Focus or title for the day")
    activities: List[Activity] = Field(default_factory=list)
    meals: List[MealSuggestion] = Field(default_factory=list)
    accommodation: Optional[AccommodationRecommendation] = None
    transportation_summary: Optional[DayTransportationSummary] = None
    daily_estimated_cost: float = Field(default=0.0, ge=0)
    travel_tips: List[str] = Field(default_factory=list)

class BudgetBreakdown(BaseModel):
    transportation: float = 0.0
    accommodation: float = 0.0
    food: float = 0.0
    activities: float = 0.0
    other: float = 0.0

class ItineraryResponse(BaseModel):
    destination: str
    summary: str
    currency: str = "USD"
    travel_style: str = "Exploration"
    traveler_count: int = 1
    total_days: int = 1
    estimated_total_cost: float = 0.0
    estimated_cost_per_person: float = 0.0
    user_budget: float = 0.0
    budget_remaining: float = 0.0
    is_over_budget: bool = False
    days: List[ItineraryDay] = Field(default_factory=list)
    budget_breakdown: BudgetBreakdown = Field(default_factory=BudgetBreakdown)
    general_tips: List[str] = Field(default_factory=list)
    disclaimer: str = "Prices, schedules, and route durations are estimates unless independently verified."
    generated_by: str = "demo"
