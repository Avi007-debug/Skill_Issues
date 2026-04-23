import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import PageTransition from "../components/PageTransition";

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("1");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("source", from);
    if (to) params.set("destination", to);
    if (date) params.set("date", date);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <PageTransition>
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80"
          alt="Sunset airplane"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-6xl md:text-7xl mb-6 text-white drop-shadow-lg">
            Find Your Next Journey
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 drop-shadow">
            Book flights at the best prices
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur border-white/20 h-12"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur border-white/20 h-12"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur border-white/20 h-12"
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Travelers"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  min="1"
                  className="pl-10 bg-white/90 backdrop-blur border-white/20 h-12"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white gap-2"
            >
              <Search className="h-5 w-5" />
              Search Flights
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Price Alerts", path: "/price-alerts" },
              { label: "AI Assistant", path: "/chatbot" },
              { label: "Group Booking", path: "/group-booking" },
              { label: "Plan Trip", path: "/itinerary" },
            ].map((feature, index) => (
              <motion.button
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={() => navigate(feature.path)}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-white hover:bg-white/10 transition-all"
              >
                {feature.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
      </div>
    </PageTransition>
  );
}
