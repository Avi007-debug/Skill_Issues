
# SkyDash Flight Platform

AI-powered travel platform with a React frontend and FastAPI backend using Supabase.

## Project Structure

- `src/` - Frontend (React + Vite)
- `backend/` - Backend (FastAPI + Supabase)
- `backend/supabase/schema.sql` - SQL schema and seed flights

## Implemented Features (Core + Smart 1 to 6)

- User Authentication: signup and login with Supabase Auth
- User Profile: profile fetch and display
- Flight Search: source, destination, date query from homepage
- Flight Listing: dynamic list from Supabase table with filters
- Flight Booking: booking creation with passenger details
- AI Travel Chatbot: backend-powered Q&A endpoint
- Price Alerts: route/date/preferred-price alert creation

## Environment Variables

Create `.env` in project root from `.env.example`:

- `VITE_API_BASE_URL=http://localhost:8000`

Create `backend/.env` from `backend/.env.example`:

- `API_HOST=0.0.0.0`
- `API_PORT=8000`
- `FRONTEND_URL=http://localhost:5173`
- `SUPABASE_URL=...`
- `SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

## Supabase Setup

1. Create a new Supabase project.
2. Open SQL editor and run `backend/supabase/schema.sql`.
3. Copy project URL + keys into `backend/.env`.

## Run Frontend + Backend

Frontend:

```bash
npm install
npm run dev:frontend
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

`GET http://localhost:8000/health`
  