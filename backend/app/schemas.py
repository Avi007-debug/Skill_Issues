from pydantic import BaseModel, EmailStr, Field


class SignupPayload(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
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
