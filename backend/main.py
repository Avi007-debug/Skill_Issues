import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Travel Platform API", description="AI-powered travel platform for Gen Z")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Adjust for your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
SUPABASE_URL = os.getenv("https://uqpckuhkryhnodbdidrf.supabase.co  ")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGNrdWhrcnlobm9kYmRpZHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MjUyMDQsImV4cCI6MjA5MjUwMTIwNH0.W64KVYcyfdJ0dPriYxxTH6ikSvR2MDZLhgTutrKaiWg  ")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Pydantic models
class User(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class FlightSearch(BaseModel):
    source: str
    destination: str
    date: str

class Flight(BaseModel):
    airline: str
    price: float
    duration: str
    timings: str

class Booking(BaseModel):
    flight_id: str
    passenger_details: dict

class Alert(BaseModel):
    route: str
    date: str
    preferred_price: float

class Destination(BaseModel):
    name: str
    aesthetic_score: int
    nightlife_score: int
    trending_score: int
    content_creation_score: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the Travel Platform API"}

# User Authentication
@app.post("/auth/signup")
def signup(user: User):
    try:
        data = {
            "email": user.email,
            "password": user.password
        }
        if user.name:
            data["options"] = {"data": {"name": user.name}}
        response = supabase.auth.sign_up(data)
        return {
            "message": "User signed up successfully",
            "user": response.user.dict() if response.user else None,
            "session": response.session.dict() if response.session else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(user: User):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/auth/profile")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "name": current_user.user_metadata.get("name", ""),
        "id": current_user.id
    }

# Flight Search
@app.post("/flights/search")
def search_flights(search: FlightSearch):
    # Dummy data
    flights = [
        {"airline": "Air India", "price": 5000, "duration": "2h 30m", "timings": "10:00 - 12:30"},
        {"airline": "Indigo", "price": 4500, "duration": "2h 45m", "timings": "14:00 - 16:45"},
        {"airline": "SpiceJet", "price": 4800, "duration": "2h 20m", "timings": "18:00 - 20:20"}
    ]
    return {"flights": flights}

# Flight Listing (same as search for now)
@app.get("/flights")
def list_flights():
    flights = [
        {"airline": "Air India", "price": 5000, "duration": "2h 30m", "timings": "10:00 - 12:30"},
        {"airline": "Indigo", "price": 4500, "duration": "2h 45m", "timings": "14:00 - 16:45"}
    ]
    return {"flights": flights}

# Flight Booking
@app.post("/flights/book")
def book_flight(booking: Booking):
    # Dummy implementation
    return {"message": "Booking confirmed", "booking_id": "BK123456"}

# AI Travel Chatbot
@app.post("/chatbot")
def chatbot_query(message: str):
    # Dummy AI responses
    if "cheapest" in message.lower():
        return {"response": "The cheapest flight available is from Indigo for $4500."}
    elif "visa" in message.lower():
        return {"response": "For visa requirements, please check the official government website of your destination country."}
    elif "baggage" in message.lower():
        return {"response": "Most airlines allow 20kg checked baggage and 7kg hand baggage. Please confirm with your airline."}
    elif "recommend" in message.lower():
        return {"response": "Based on your preferences, I recommend Bali for a tropical getaway."}
    else:
        return {"response": "I'm here to help with your travel queries! Ask me about flights, visas, baggage, or recommendations."}

# Price Alerts
@app.post("/alerts")
def set_price_alert(alert: Alert):
    # Dummy implementation
    return {"message": "Price alert set successfully. You'll be notified when prices drop below your preferred amount."}

# AI Itinerary Generator
@app.post("/itinerary/generate")
def generate_itinerary(booking_id: str):
    # Dummy implementation
    itinerary = {
        "places_to_visit": ["Beach", "Temple", "Market"],
        "trip_duration_plan": "5 days",
        "budget_planning": "$2000 total",
        "activities_recommendation": ["Surfing", "Cultural tours", "Food tasting"]
    }
    return {"itinerary": itinerary}

# Carbon Footprint Tracker
@app.get("/carbon/{flight_id}")
def get_carbon_footprint(flight_id: str):
    # Dummy data
    return {
        "co2_emissions": "150 kg",
        "eco_friendly": True,
        "green_recommendation": "This flight uses sustainable aviation fuel."
    }

# Squad Trip Split
@app.post("/squad/create")
def create_squad_trip(friends: List[str], expenses: dict):
    # Dummy implementation
    return {"message": "Squad trip created", "squad_id": "SQ123", "split": "Expenses split equally"}

# Vibe Mode Toggle (dummy endpoint)
@app.post("/vibe/toggle")
def toggle_vibe_mode(mode: str):
    return {"message": f"Vibe mode set to {mode}"}

# Swipe Destination Discovery
@app.get("/destinations/swipe")
def get_swipe_destinations():
    destinations = [
        {"name": "Bali", "image": "bali.jpg", "description": "Tropical paradise"},
        {"name": "Tokyo", "image": "tokyo.jpg", "description": "Urban adventure"},
        {"name": "Paris", "image": "paris.jpg", "description": "Romantic getaway"}
    ]
    return {"destinations": destinations}

@app.post("/destinations/swipe/{action}")
def swipe_destination(destination: str, action: str):
    return {"message": f"You {action}d {destination}"}

# Reel-Worthy Destination Score
@app.get("/destinations/scores")
def get_destination_scores():
    scores = [
        {"name": "Goa", "aesthetic": 9, "nightlife": 8, "trending": 9, "content_creation": 10},
        {"name": "Bali", "aesthetic": 10, "nightlife": 9, "trending": 10, "content_creation": 10}
    ]
    return {"scores": scores}

# Travel Buddy Finder
@app.post("/buddies/find")
def find_travel_buddies(destination: str, dates: str, interests: List[str]):
    buddies = [
        {"name": "Alice", "interests": ["photography", "hiking"], "match": 95},
        {"name": "Bob", "interests": ["food", "culture"], "match": 88}
    ]
    return {"buddies": buddies}

# Placeholder for Supabase connection
# from supabase import create_client
# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
