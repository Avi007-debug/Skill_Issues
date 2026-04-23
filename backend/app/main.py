from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import (
    BookingPayload,
    ChatbotPayload,
    LoginPayload,
    PriceAlertPayload,
    SignupPayload,
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
    user_id = _current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    service = get_service_client()
    result = service.table("profiles").select("id, full_name, email").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data


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
