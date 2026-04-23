import { Link, useLocation } from "react-router";
import { Moon, Sun, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  const location = useLocation();

  const navItems = [
    { path: "/flights", label: "Flights" },
    { path: "/carbon-tracker", label: "Eco Flights" },
    { path: "/itinerary", label: "Itinerary" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="brand text-2xl tracking-tight">SkyDash ✈️</span>
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
          <Link to="/auth">
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
