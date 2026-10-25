"""
Domain model structures for Itinerary components.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class ActivityModel:
    id: str
    time: str
    period: str
    name: str
    description: str
    location: str
    duration_minutes: int
    estimated_cost: float
    transport_to_next: Optional[Dict[str, Any]] = None
    booking_info_link: Optional[str] = None
    tags: List[str] = field(default_factory=list)

@dataclass
class DayModel:
    day_number: int
    date: str
    theme: str
    activities: List[ActivityModel] = field(default_factory=list)
    daily_estimated_cost: float = 0.0
