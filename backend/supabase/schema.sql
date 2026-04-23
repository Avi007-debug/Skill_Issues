-- ============================================================
-- Skill Issues Travel Platform — Complete Database Schema
-- Run in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES (Feature 1: User Authentication)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  avatar_url text,
  bio text,
  interests text[],           -- e.g. {'photography','hiking','food'}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. FLIGHTS (Features 2 & 3: Flight Search & Listing)
-- ============================================================
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
  -- Feature 8: Carbon Footprint Tracker (inline, no separate table)
  co2_kg numeric not null default 0,           -- CO₂ emissions in kg
  is_eco_friendly boolean not null default false,
  eco_note text,                               -- e.g. "Uses SAF fuel"
  created_at timestamptz not null default now()
);

create index if not exists idx_flights_search
  on public.flights (source, destination, travel_date);

create index if not exists idx_flights_price
  on public.flights (price);

-- ============================================================
-- 3. BOOKINGS (Feature 4: Flight Booking)
-- ============================================================
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

-- ============================================================
-- 4. CHAT HISTORY (Feature 5: AI Travel Chatbot)
-- ============================================================
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. PRICE ALERTS (Feature 6: Price Alerts)
-- ============================================================
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  route_from text not null,
  route_to text not null,
  travel_date date not null,
  preferred_price numeric not null check (preferred_price > 0),
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. ITINERARIES (Feature 7: AI Itinerary Generator)
-- ============================================================
create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  destination text not null,
  duration_days int not null check (duration_days > 0),
  budget text,
  interests text[],                   -- e.g. {'adventure','food'}
  plan jsonb not null default '[]'::jsonb,   -- array of day objects
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. SQUAD TRIPS (Feature 9: Squad Trip Split)
-- ============================================================
create table if not exists public.squad_trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  squad_name text not null,
  destination text,
  travel_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squad_trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_expenses (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squad_trips(id) on delete cascade,
  paid_by uuid references public.squad_members(id) on delete set null,
  description text not null,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. DESTINATIONS (Features 10 & 11: Swipe Discovery & Scores)
-- ============================================================
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  image_url text,
  category text,                           -- e.g. 'beach','city','mountain'
  country text,
  -- Feature 11: Reel-Worthy Destination Score (inline)
  aesthetic_score int not null default 5 check (aesthetic_score between 0 and 10),
  nightlife_score int not null default 5 check (nightlife_score between 0 and 10),
  trending_score int not null default 5  check (trending_score between 0 and 10),
  content_creation_score int not null default 5 check (content_creation_score between 0 and 10),
  created_at timestamptz not null default now()
);

-- Feature 10: Swipe actions log
create table if not exists public.swipe_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid not null references public.destinations(id) on delete cascade,
  action text not null check (action in ('like','skip')),
  created_at timestamptz not null default now(),
  unique(user_id, destination_id)
);

-- ============================================================
-- 9. TRAVEL BUDDIES (Feature 12: Travel Buddy Finder)
-- ============================================================
create table if not exists public.buddy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  destination text not null,
  travel_start date,
  travel_end date,
  interests text[],
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_buddy_profiles_lookup
  on public.buddy_profiles (destination, travel_start, travel_end, is_active);

create table if not exists public.buddy_matches (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  match_score int check (match_score between 0 and 100),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique(sender_id, receiver_id)
);

-- ============================================================
-- 10. USER PREFERENCES (Vibe Mode Toggle state)
-- ============================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  vibe_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.flights            enable row level security;
alter table public.bookings           enable row level security;
alter table public.chat_history       enable row level security;
alter table public.price_alerts       enable row level security;
alter table public.itineraries        enable row level security;
alter table public.squad_trips        enable row level security;
alter table public.squad_members      enable row level security;
alter table public.squad_expenses     enable row level security;
alter table public.destinations       enable row level security;
alter table public.swipe_actions      enable row level security;
alter table public.buddy_profiles     enable row level security;
alter table public.buddy_matches      enable row level security;
alter table public.user_preferences   enable row level security;


-- ============================================================
-- POLICIES
-- ============================================================

-- Flights: public read
create policy "Public can read flights" on public.flights for select using (true);

-- Profiles: own data
create policy "Own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "Own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "Own profile update" on public.profiles for update using (auth.uid() = id);

