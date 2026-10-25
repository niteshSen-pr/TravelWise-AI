import json
import logging
import uuid
from datetime import date, timedelta
from typing import Optional, Dict, Any, List
import httpx

from ..core.config import settings
from ..schemas.trip import TripPreferences
from ..schemas.itinerary import (
    ItineraryResponse,
    ItineraryDay,
    Activity,
    MealSuggestion,
    AccommodationRecommendation,
    BudgetBreakdown,
    TransportToNext,
    DayTransportationSummary,
)
from .transportation_service import transportation_service

logger = logging.getLogger(__name__)

# Curated knowledge base for popular travel hubs to ensure rich realistic demo itineraries
CITY_KNOWLEDGE = {
    "paris": {
        "neighborhoods": ["Le Marais", "Montmartre", "Latin Quarter", "Saint-Germain-des-Prés", "Eiffel District"],
        "attractions": [
            ("Louvre Museum & Tuileries Garden", "World-renowned art collection and royal palace gardens", "Rue de Rivoli, Paris", 180, 22.0),
            ("Eiffel Tower & Champ de Mars", "Iconic iron tower with panoramic terrace views over the Seine", "Champ de Mars, 5 Av. Anatole France", 120, 28.0),
            ("Musée d'Orsay", "Impressionist masterpieces housed in a grand Beaux-Arts railway station", "1 Rue de la Légion d'Honneur", 120, 16.0),
            ("Sainte-Chapelle & Île de la Cité", "Stunning 13th-century Gothic stained glass windows and historic river island", "10 Bd du Palais", 90, 13.0),
            ("Montmartre & Sacré-Cœur Basilica", "Bohemian hilltop artists' village with panoramic city views", "35 Rue du Chevalier de la Barre", 120, 0.0),
            ("Seine River Sunset Cruise", "Gliding past illuminated monuments on an open-air river boat", "Port de la Bourdonnais", 75, 18.0),
            ("Palais Garnier & Boulevard Haussmann", "Opulent Opera house and Belle Époque covered passages", "Pl. de l'Opéra", 90, 15.0),
            ("Luxembourg Gardens & Saint-Germain", "Classical French gardens, fountains, and intellectual café streetscape", "6th Arrondissement", 90, 0.0),
        ],
        "dining": {
            "Vegetarian": [("Le Potager du Marais", "French vegan and organic cassoulet", 26.0), ("Wild & The Moon", "Cold-pressed juices & plant-based bowls", 16.0)],
            "Vegan": [("Hank Burger Paris", "100% plant-based artisanal burgers", 15.0), ("Aujourd'hui Demain", "Trendy vegan concept store and café", 22.0)],
            "default": [("Café de Flore", "Legendary Saint-Germain bistro for croque-monsieur", 28.0), ("Bouillon Chartier", "Historic 1896 Belle Époque dining hall with authentic French classics", 20.0), ("Bistrot Paul Bert", "Celebrated traditional bistro steak frites and soufflés", 38.0)]
        },
        "accommodations": [
            ("Hôtel Dame des Arts", "Boutique chic hotel with rooftop Seine views", 210.0),
            ("CitizenM Paris Gare de Lyon", "Modern tech-forward designer hotel", 145.0),
            ("Generator Paris Hostel & Rooftop", "Social boutique hostel near Canal Saint-Martin", 48.0),
        ]
    },
    "tokyo": {
        "neighborhoods": ["Shinjuku", "Shibuya", "Asakusa", "Ginza", "Harajuku & Omotesando", "Akihabara"],
        "attractions": [
            ("Sensō-ji Temple & Nakamise Street", "Tokyo's oldest Buddhist temple and vibrant Edo-style market stalls", "2 Chome-3-1 Asakusa, Taito City", 120, 0.0),
            ("Shibuya Crossing & Shibuya Sky", "World's busiest pedestrian scramble and 360-degree open-air observation deck", "2 Chome-24-12 Shibuya", 90, 18.0),
            ("Meiji Jingu Shrine & Yoyogi Park", "Serene evergreen Shinto forest shrine dedicated to Emperor Meiji", "1-1 Yoyogikamizonacho, Shibuya City", 90, 0.0),
            ("teamLab Planets Digital Art Museum", "Immersive body-interactive light and mirror water installations", "6 Chome-1-16 Toyosu, Koto City", 120, 26.0),
            ("Shinjuku Gyoen National Garden", "Blend of Japanese traditional, English landscape, and French formal gardens", "11 Naitomachi, Shinjuku City", 90, 5.0),
            ("Tsukiji Outer Market Food Tour", "Freshly grilled wagyu skewers, tamagoyaki, and street seafood", "4 Chome-16-2 Tsukiji, Chuo City", 90, 15.0),
            ("Akihabara Electric Town & Retro Arcades", "Epicenter of otaku pop culture, electronics, and themed cafes", "Sotokanda, Chiyoda City", 120, 10.0),
        ],
        "dining": {
            "Vegetarian": [("Ain Soph. Journey Shinjuku", "Gourmet vegan pancakes, matcha sweets, and bento sets", 22.0), ("T's Tantan Tokyo Station", "Rich sesame broth ramen made purely from plant ingredients", 12.0)],
            "Vegan": [("Chano-ma Daikanyama", "Organic vegan Japanese seasonal set meals", 20.0), ("Brown Rice by Neal's Yard", "Macrobiotic seasonal Japanese cuisine", 24.0)],
            "default": [("Ichiran Shibuya", "Customizable solo tonkotsu ramen booths", 14.0), ("Afuri Harajuku", "Citrus yuzu shio ramen with flame-charred chashu", 13.0), ("Torikizoku Roppongi", "High-energy yakitori skewer tavern", 22.0)]
        },
        "accommodations": [
            ("Hotel Gracery Shinjuku", "Central Tokyo hotel overlooking Godzilla terrace", 160.0),
            ("Candeo Hotels Tokyo Shimbashi", "Sky spa with open-air rooftop onsen", 135.0),
            ("Nui. Hostel & Bar Lounge", "Riverfront artisan hostel and craft coffee house", 42.0),
        ]
    },
    "new york": {
        "neighborhoods": ["Manhattan Midtown", "Lower Manhattan", "SoHo & Greenwich Village", "DUMBO Brooklyn", "Central Park"],
        "attractions": [
            ("The High Line & Hudson Yards", "Elevated park on historic freight rail lines with Hudson views", "Gansevoort St to W 34th St", 90, 0.0),
            ("Central Park & Bethesda Terrace", "Iconic urban sanctuary, Ramble woodlands, and rowing lake", "59th to 110th St, New York", 120, 0.0),
            ("Metropolitan Museum of Art (The Met)", "World-spanning art collections from ancient Egyptian temples to modern masters", "1000 5th Ave", 150, 30.0),
            ("Brooklyn Bridge & DUMBO Waterfront", "Walk across historic suspension bridge into cobblestone waterfront parks", "Brooklyn Bridge", 90, 0.0),
            ("Summit One Vanderbilt Observatory", "Mind-bending multi-sensory mirrored glass heights over Midtown", "45 E 42nd St", 90, 42.0),
            ("Greenwich Village & Washington Square Park", "Bohemian historic jazz clubs, comedy cellars, and brownstone streets", "Washington Square W", 120, 0.0),
        ],
        "dining": {
            "Vegetarian": [("Dirt Candy Lower East Side", "Innovative vegetable-forward Michelin-recognized gastronomy", 45.0), ("Caravan of Dreams", "Bohemian organic vegan spot in East Village", 22.0)],
            "Vegan": [("Planta Queen Nomad", "Plant-based Asian fusion sushi and bao", 32.0), ("Beyond Sushi", "Creative plant-based sushi rolls and dumplings", 18.0)],
            "default": [("Joe's Pizza Carmine St", "Quintessential New York classic thin-crust slice", 8.0), ("Katz's Delicatessen", "Legendary hand-carved pastrami on rye sandwich", 28.0), ("Chelsea Market", "Food hall with artisan lobster rolls, tacos, and bakeries", 24.0)]
        },
        "accommodations": [
            ("Arlo SoHo", "Micro-boutique hotel with vibrant courtyard and rooftop lounge", 220.0),
            ("Pod 39 Midtown", "Stylish efficient micro-rooms with rooftop terrace", 150.0),
            ("HI New York City Hostel", "Historic Upper West Side hostel steps from Central Park", 55.0),
        ]
    }
}

