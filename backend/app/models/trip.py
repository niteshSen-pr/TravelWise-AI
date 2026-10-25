"""
Trip data domain definitions and database representations.
"""
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

@dataclass
class TripModel:
    id: str
    user_id: Optional[str]
    title: str
    destination: str
    starting_location: Optional[str]
    start_date: str
    end_date: str
    traveler_count: int
    budget: float
    currency: str
    travel_style: Optional[str]
    preferences: Dict[str, Any]
    itinerary: Dict[str, Any]
    estimated_total_cost: float
    status: str
    created_at: str
    updated_at: str