-- Bookings: own data
create policy "Own bookings read"   on public.bookings for select using (auth.uid() = user_id);
create policy "Own bookings insert" on public.bookings for insert with check (auth.uid() = user_id);

-- Chat history: own data
create policy "Own chat manage" on public.chat_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Price alerts: own data
create policy "Own alerts manage" on public.price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Itineraries: own data
create policy "Own itineraries manage" on public.itineraries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Squad trips: owner access
create policy "Own squads manage" on public.squad_trips for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Squad members: read by squad owner (simplified)
create policy "Squad members read" on public.squad_members for select using (true);
create policy "Squad members insert" on public.squad_members for insert with check (true);

-- Squad expenses: read by squad members
create policy "Squad expenses read" on public.squad_expenses for select using (true);
create policy "Squad expenses insert" on public.squad_expenses for insert with check (true);

-- Destinations: public read
create policy "Public destinations read" on public.destinations for select using (true);

-- Swipe actions: own data
create policy "Own swipes manage" on public.swipe_actions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Buddy profiles: public read, own write
create policy "Public buddy read" on public.buddy_profiles for select using (true);
create policy "Own buddy manage"  on public.buddy_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Buddy matches: involved users
create policy "Own matches read" on public.buddy_matches for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Own matches insert" on public.buddy_matches for insert with check (auth.uid() = sender_id);
create policy "Own matches update" on public.buddy_matches for update using (auth.uid() = receiver_id);

-- User preferences: own data
create policy "Own prefs manage" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================
-- SEED DATA
-- ============================================================

-- ============================================================
-- GRANTS
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all privileges on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all privileges on sequences to anon, authenticated, service_role;

-- Sample flights
insert into public.flights (
  airline, source, destination, departure_time, arrival_time, duration, price, seats_left, travel_date,
  co2_kg, is_eco_friendly, eco_note
) values
  ('SkyWings Airlines', 'Bengaluru', 'Goa',    '08:00 AM', '09:20 AM', '1h 20m', 2999,  12, current_date + 7,   85,  true,  'Uses sustainable aviation fuel'),
  ('CloudJet Airways',  'Bengaluru', 'Mumbai',  '10:15 AM', '11:45 AM', '1h 30m', 3499,  5,  current_date + 7,   120, false, null),
  ('Horizon Express',   'Delhi',     'Bali',    '02:30 PM', '11:00 PM', '8h 30m', 18399, 18, current_date + 20,  450, false, null),
  ('AeroFly Intl',      'Mumbai',    'Dubai',   '05:45 PM', '08:15 PM', '3h 30m', 10499, 8,  current_date + 10,  210, true,  'Carbon offset programme included'),
  ('GreenWings Air',    'Delhi',     'Goa',     '06:00 AM', '08:20 AM', '2h 20m', 3199,  15, current_date + 5,   78,  true,  'Newest fleet, 20% less fuel burn'),
  ('EcoJet Airways',    'Mumbai',    'Bangkok', '11:00 PM', '05:30 AM', '5h 30m', 8999,  10, current_date + 14,  180, true,  'Bio-fuel blend aircraft')
on conflict do nothing;

-- Sample destinations
insert into public.destinations (
  name, description, image_url, category, country,
  aesthetic_score, nightlife_score, trending_score, content_creation_score
) values
  ('Bali',           'Tropical paradise with stunning temples and rice terraces',  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'beach',    'Indonesia', 10, 9, 10, 10),
  ('Tokyo',          'Neon-lit urban adventure meets ancient tradition',            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'city',     'Japan',     8,  9, 9,  9),
  ('Paris',          'Iconic architecture, fashion, art, and café culture',         'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'city',     'France',    9,  8, 8,  10),
  ('Goa',            'Vibrant beaches, sunset parties, and laid-back vibes',        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'beach',    'India',     9,  8, 9,  10),
  ('Santorini',      'Whitewashed cliffs over the Aegean, pure magic',             'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', 'island',   'Greece',    10, 6, 10, 10),
  ('Dubai',          'Futuristic skyline, luxury shopping, and desert adventures',  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'city',     'UAE',       9,  9, 9,  9),
  ('Manali',         'Snow-capped peaks, trekking, and cozy mountain vibes',        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'mountain', 'India',     8,  4, 7,  8),
  ('Vietnam',        'Street food paradise with stunning landscapes',               'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', 'nature',   'Vietnam',   9,  7, 9,  9)
on conflict do nothing;