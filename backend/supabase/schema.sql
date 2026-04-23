-- Enable extension
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES TABLE
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  created_at timestamptz not null default now()
);

-- =========================
-- FLIGHTS TABLE
-- =========================
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  airline text not null,
  source text not null,
  destination text not null,
  departure_time text not null,
  arrival_time text not null,
  duration text not null,
  price numeric not null check (price > 0),
  seats_left int not null default 0 check (seats_left >= 0),
  travel_date date not null,
  created_at timestamptz not null default now()
);

-- =========================
-- BOOKINGS TABLE
-- =========================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  flight_id uuid not null references public.flights(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- =========================
-- PRICE ALERTS TABLE
-- =========================
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  route_from text not null,
  route_to text not null,
  travel_date date not null,
  preferred_price numeric not null check (preferred_price > 0),
  email text not null,
  created_at timestamptz not null default now()
);

-- =========================
-- CHAT HISTORY TABLE
-- =========================
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- =========================
-- ENABLE RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.flights enable row level security;
alter table public.bookings enable row level security;
alter table public.price_alerts enable row level security;
alter table public.chat_history enable row level security;

-- =========================
-- POLICIES
-- =========================

-- Flights: public read
create policy "Public can read flights"
on public.flights
for select
using (true);

-- Profiles: user can access own profile
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Bookings: user-specific access
create policy "Users can view own bookings"
on public.bookings
for select
using (auth.uid() = user_id);

create policy "Users can insert bookings"
on public.bookings
for insert
with check (auth.uid() = user_id);

-- Price alerts: user-specific
create policy "Users can manage own alerts"
on public.price_alerts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Chat history: user-specific
create policy "Users can manage own chat"
on public.chat_history
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- SAMPLE DATA
-- =========================
insert into public.flights (
  airline, source, destination, departure_time, arrival_time, duration, price, seats_left, travel_date
) values
  ('SkyWings Airlines', 'Bengaluru', 'Goa', '08:00 AM', '09:20 AM', '1h 20m', 2999, 12, current_date + 7),
  ('CloudJet Airways', 'Bengaluru', 'Mumbai', '10:15 AM', '11:45 AM', '1h 30m', 3499, 5, current_date + 7),
  ('Horizon Express', 'Delhi', 'Bali', '02:30 PM', '11:00 PM', '8h 30m', 18399, 18, current_date + 20),
  ('AeroFly International', 'Mumbai', 'Dubai', '05:45 PM', '08:15 PM', '3h 30m', 10499, 8, current_date + 10)
on conflict do nothing;