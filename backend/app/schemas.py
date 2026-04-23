from pydantic import BaseModel, EmailStr, Field, AliasChoices


class SignupPayload(BaseModel):
    full_name: str = Field(validation_alias=AliasChoices("full_name", "name"), min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class FlightSearchQuery(BaseModel):
    source: str | None = None
    destination: str | None = None
    date: str | None = None


class BookingPayload(BaseModel):
    flight_id: str
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: EmailStr
    phone: str = Field(min_length=6)


class PriceAlertPayload(BaseModel):
    route_from: str = Field(min_length=2)
    route_to: str = Field(min_length=2)
    travel_date: str
    preferred_price: float = Field(gt=0)
    email: EmailStr


class ChatbotPayload(BaseModel):
    question: str = Field(min_length=2)


# --- Feature 7: AI Itinerary Generator ---
class ItineraryPayload(BaseModel):
    destination: str = Field(min_length=2)
    duration_days: int = Field(gt=0, le=30)
    budget: str | None = None
    interests: list[str] = []


# --- Feature 9: Squad Trip Split ---
class SquadCreatePayload(BaseModel):
    squad_name: str = Field(min_length=2)
    destination: str | None = None
    travel_date: str | None = None
    members: list[str] = []  # list of member names


class SquadExpensePayload(BaseModel):
    squad_id: str
    description: str = Field(min_length=2)
    amount: float = Field(gt=0)
    paid_by_member_id: str | None = None


# --- Feature 10: Swipe Destination Discovery ---
class SwipeActionPayload(BaseModel):
    destination_id: str
    action: str = Field(pattern="^(like|skip)$")


# --- Feature 12: Travel Buddy Finder ---
class BuddyProfilePayload(BaseModel):
    destination: str = Field(min_length=2)
    travel_start: str | None = None
    travel_end: str | None = None
    interests: list[str] = []
    bio: str | None = None


class BuddyMatchPayload(BaseModel):
    receiver_id: str
    status: str = Field(default="pending", pattern="^(pending|accepted|rejected)$")


# --- Vibe Mode Toggle ---
class VibeModePayload(BaseModel):
    enabled: bool
