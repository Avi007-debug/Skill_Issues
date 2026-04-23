from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import (
    BookingPayload,
    BuddyMatchPayload,
    BuddyProfilePayload,
    ChatbotPayload,
    ItineraryPayload,
    LoginPayload,
    PriceAlertPayload,
    SignupPayload,
    SquadCreatePayload,
    SquadExpensePayload,
    SwipeActionPayload,
    VibeModePayload,
)
from .supabase_client import get_anon_client, get_service_client

app = FastAPI(title="Skill Issues Travel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None
    return authorization[len(prefix):]


def _current_user_id(authorization: str | None) -> str | None:
    token = _extract_bearer_token(authorization)
    if not token:
        return None
    anon = get_anon_client()
    user = anon.auth.get_user(token)
    if not user or not user.user:
        return None
    return user.user.id


def _require_user(authorization: str | None) -> str:
    """Like _current_user_id but raises 401 when missing."""
    uid = _current_user_id(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return uid


# ========================================
# Health
# ========================================
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ========================================
# Feature 1: Authentication
# ========================================
@app.post("/auth/signup")
def signup(payload: SignupPayload) -> dict[str, Any]:
    anon = get_anon_client()
    service = get_service_client()

    response = anon.auth.sign_up(
        {
            "email": payload.email,
            "password": payload.password,
            "options": {"data": {"full_name": payload.full_name}},
        }
    )

    if not response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    service.table("profiles").upsert(
        {"id": response.user.id, "full_name": payload.full_name, "email": payload.email}
    ).execute()

    return {
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": payload.full_name,
        },
        "session": response.session.model_dump() if response.session else None,
    }


@app.post("/auth/login")
def login(payload: LoginPayload) -> dict[str, Any]:
    anon = get_anon_client()
    service = get_service_client()

    response = anon.auth.sign_in_with_password(
        {"email": payload.email, "password": payload.password}
    )

    if not response.user or not response.session:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    profile = (
        service.table("profiles")
        .select("id, full_name, email")
        .eq("id", response.user.id)
        .single()
        .execute()
    )

    return {
        "user": profile.data
        if profile.data
        else {"id": response.user.id, "email": response.user.email, "full_name": None},
        "session": response.session.model_dump(),
    }


@app.get("/auth/profile")
def profile(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)

    service = get_service_client()
    result = service.table("profiles").select("id, full_name, email").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data


# ========================================
# Features 2 & 3: Flight Search & Listing
# ========================================
@app.get("/flights")
def flights(source: str = "", destination: str = "", date: str = "") -> dict[str, Any]:
    service = get_service_client()

    query = service.table("flights").select("*")
    if source:
        query = query.ilike("source", f"%{source}%")
    if destination:
        query = query.ilike("destination", f"%{destination}%")
    if date:
        query = query.eq("travel_date", date)

    result = query.execute()
    return {"items": result.data or []}


# ========================================
# Feature 4: Flight Booking
# ========================================
@app.post("/bookings")
def create_booking(payload: BookingPayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    service = get_service_client()
    user_id = _current_user_id(authorization)

    insert_payload = {
        "user_id": user_id,
        "flight_id": payload.flight_id,
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "email": payload.email,
        "phone": payload.phone,
        "status": "confirmed",
    }

    result = service.table("bookings").insert(insert_payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Booking failed")

    return {"booking": result.data[0]}


# ========================================
# Feature 5: AI Travel Chatbot
# ========================================
@app.post("/chatbot/ask")
def chatbot(payload: ChatbotPayload, authorization: str | None = Header(default=None)) -> dict[str, str]:
    question = payload.question.lower()

    if "cheap" in question or "cheapest" in question:
        answer = "Try Tuesday and Wednesday departures and set a price alert for your route."
    elif "visa" in question:
        answer = "Visa requirements depend on destination and passport. Share your route for exact guidance."
    elif "baggage" in question:
        answer = "Most economy fares include 1 cabin bag and optional check-in luggage by airline fare class."
    elif "destination" in question or "recommend" in question:
        answer = "For budget + vibes: Bali, Vietnam, and Goa are strong picks this season."
    else:
        answer = "I can help with cheapest flights, visa info, baggage rules, and destination ideas."

    service = get_service_client()
    user_id = _current_user_id(authorization)
    service.table("chat_history").insert(
        {
            "user_id": user_id,
            "question": payload.question,
            "answer": answer,
        }
    ).execute()

    return {"answer": answer}


# ========================================
# Feature 6: Price Alerts
# ========================================
@app.post("/price-alerts")
def create_price_alert(payload: PriceAlertPayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    service = get_service_client()
    user_id = _current_user_id(authorization)

    result = (
        service.table("price_alerts")
        .insert(
            {
                "user_id": user_id,
                "route_from": payload.route_from,
                "route_to": payload.route_to,
                "travel_date": payload.travel_date,
                "preferred_price": payload.preferred_price,
                "email": payload.email,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create alert")

    return {"alert": result.data[0]}


# ========================================
# Feature 7: AI Itinerary Generator
# ========================================
_ACTIVITY_POOL: dict[str, list[str]] = {
    "adventure": ["Morning hiking expedition", "Water sports session", "Rock climbing", "Zip-lining"],
    "food": ["Local street food tour", "Cooking class with chef", "Fine-dining experience", "Night market crawl"],
    "shopping": ["Artisan market visit", "Shopping district tour", "Souvenir hunting", "Designer outlet trip"],
    "nature": ["Nature reserve trek", "Botanical garden visit", "Sunset viewpoint hike", "Wildlife safari"],
    "culture": ["Museum & gallery tour", "Historical walking tour", "Traditional dance show", "Temple visit"],
    "nightlife": ["Rooftop bar crawl", "Live-music venue", "Club night", "Beach bonfire party"],
}


@app.post("/itinerary/generate")
def generate_itinerary(payload: ItineraryPayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    interests = payload.interests or ["adventure", "food", "nature"]
    plan = []
    for day in range(1, payload.duration_days + 1):
        day_activities: list[str] = []
        for interest in interests:
            pool = _ACTIVITY_POOL.get(interest, [])
            if pool:
                day_activities.append(pool[(day - 1) % len(pool)])
        plan.append({"day": day, "title": f"Day {day} in {payload.destination}", "activities": day_activities[:4]})

    service = get_service_client()
    user_id = _current_user_id(authorization)

    service.table("itineraries").insert(
        {
            "user_id": user_id,
            "destination": payload.destination,
            "duration_days": payload.duration_days,
            "budget": payload.budget,
            "interests": payload.interests,
            "plan": plan,
        }
    ).execute()

    return {
        "destination": payload.destination,
        "budget": payload.budget,
        "plan": plan,
    }


# ========================================
# Feature 8: Carbon Footprint Tracker
# ========================================
@app.get("/flights/eco")
def eco_flights() -> dict[str, Any]:
    """Return flights ordered by CO₂ emissions (lowest first), highlighting eco-friendly ones."""
    service = get_service_client()
    result = service.table("flights").select("*").order("co2_kg").execute()
    return {"items": result.data or []}


# ========================================
# Feature 9: Squad Trip Split
# ========================================
@app.post("/squads")
def create_squad(payload: SquadCreatePayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()

    squad_result = service.table("squad_trips").insert({
        "owner_id": user_id,
        "squad_name": payload.squad_name,
        "destination": payload.destination,
        "travel_date": payload.travel_date,
    }).execute()

    if not squad_result.data:
        raise HTTPException(status_code=400, detail="Could not create squad")

    squad_id = squad_result.data[0]["id"]

    # Add members
    members_to_insert = [{"squad_id": squad_id, "name": name} for name in payload.members if name.strip()]
    if members_to_insert:
        service.table("squad_members").insert(members_to_insert).execute()

    return {"squad": squad_result.data[0]}


@app.get("/squads")
def list_squads(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = service.table("squad_trips").select("*, squad_members(*)").eq("owner_id", user_id).execute()
    return {"items": result.data or []}


@app.post("/squads/expense")
def add_squad_expense(payload: SquadExpensePayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _require_user(authorization)
    service = get_service_client()
    result = service.table("squad_expenses").insert({
        "squad_id": payload.squad_id,
        "description": payload.description,
        "amount": payload.amount,
        "paid_by": payload.paid_by_member_id,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not add expense")
    return {"expense": result.data[0]}


@app.get("/squads/{squad_id}/expenses")
def get_squad_expenses(squad_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _require_user(authorization)
    service = get_service_client()
    result = service.table("squad_expenses").select("*").eq("squad_id", squad_id).execute()
    return {"items": result.data or []}


# ========================================
# Vibe Mode Toggle
# ========================================
@app.post("/vibe-mode")
def toggle_vibe_mode(payload: VibeModePayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    service.table("user_preferences").upsert({
        "user_id": user_id,
        "vibe_mode": payload.enabled,
        "updated_at": "now()",
    }).execute()
    return {"vibe_mode": payload.enabled}


@app.get("/vibe-mode")
def get_vibe_mode(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _current_user_id(authorization)
    if not user_id:
        return {"vibe_mode": False}
    service = get_service_client()
    result = service.table("user_preferences").select("vibe_mode").eq("user_id", user_id).single().execute()
    return {"vibe_mode": result.data["vibe_mode"] if result.data else False}


# ========================================
# Feature 10: Swipe Destination Discovery
# ========================================
@app.get("/destinations")
def list_destinations() -> dict[str, Any]:
    service = get_service_client()
    result = service.table("destinations").select("*").execute()
    return {"items": result.data or []}


@app.get("/destinations/swipe")
def get_swipeable_destinations(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Return destinations the user has NOT swiped on yet."""
    user_id = _current_user_id(authorization)
    service = get_service_client()

    if user_id:
        # Get already-swiped destination IDs
        swiped = service.table("swipe_actions").select("destination_id").eq("user_id", user_id).execute()
        swiped_ids = [s["destination_id"] for s in (swiped.data or [])]
        query = service.table("destinations").select("*")
        if swiped_ids:
            query = query.not_.in_("id", swiped_ids)
        result = query.execute()
    else:
        result = service.table("destinations").select("*").execute()

    return {"items": result.data or []}


@app.post("/destinations/swipe")
def swipe_destination(payload: SwipeActionPayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = service.table("swipe_actions").upsert({
        "user_id": user_id,
        "destination_id": payload.destination_id,
        "action": payload.action,
    }).execute()
    return {"action": result.data[0] if result.data else {}}


@app.get("/destinations/liked")
def liked_destinations(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = (
        service.table("swipe_actions")
        .select("destination_id, destinations(*)")
        .eq("user_id", user_id)
        .eq("action", "like")
        .execute()
    )
    return {"items": result.data or []}


# ========================================
# Feature 11: Reel-Worthy Destination Score
# ========================================
@app.get("/destinations/scores")
def destination_scores() -> dict[str, Any]:
    """Return all destinations with their vibe scores."""
    service = get_service_client()
    result = (
        service.table("destinations")
        .select("id, name, image_url, category, country, aesthetic_score, nightlife_score, trending_score, content_creation_score")
        .execute()
    )
    return {"items": result.data or []}


# ========================================
# Feature 12: Travel Buddy Finder
# ========================================
@app.post("/buddies/profile")
def create_buddy_profile(payload: BuddyProfilePayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = service.table("buddy_profiles").upsert({
        "user_id": user_id,
        "destination": payload.destination,
        "travel_start": payload.travel_start,
        "travel_end": payload.travel_end,
        "interests": payload.interests,
        "bio": payload.bio,
        "is_active": True,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not save buddy profile")
    return {"profile": result.data[0]}


@app.get("/buddies/find")
def find_buddies(destination: str = "", authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Find other travelers heading to the same destination."""
    user_id = _current_user_id(authorization)
    service = get_service_client()

    query = service.table("buddy_profiles").select("*, profiles(full_name, avatar_url)").eq("is_active", True)
    if destination:
        query = query.ilike("destination", f"%{destination}%")
    if user_id:
        query = query.neq("user_id", user_id)

    result = query.execute()
    return {"items": result.data or []}


@app.post("/buddies/match")
def send_buddy_match(payload: BuddyMatchPayload, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = service.table("buddy_matches").upsert({
        "sender_id": user_id,
        "receiver_id": payload.receiver_id,
        "status": payload.status,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not send match request")
    return {"match": result.data[0]}


@app.get("/buddies/matches")
def my_buddy_matches(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = _require_user(authorization)
    service = get_service_client()
    result = (
        service.table("buddy_matches")
        .select("*, profiles!buddy_matches_sender_id_fkey(full_name, avatar_url)")
        .or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}")
        .execute()
    )
    return {"items": result.data or []}
