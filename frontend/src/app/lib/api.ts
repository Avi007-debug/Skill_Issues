const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Flight {
  id: string;
  airline: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  seats_left: number;
  travel_date: string;
  co2_kg: number;
  is_eco_friendly: boolean;
  eco_note: string | null;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  country: string;
  aesthetic_score: number;
  nightlife_score: number;
  trending_score: number;
  content_creation_score: number;
}

export interface BuddyProfile {
  id: string;
  user_id: string;
  destination: string;
  travel_start: string | null;
  travel_end: string | null;
  interests: string[];
  bio: string | null;
  is_active: boolean;
  profiles?: { full_name: string; avatar_url: string | null };
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface SquadTrip {
  id: string;
  owner_id: string;
  squad_name: string;
  destination: string | null;
  travel_date: string | null;
  squad_members?: { id: string; name: string; email: string | null }[];
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep fallback error message when backend response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
