-- Supabase Database Schema for Travel Platform
-- Run these queries in Supabase SQL Editor to create the necessary tables

-- Enable Row Level Security (RLS) for all tables
-- Note: Adjust RLS policies based on your authentication requirements

-- Table for user profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for flights
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    airline TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration TEXT NOT NULL,
    timings TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for flight bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    flight_id INTEGER REFERENCES flights(id) NOT NULL,
    passenger_details JSONB NOT NULL,
    booking_status TEXT DEFAULT 'confirmed',
    booking_reference TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for price alerts
CREATE TABLE price_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    route TEXT NOT NULL, -- e.g., "Delhi-Mumbai"
    date DATE NOT NULL,
    preferred_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for AI-generated itineraries
CREATE TABLE itineraries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    booking_id INTEGER REFERENCES bookings(id),
    places_to_visit JSONB,
    trip_duration_plan TEXT,
    budget_planning TEXT,
    activities_recommendation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for carbon footprint data
CREATE TABLE carbon_footprints (
    id SERIAL PRIMARY KEY,
    flight_id INTEGER REFERENCES flights(id) NOT NULL,
    co2_emissions TEXT NOT NULL,
    eco_friendly BOOLEAN DEFAULT FALSE,
    green_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for squad trips
CREATE TABLE squad_trips (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    squad_name TEXT,
    friends JSONB, -- array of user IDs or emails
    expenses JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for destinations (for swipe feature)
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT, -- e.g., 'beach', 'city', 'mountain'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for destination scores
CREATE TABLE destination_scores (
    id SERIAL PRIMARY KEY,
    destination_id INTEGER REFERENCES destinations(id) NOT NULL,
    aesthetic_score INTEGER CHECK (aesthetic_score >= 0 AND aesthetic_score <= 10),
    nightlife_score INTEGER CHECK (nightlife_score >= 0 AND nightlife_score <= 10),
    trending_score INTEGER CHECK (trending_score >= 0 AND trending_score <= 10),
    content_creation_score INTEGER CHECK (content_creation_score >= 0 AND content_creation_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(destination_id)
);

-- Table for travel buddies
CREATE TABLE travel_buddies (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    destination TEXT NOT NULL,
    dates TEXT NOT NULL,
    interests JSONB,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for buddy matches/connections
CREATE TABLE buddy_matches (
    id SERIAL PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) NOT NULL,
    user2_id UUID REFERENCES auth.users(id) NOT NULL,
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_footprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_matches ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own itineraries" ON itineraries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own itineraries" ON itineraries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own squad trips" ON squad_trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own squad trips" ON squad_trips FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own buddy profile" ON travel_buddies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own buddy profile" ON travel_buddies FOR ALL USING (auth.uid() = user_id);

-- Public read access for destinations and scores
CREATE POLICY "Anyone can view destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Anyone can view destination scores" ON destination_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can view carbon footprints" ON carbon_footprints FOR SELECT USING (true);

-- Flights are public for search
CREATE POLICY "Anyone can view flights" ON flights FOR SELECT USING (true);

-- Insert some sample data
INSERT INTO destinations (name, description, image_url, category) VALUES
('Bali', 'Tropical paradise with beautiful beaches', 'bali.jpg', 'beach'),
('Tokyo', 'Urban adventure in the heart of Japan', 'tokyo.jpg', 'city'),
('Paris', 'Romantic getaway in the City of Light', 'paris.jpg', 'city'),
('Goa', 'Vibrant beaches and nightlife', 'goa.jpg', 'beach');

INSERT INTO destination_scores (destination_id, aesthetic_score, nightlife_score, trending_score, content_creation_score) VALUES
(1, 10, 9, 10, 10), -- Bali
(2, 8, 9, 9, 9),    -- Tokyo
(3, 9, 8, 8, 10),   -- Paris
(4, 9, 8, 9, 10);   -- Goa

INSERT INTO flights (airline, price, duration, timings, source, destination, date) VALUES
('Air India', 5000.00, '2h 30m', '10:00 - 12:30', 'Delhi', 'Mumbai', '2024-12-25'),
('Indigo', 4500.00, '2h 45m', '14:00 - 16:45', 'Delhi', 'Mumbai', '2024-12-25'),
('SpiceJet', 4800.00, '2h 20m', '18:00 - 20:20', 'Delhi', 'Mumbai', '2024-12-25');