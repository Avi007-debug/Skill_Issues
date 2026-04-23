import { Link, useLocation } from "react-router-dom";
import { Moon, Sparkles, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { getAccessToken } from "../lib/auth";
import { apiFetch } from "../lib/api";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  const location = useLocation();
  const hasSession = Boolean(getAccessToken());
  const [vibeEnabled, setVibeEnabled] = useState(false);

  const navItems = [
    { path: "/flights", label: "Flights" },
    { path: "/carbon-tracker", label: "Eco Flights" },
    { path: "/itinerary", label: "Itinerary" },
    { path: "/price-alerts", label: "Price Alerts" },
    { path: "/group-booking", label: "Group Booking" },
    { path: "/discover", label: "Discover" },
    { path: "/buddies", label: "Buddies" },
  ];

  useEffect(() => {
    const token = getAccessToken() || undefined;
    apiFetch<{ vibe_mode: boolean }>("/vibe-mode", {}, token)
      .then((result) => setVibeEnabled(Boolean(result.vibe_mode)))
      .catch(() => setVibeEnabled(false));
  }, [hasSession]);

  const toggleVibeMode = async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }
    const next = !vibeEnabled;
    try {
      await apiFetch(
        "/vibe-mode",
        {
          method: "POST",
          body: JSON.stringify({ enabled: next }),
        },
        token
      );
      setVibeEnabled(next);
    } catch {
      // Keep current state when update fails.
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/Image.jpeg"
            alt="AirZy"
            className="h-9 w-9 rounded-full object-cover bg-white/90 p-0.5 shadow-sm"
          />
          <span className="brand text-2xl tracking-tight">AirZy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm transition-colors hover:text-accent ${
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/chatbot"
            className="text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            AI Assistant
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant={vibeEnabled ? "default" : "outline"}
            onClick={toggleVibeMode}
            className="gap-2"
            disabled={!hasSession}
          >
            <Sparkles className="h-4 w-4" />
            Vibe
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Link to={hasSession ? "/profile" : "/auth"}>
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              {hasSession ? "Profile" : "Login"}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