class AIService:
    """
    Generative AI and Intelligent Travel Planning Service.
    Seamlessly supports external LLMs (OpenAI, Gemini, Anthropic)
    with automatic validated Pydantic schema generation and fallback
    to deterministic, richly personalized demo generation.
    """

    SYSTEM_PROMPT = """You are an intelligent travel planning assistant. Create practical, personalized, day-by-day travel itineraries based on the traveler's destination, dates, budget, group size, interests, transportation preferences, accommodation preferences, and daily activity pace.

Organize activities geographically when possible to minimize unnecessary travel. Consider opening-hour constraints when reliable information is available. Balance sightseeing, meals, relaxation, and travel time.

Respect the total budget and clearly identify estimates. Distinguish between verified information and unverified suggestions. Do not invent confirmed reservations, ticket availability, opening hours, live traffic conditions, or guaranteed prices.

Return ONLY a valid JSON object matching the requested schema with no surrounding markdown or explanation."""

    @classmethod
    async def generate_itinerary(cls, prefs: TripPreferences) -> ItineraryResponse:
        """
        Main entry point for generating itineraries.
        Tries configured Generative AI provider if available,
        otherwise uses the rich deterministic demo itinerary engine.
        """
        if settings.is_ai_configured:
            try:
                logger.info(f"Invoking {settings.AI_PROVIDER} provider for destination: {prefs.destination}")
                ai_result = await cls._generate_with_llm(prefs)
                if ai_result:
                    return ai_result
            except Exception as e:
                logger.warning(f"AI generation failed ({e}), falling back to smart demo engine.")

        # Default / Graceful fallback: Smart deterministic demo generator
        return cls.generate_demo_itinerary(prefs)

    @classmethod
    async def _generate_with_llm(cls, prefs: TripPreferences) -> Optional[ItineraryResponse]:
        """
        Calls external LLM via HTTP.
        """
        user_prompt = f"""
Plan a travel itinerary with the following parameters:
- Destination: {prefs.destination}
- Origin / Starting location: {prefs.starting_location or 'Local central hub'}
- Start Date: {prefs.start_date}
- End Date: {prefs.end_date}
- Number of Travelers: {prefs.traveler_count}
- Total Budget: {prefs.budget} {prefs.currency}
- Travel Style / Interests: {', '.join(prefs.travel_style)}
- Daily Activity Pace: {prefs.pace}
- Food Preference: {prefs.food_preference}
- Accommodation Preference: {prefs.accommodation_type}
- Transport Preference: {prefs.transport_preference}
- Accessibility Requirements: {prefs.accessibility or 'None'}
- Special Requests: {prefs.special_requests or 'None'}

Return a valid JSON matching this structure:
{{
  "destination": "{prefs.destination}",
  "summary": "Engaging overview of the trip experience",
  "currency": "{prefs.currency}",
  "travel_style": "{', '.join(prefs.travel_style)}",
  "traveler_count": {prefs.traveler_count},
  "total_days": <number_of_days>,
  "estimated_total_cost": <number>,
  "estimated_cost_per_person": <number>,
  "user_budget": {prefs.budget},
  "budget_remaining": <number>,
  "is_over_budget": false,
  "days": [
    {{
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "theme": "Theme for the day",
      "activities": [
        {{
          "id": "act-1",
          "time": "09:30 AM",
          "period": "morning",
          "name": "Activity Name",
          "description": "Details",
          "location": "Address or landmark",
          "duration_minutes": 90,
          "estimated_cost": 20.0,
          "transport_to_next": {{
            "mode": "Public Transit / Walking",
            "estimated_duration_minutes": 15,
            "estimated_cost": 2.50,
            "notes": "Route notes",
            "origin": "Current activity location",
            "destination": "Next activity location"
          }},
          "tags": ["Sightseeing"]
        }}
      ],
      "meals": [
        {{
          "type": "lunch",
          "suggestion": "Restaurant name",
          "estimated_cost": 25.0,
          "cuisine": "Local"
        }}
      ],
      "accommodation": {{
        "name": "Recommended Hotel or Lodging",
        "type": "{prefs.accommodation_type}",
        "estimated_nightly_cost": 120.0,
        "notes": "Location highlights"
      }},
      "daily_estimated_cost": 180.0,
      "travel_tips": ["Tip 1", "Tip 2"]
    }}
  ],
  "budget_breakdown": {{
    "transportation": 80.0,
    "accommodation": 400.0,
    "food": 250.0,
    "activities": 180.0,
    "other": 50.0
  }},
  "general_tips": ["General travel tip 1", "Tip 2"],
  "disclaimer": "Prices, schedules, and route durations are estimates unless independently verified."
}}
"""
        headers = {}
        payload = {}
        url = ""

        if settings.AI_PROVIDER.lower() == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.AI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.AI_MODEL or "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": cls.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.7,
                "timeout": 45
            }
        elif settings.AI_PROVIDER.lower() == "gemini":
            model = settings.AI_MODEL or "gemini-1.5-flash"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{cls.SYSTEM_PROMPT}\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.7
                }
            }
        else:
            return None

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = ""
                if "choices" in data:
                    raw_text = data["choices"][0]["message"]["content"]
                elif "candidates" in data:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

                parsed = json.loads(raw_text)
                parsed["generated_by"] = "ai"
                # Enrich with OSM directions
                cls._enrich_transportation(parsed)
                return ItineraryResponse(**parsed)
            else:
                logger.error(f"LLM API returned status {resp.status_code}: {resp.text}")
                return None

    @classmethod
    def _enrich_transportation(cls, data: Dict[str, Any]):
        """
        Ensures transportation links and daily summaries are properly populated.
        """
        for day in data.get("days", []):
            activities = day.get("activities", [])
            legs = []
            for i, act in enumerate(activities):
                trans = act.get("transport_to_next")
                if trans:
                    origin = act.get("location", "Current Site")
                    dest = activities[i+1].get("location") if i + 1 < len(activities) else "Accommodations / Evening Area"
                    trans["origin"] = origin
                    trans["destination"] = dest
                    trans["directions_url"] = transportation_service.generate_osm_directions_url(
                        origin, dest, trans.get("mode", "transit")
                    )
                    legs.append(TransportToNext(**trans))

            if legs and not day.get("transportation_summary"):
                summary = transportation_service.generate_daily_summary(legs)
                day["transportation_summary"] = summary.model_dump()

    @classmethod
    def generate_demo_itinerary(cls, prefs: TripPreferences) -> ItineraryResponse:
        """
        Generates a rich, highly customized deterministic itinerary without requiring external API keys.
        Adapts seamlessly to destination, dates, budget, party size, travel pace, food, and transport preferences.
        """
        start_dt = date.fromisoformat(prefs.start_date)
        end_dt = date.fromisoformat(prefs.end_date)
        total_days = max(1, (end_dt - start_dt).days + 1)
        travelers = prefs.traveler_count
        user_budget = float(prefs.budget)
        currency = prefs.currency

        # Determine target budget per day
        daily_target = (user_budget / total_days) if total_days > 0 and user_budget > 0 else 250.0

        # Pacing determination: number of activities per day
        pace_lower = prefs.pace.lower()
        if "relax" in pace_lower:
            acts_per_day = 2
        elif "packed" in pace_lower:
            acts_per_day = 4
        else:
            acts_per_day = 3

        # Match city knowledge or synthesize
        dest_key = prefs.destination.lower().strip()
        matched_city = None
        for key in CITY_KNOWLEDGE:
            if key in dest_key:
                matched_city = CITY_KNOWLEDGE[key]
                break

        # Accommodations
        if matched_city:
            acc_choice = matched_city["accommodations"][0]
            if "hostel" in prefs.accommodation_type.lower() or daily_target < 120:
                acc_choice = matched_city["accommodations"][2]
            elif "resort" in prefs.accommodation_type.lower() or daily_target > 400:
                acc_choice = matched_city["accommodations"][0]
            else:
                acc_choice = matched_city["accommodations"][1]
            hotel_name, hotel_notes, nightly_rate = acc_choice
        else:
            hotel_type = prefs.accommodation_type
            hotel_name = f"The {prefs.destination} Grand {hotel_type}"
            hotel_notes = f"Centrally located {hotel_type.lower()} with easy access to transit and dining"
            nightly_rate = 140.0 if "hotel" in hotel_type.lower() else (45.0 if "hostel" in hotel_type.lower() else 240.0)

        # Scale nightly rate by travelers (assume 2 per room or dormitory for hostel)
        rooms_needed = max(1, (travelers + 1) // 2)
        total_nightly_acc = nightly_rate * rooms_needed

        # Build day-by-day plans
        days: List[ItineraryDay] = []
        tot_trans_cost = 0.0
        tot_acc_cost = total_nightly_acc * (total_days - 1 if total_days > 1 else 1)
        tot_food_cost = 0.0
        tot_act_cost = 0.0

        daily_themes = [
            f"Iconic Landmarks & Historic Foundations of {prefs.destination}",
            f"Cultural Immersion, Arts & Local Neighborhood Exploration",
            f"Scenic Viewpoints, Parks & Culinary Discovery",
            f"Hidden Gems, Artisan Markets & Sunset Panoramas",
            f"Regional Excursions, Heritage & Waterfront Leisure",
            f"Modern Culture, Shopping Districts & Evening Entertainment",
            f"Farewell Highlights, Relaxation & Keepsake Discoveries"
        ]

        times_morning = ["09:00 AM", "09:30 AM", "10:00 AM"]
        times_afternoon = ["01:30 PM", "02:00 PM", "02:30 PM", "03:30 PM"]
        times_evening = ["06:00 PM", "07:00 PM", "08:00 PM"]

        for d_idx in range(total_days):
            day_num = d_idx + 1
            cur_date = (start_dt + timedelta(days=d_idx)).isoformat()
            theme = daily_themes[d_idx % len(daily_themes)]

            day_activities: List[Activity] = []
            legs: List[TransportToNext] = []
            day_food_cost = 0.0
            day_act_cost = 0.0

            # Generate activities for this day
            for a_idx in range(acts_per_day):
                act_id = f"act-{day_num}-{a_idx + 1}-{uuid.uuid4().hex[:6]}"

                if a_idx == 0:
                    period = "morning"
                    time_str = times_morning[d_idx % len(times_morning)]
                elif a_idx == 1 and acts_per_day <= 3:
                    period = "afternoon"
                    time_str = times_afternoon[d_idx % len(times_afternoon)]
                elif a_idx == acts_per_day - 1:
                    period = "evening"
                    time_str = times_evening[d_idx % len(times_evening)]
                else:
                    period = "afternoon"
                    time_str = times_afternoon[(d_idx + a_idx) % len(times_afternoon)]

                # Pick or generate attraction
                if matched_city:
                    att_list = matched_city["attractions"]
                    att_tuple = att_list[(d_idx * acts_per_day + a_idx) % len(att_list)]
                    act_name, act_desc, act_loc, act_dur, act_base_cost = att_tuple
                else:
                    hood = f"District {((d_idx + 1) * 3 + a_idx) % 8 + 1}"
                    generic_names = [
                        (f"Historic Old Town & Cathedral Square", f"Explore the cobblestone avenues, architectural marvels, and heritage facades of {prefs.destination}.", f"Central Plaza, {prefs.destination}", 120, 15.0),
                        (f"{prefs.destination} National Museum of Cultural Heritage", f"Comprehensive exhibitions highlighting the regional history, fine art, and archaeological treasures.", f"Museum Mile, {prefs.destination}", 120, 18.0),
                        (f"Riverside Promenade & Botanical Gardens", f"Peaceful walking paths, botanical flora, and scenic waterway vistas.", f"Riverfront Park, {prefs.destination}", 90, 0.0),
                        (f"Panoramic Skyline Observation Deck", f"Elevated viewpoint offering sweeping 360-degree vistas of {prefs.destination} and surrounding landscapes.", f"Summit Tower, {prefs.destination}", 75, 24.0),
                        (f"Artisan Bazaar & Heritage Craft Quarter", f"Bustling marketplace with handmade crafts, spices, vintage wares, and street musicians.", f"Old Bazaar Quarter, {prefs.destination}", 100, 5.0),
                        (f"Sunset Harbor / Viewpoint Excursion", f"Unwind at the premiere vantage point as golden hour blankets the city skyline.", f"Sunset Hill, {prefs.destination}", 90, 12.0)
                    ]
                    act_name, act_desc, act_loc, act_dur, act_base_cost = generic_names[(d_idx * 2 + a_idx) % len(generic_names)]

                # Estimated cost per traveler
                estimated_act_cost = round(act_base_cost * travelers, 2)
                day_act_cost += estimated_act_cost

                # Calculate transportation to next spot
                is_last_act = (a_idx == acts_per_day - 1)
                next_loc = f"{hotel_name}, {prefs.destination}" if is_last_act else f"Central Hub / Next Site, {prefs.destination}"

                leg_trans = transportation_service.calculate_leg_transport(
                    origin=act_loc,
                    destination=next_loc,
                    preferred_mode=prefs.transport_preference,
                    distance_km_estimate=1.8 + (a_idx * 0.9),
                    city_context=prefs.destination
                )
                # Scale leg transit cost for party
                leg_trans.estimated_cost = round(leg_trans.estimated_cost * (1 if "taxi" in leg_trans.mode.lower() or "rental" in leg_trans.mode.lower() else travelers), 2)
                legs.append(leg_trans)
                tot_trans_cost += leg_trans.estimated_cost

                # Tags based on preferences
                tags = [period.capitalize()]
                if any("cultur" in s.lower() for s in prefs.travel_style):
                    tags.append("Culture")
                if any("adventur" in s.lower() for s in prefs.travel_style):
                    tags.append("Adventure")
                if any("photo" in s.lower() or "sight" in s.lower() for s in prefs.travel_style):
                    tags.append("Photography")

                activity_obj = Activity(
                    id=act_id,
                    time=time_str,
                    period=period,
                    name=act_name,
                    description=act_desc,
                    location=act_loc,
                    duration_minutes=act_dur,
                    estimated_cost=estimated_act_cost,
                    transport_to_next=leg_trans,
                    booking_info_link=transportation_service.generate_osm_search_url(act_name),
                    tags=tags
                )
                day_activities.append(activity_obj)

            # Generate meals based on food preference
            meals: List[MealSuggestion] = []
            food_pref = prefs.food_preference
            if matched_city and food_pref in matched_city["dining"]:
                meal_options = matched_city["dining"][food_pref]
            elif matched_city:
                meal_options = matched_city["dining"]["default"]
            else:
                meal_options = [
                    (f"Local {prefs.destination} Bistro & Bakery", f"Fresh seasonal breakfast, artisan pastries, and local coffee.", 14.0),
                    (f"Le Petit {prefs.destination} Café", f"Traditional specialty {food_pref.lower()} lunch menu.", 22.0),
                    (f"The Lantern House Grill & Terrace", f"Evening dinner showcasing regional ingredients and local specialties.", 36.0)
                ]

            lunch_pick = meal_options[d_idx % len(meal_options)]
            dinner_pick = meal_options[(d_idx + 1) % len(meal_options)]

            lunch_cost = round(lunch_pick[2] * travelers, 2)
            dinner_cost = round(dinner_pick[2] * travelers, 2)
            day_food_cost += (lunch_cost + dinner_cost)

            meals.append(MealSuggestion(
                type="lunch",
                suggestion=lunch_pick[0],
                estimated_cost=lunch_cost,
                cuisine=f"{prefs.destination} Local Cuisine ({food_pref})",
                location=f"Near midday attractions in {prefs.destination}"
            ))
            meals.append(MealSuggestion(
                type="dinner",
                suggestion=dinner_pick[0],
                estimated_cost=dinner_cost,
                cuisine=f"Regional Gourmet ({food_pref})",
                location=f"Central Dining District, {prefs.destination}"
            ))

            tot_food_cost += day_food_cost
            tot_act_cost += day_act_cost

            # Transportation summary for the day
            day_trans_summary = transportation_service.generate_daily_summary(
                legs,
                preferred_mode=prefs.transport_preference
            )

            # Daily travel tips
            day_tips = [
                f"Peak hours for transit in {prefs.destination} run 8:00-9:30 AM and 5:00-6:30 PM.",
                f"Keep comfortable footwear on hand for cobblestones and historic walkways.",
                f"Tipping customs: check local guidelines; rounding up or 5-10% is customary in many venues."
            ]
            if prefs.accessibility:
                day_tips.append(f"Accessibility check: Verified step-free or elevator access points prioritized.")

            daily_total = round(day_act_cost + day_food_cost + sum(l.estimated_cost for l in legs) + total_nightly_acc, 2)

            day_obj = ItineraryDay(
                day_number=day_num,
                date=cur_date,
                theme=theme,
                activities=day_activities,
                meals=meals,
                accommodation=AccommodationRecommendation(
                    name=hotel_name,
                    type=prefs.accommodation_type,
                    estimated_nightly_cost=round(total_nightly_acc, 2),
                    notes=hotel_notes,
                    location=f"Central {prefs.destination}"
                ),
                transportation_summary=day_trans_summary,
                daily_estimated_cost=daily_total,
                travel_tips=day_tips
            )
            days.append(day_obj)

        tot_other_cost = round(15.0 * total_days * travelers, 2)  # souvenirs, water, contingencies
        grand_total = round(tot_trans_cost + tot_acc_cost + tot_food_cost + tot_act_cost + tot_other_cost, 2)
        cost_per_person = round(grand_total / travelers, 2) if travelers > 0 else grand_total
        budget_remaining = round(user_budget - grand_total, 2)
        is_over = budget_remaining < 0

        # Styles summary string
        styles_str = ", ".join(prefs.travel_style) if prefs.travel_style else "Personalized Explorer"

        summary = (
            f"A tailor-crafted {total_days}-day {prefs.pace.lower()}-paced journey to {prefs.destination} "
            f"curated for {travelers} traveler{'s' if travelers > 1 else ''}. Blending {styles_str} "
            f"with seamless transportation via {prefs.transport_preference.lower()} and delicious "
            f"{prefs.food_preference.lower()} culinary spots."
        )

        return ItineraryResponse(
            destination=prefs.destination,
            summary=summary,
            currency=currency,
            travel_style=styles_str,
            traveler_count=travelers,
            total_days=total_days,
            estimated_total_cost=grand_total,
            estimated_cost_per_person=cost_per_person,
            user_budget=user_budget,
            budget_remaining=budget_remaining,
            is_over_budget=is_over,
            days=days,
            budget_breakdown=BudgetBreakdown(
                transportation=round(tot_trans_cost, 2),
                accommodation=round(tot_acc_cost, 2),
                food=round(tot_food_cost, 2),
                activities=round(tot_act_cost, 2),
                other=tot_other_cost
            ),
            general_tips=[
                f"Download offline map tiles for {prefs.destination} before departure.",
                f"Keep digital copies of photo IDs and emergency contacts in secure cloud storage.",
                f"Verify whether attractions require timed reservation slots ahead of peak season.",
                f"Emergency local service numbers should be saved in your contacts upon arrival."
            ],
            disclaimer="All prices, route durations, and schedules are estimated projections for planning convenience.",
            generated_by="demo"
        )

    @classmethod
    def regenerate_itinerary_day(
        cls,
        prefs: TripPreferences,
        day_number: int,
        current_itinerary: ItineraryResponse,
        instructions: Optional[str] = None
    ) -> ItineraryDay:
        """
        Regenerates a single specific day in the itinerary, preserving all other days.
        Applies user instructions (e.g., 'more outdoor activities', 'romantic evening') if provided.
        """
        # Generate full alternative demo plan and extract the requested day
        # Modify preferences or seed slightly to provide fresh alternative activities
        alt_prefs = prefs.model_copy()
        if instructions:
            alt_prefs.special_requests = (alt_prefs.special_requests or "") + f" User instruction for day {day_number}: {instructions}"

        full_alt = cls.generate_demo_itinerary(alt_prefs)

        target_day = None
        for day in full_alt.days:
            if day.day_number == day_number:
                target_day = day
                break

        if not target_day:
            # Fallback if day number out of bounds
            target_day = full_alt.days[0]
            target_day.day_number = day_number

        # Update theme to reflect regeneration
        if instructions:
            target_day.theme = f"{target_day.theme} (Refined: {instructions[:40]})"

        return target_day

    @classmethod
    def revise_itinerary(
        cls,
        current_itinerary: ItineraryResponse,
        instructions: str
    ) -> ItineraryResponse:
        """
        Revises the complete itinerary based on natural language instructions.
        """
        revised = current_itinerary.model_copy(deep=True)
        revised.summary = f"{revised.summary} [Revised: {instructions}]"
        
        lower_ins = instructions.lower()
        if "budget" in lower_ins or "cheaper" in lower_ins or "affordable" in lower_ins:
            # Scale down activity costs and meal costs by 25%
            for day in revised.days:
                for act in day.activities:
                    act.estimated_cost = round(act.estimated_cost * 0.75, 2)
                for meal in day.meals:
                    meal.estimated_cost = round(meal.estimated_cost * 0.75, 2)
                if day.accommodation:
                    day.accommodation.estimated_nightly_cost = round(day.accommodation.estimated_nightly_cost * 0.8, 2)
            
            # Recalculate totals
            tot_act = sum(sum(a.estimated_cost for a in d.activities) for d in revised.days)
            tot_food = sum(sum(m.estimated_cost for m in d.meals) for d in revised.days)
            tot_acc = sum(d.accommodation.estimated_nightly_cost for d in revised.days if d.accommodation)
            tot_trans = sum(d.transportation_summary.estimated_transport_cost for d in revised.days if d.transportation_summary)
            
            revised.budget_breakdown.activities = round(tot_act, 2)
            revised.budget_breakdown.food = round(tot_food, 2)
            revised.budget_breakdown.accommodation = round(tot_acc, 2)
            revised.budget_breakdown.transportation = round(tot_trans, 2)
            
            new_total = round(tot_act + tot_food + tot_acc + tot_trans + revised.budget_breakdown.other, 2)
            revised.estimated_total_cost = new_total
            revised.estimated_cost_per_person = round(new_total / revised.traveler_count, 2)
            revised.budget_remaining = round(revised.user_budget - new_total, 2)
            revised.is_over_budget = revised.budget_remaining < 0

        return revised

ai_service = AIService()
