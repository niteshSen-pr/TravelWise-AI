import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_itinerary_valid():
    payload = {
        "destination": "Paris, France",
        "starting_location": "CDG Airport",
        "start_date": "2026-11-01",
        "end_date": "2026-11-03",
        "traveler_count": 2,
        "budget": 2000.0,
        "currency": "EUR",
        "travel_style": ["Cultural exploration", "Romantic"],
        "pace": "Balanced",
        "food_preference": "No preference",
        "accommodation_type": "Hotel",
        "transport_preference": "Public transport"
    }
    response = client.post("/api/itinerary/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["destination"] == "Paris, France"
    assert data["total_days"] == 3
    assert len(data["days"]) == 3
    assert data["traveler_count"] == 2
    assert "budget_breakdown" in data
    assert data["estimated_total_cost"] > 0
    assert data["days"][0]["day_number"] == 1
    assert len(data["days"][0]["activities"]) > 0
    # Check transportation presence
    assert "transportation_summary" in data["days"][0]
    assert data["days"][0]["activities"][0]["transport_to_next"] is not None

def test_generate_itinerary_invalid_dates():
    # End date before start date
    payload = {
        "destination": "Rome, Italy",
        "start_date": "2026-11-05",
        "end_date": "2026-11-02",
        "traveler_count": 1,
        "budget": 1000.0
    }
    response = client.post("/api/itinerary/generate", json=payload)
    assert response.status_code == 422

def test_generate_itinerary_invalid_destination():
    # Destination too short (< 2 chars)
    payload = {
        "destination": "A",
        "start_date": "2026-11-01",
        "end_date": "2026-11-02",
        "traveler_count": 1,
        "budget": 500.0
    }
    response = client.post("/api/itinerary/generate", json=payload)
    assert response.status_code == 422

def test_budget_calculations():
    payload = {
        "destination": "Tokyo, Japan",
        "start_date": "2026-11-01",
        "end_date": "2026-11-02",
        "traveler_count": 1,
        "budget": 500.0,
        "currency": "USD"
    }
    response = client.post("/api/itinerary/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    bd = data["budget_breakdown"]
    total_breakdown = bd["transportation"] + bd["accommodation"] + bd["food"] + bd["activities"] + bd["other"]
    assert pytest.approx(data["estimated_total_cost"], 0.1) == total_breakdown
    assert data["budget_remaining"] == round(data["user_budget"] - data["estimated_total_cost"], 2)

def test_regenerate_day():
    # First generate
    gen_payload = {
        "destination": "Barcelona, Spain",
        "start_date": "2026-11-01",
        "end_date": "2026-11-02",
        "traveler_count": 2,
        "budget": 1500.0
    }
    gen_resp = client.post("/api/itinerary/generate", json=gen_payload)
    assert gen_resp.status_code == 200
    itinerary = gen_resp.json()

    # Regenerate day 2
    regen_payload = {
        "trip_preferences": gen_payload,
        "current_itinerary": itinerary,
        "day_number": 2,
        "instructions": "Focus on beach and seaside tapas"
    }
    regen_resp = client.post("/api/itinerary/regenerate-day", json=regen_payload)
    assert regen_resp.status_code == 200
    day_data = regen_resp.json()
    assert day_data["day_number"] == 2
    assert len(day_data["activities"]) > 0

def test_trip_crud_endpoints():
    # 1. List trips
    list_resp = client.get("/api/trips")
    assert list_resp.status_code == 200
    initial_trips = list_resp.json()
    assert len(initial_trips) >= 2  # Pre-seeded sample trips

    # 2. Create trip
    new_trip = {
        "title": "Autumn in Kyoto",
        "destination": "Kyoto, Japan",
        "start_date": "2026-11-15",
        "end_date": "2026-11-18",
        "traveler_count": 1,
        "budget": 1500.0,
        "currency": "USD",
        "travel_style": "Culture & Zen Gardens",
        "preferences": {"pace": "Relaxed"},
        "itinerary": {"summary": "Peaceful autumn retreat"}
    }
    create_resp = client.post("/api/trips", json=new_trip)
    assert create_resp.status_code == 201
    created = create_resp.json()
    trip_id = created["id"]
    assert created["destination"] == "Kyoto, Japan"

    # 3. Get trip
    get_resp = client.get(f"/api/trips/{trip_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == trip_id

    # 4. Update trip
    update_resp = client.put(f"/api/trips/{trip_id}", json={"title": "Updated Autumn in Kyoto"})
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Autumn in Kyoto"

    # 5. Duplicate trip
    dup_resp = client.post(f"/api/trips/{trip_id}/duplicate")
    assert dup_resp.status_code == 201
    dup_id = dup_resp.json()["id"]
    assert "Copy" in dup_resp.json()["title"]

    # 6. Delete trips
    del_resp = client.delete(f"/api/trips/{trip_id}")
    assert del_resp.status_code == 200
    del_dup_resp = client.delete(f"/api/trips/{dup_id}")
    assert del_dup_resp.status_code == 200
