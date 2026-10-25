import urllib.parse
from typing import Optional, Dict, Any, List
from ..schemas.itinerary import TransportToNext, DayTransportationSummary

class TransportationService:
    """
    Transportation planning service providing route estimates,
    recommended transport modes based on user preferences and distance heuristics,
    approximate costs, and verified OpenStreetMap navigation links.
    """

    MODE_COSTS = {
        "walking": 0.0,
        "public transport": 2.50,
        "metro": 3.00,
        "bus": 2.25,
        "taxi": 18.00,
        "rideshare": 15.00,
        "rental vehicle": 45.00,
        "mixed": 5.00,
    }

    @staticmethod
    def generate_osm_directions_url(origin: str, destination: str, mode: str = "car") -> str:
        """
        Creates an OpenStreetMap directions link or search link.
        """
        enc_orig = urllib.parse.quote(origin.strip())
        enc_dest = urllib.parse.quote(destination.strip())
        # Use OpenStreetMap standard routing query
        engine = "fossgis_osrm_foot" if "walk" in mode.lower() else "fossgis_osrm_car"
        return f"https://www.openstreetmap.org/directions?engine={engine}&route={enc_orig}%3B{enc_dest}"

    @staticmethod
    def generate_osm_search_url(location: str) -> str:
        enc_loc = urllib.parse.quote(location.strip())
        return f"https://www.openstreetmap.org/search?query={enc_loc}"

    @classmethod
    def calculate_leg_transport(
        cls,
        origin: str,
        destination: str,
        preferred_mode: str = "Mixed",
        distance_km_estimate: float = 2.5,
        city_context: str = ""
    ) -> TransportToNext:
        """
        Calculates recommended mode, duration, cost, and navigation link between two points.
        """
        pref = preferred_mode.lower()

        # Heuristic determination based on distance and preference
        if "walk" in pref or (distance_km_estimate <= 1.2 and "taxi" not in pref and "rental" not in pref):
            mode = "Walking"
            duration = int(max(5, distance_km_estimate * 14))  # ~14 min per km
            cost = 0.0
            notes = f"Scenic stroll through {city_context or 'the neighborhood'} (~{distance_km_estimate:.1f} km). Great for pedestrian sightseeing."
        elif "public" in pref or "mixed" in pref or "transit" in pref:
            if distance_km_estimate <= 1.5 and "walk" in pref:
                mode = "Walking"
                duration = int(max(8, distance_km_estimate * 13))
                cost = 0.0
                notes = f"Quick {duration}-minute walk between sites."
            else:
                mode = "Public Transit / Metro"
                duration = int(10 + distance_km_estimate * 4)
                cost = 2.50
                notes = f"Take local metro or high-frequency bus line. Economical and avoids traffic."
        elif "taxi" in pref or "rideshare" in pref:
            mode = "Taxi / Rideshare"
            duration = int(8 + distance_km_estimate * 3.5)
            cost = round(8.0 + distance_km_estimate * 2.2, 2)
            notes = f"Quick direct rideshare via Uber/local cab service (~{duration} mins)."
        elif "rental" in pref:
            mode = "Rental Car / Drive"
            duration = int(6 + distance_km_estimate * 3)
            cost = round(3.0 + distance_km_estimate * 0.5, 2)  # gas & parking estimate per leg
            notes = f"Drive via main arterial roads. Check local parking garage availability."
        else:
            mode = "Public Transit"
            duration = int(12 + distance_km_estimate * 4)
            cost = 2.50
            notes = "Standard local transport connection."

        directions_url = cls.generate_osm_directions_url(origin, destination, mode)

        return TransportToNext(
            mode=mode,
            estimated_duration_minutes=duration,
            estimated_cost=cost,
            notes=notes,
            origin=origin,
            destination=destination,
            directions_url=directions_url
        )

    @classmethod
    def generate_daily_summary(
        cls,
        legs: List[TransportToNext],
        preferred_mode: str = "Mixed"
    ) -> DayTransportationSummary:
        """
        Summarizes transportation logistics for an entire day.
        """
        if not legs:
            return DayTransportationSummary(
                primary_mode="Walking & Central Exploration",
                total_travel_time_minutes=15,
                estimated_transport_cost=0.0,
                highlights=["All activities within walking perimeter", "No major transit required"]
            )

        total_time = sum(leg.estimated_duration_minutes for leg in legs)
        total_cost = sum(leg.estimated_cost for leg in legs)
        modes = [leg.mode for leg in legs]
        primary_mode = max(set(modes), key=modes.count)

        highlights = [
            f"{len(legs)} inter-activity connections planned",
            f"Estimated total in-transit time: ~{total_time} mins",
            f"Primary movement mode: {primary_mode}"
        ]

        if any("metro" in m.lower() or "transit" in m.lower() for m in modes):
            highlights.append("Transit day pass or contactless card recommended for convenience")

        return DayTransportationSummary(
            primary_mode=primary_mode,
            total_travel_time_minutes=total_time,
            estimated_transport_cost=round(total_cost, 2),
            highlights=highlights
        )

transportation_service = TransportationService()
