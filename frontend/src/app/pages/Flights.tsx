import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, Clock, TrendingUp, Flame, AlertCircle } from "lucide-react";
import BookButton from "../components/BookButton";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import PlaneAnimation from "../components/PlaneAnimation";
import { getAirlineColor } from "../utils/airlineColors";
import PageTransition from "../components/PageTransition";
import AnimationOverlay from "../components/AnimationOverlay";
import { apiFetch, Flight } from "../lib/api";
import { toast } from "sonner";

type FlightTag = "Hot" | "Cheapest" | "Rising";

interface UIFlight extends Flight {
  tag?: FlightTag;
}

export default function Flights() {
  const navigate = useNavigate();
  const location = useLocation();
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<UIFlight | null>(null);
  const [flights, setFlights] = useState<UIFlight[]>([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const params = new URLSearchParams();
        const source = query.get("source");
        const destination = query.get("destination");
        const date = query.get("date");

        if (source) params.set("source", source);
        if (destination) params.set("destination", destination);
        if (date) params.set("date", date);

        const result = await apiFetch<{ items: Flight[] }>(`/flights?${params.toString()}`);
        const taggedFlights = result.items.map((flight, index) => ({
          ...flight,
          tag: index % 3 === 0 ? "Cheapest" : index % 3 === 1 ? "Hot" : "Rising",
        }));
        setFlights(taggedFlights);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load flights");
      }
    };

    fetchFlights();
  }, [location.search]);

  const airlines = Array.from(new Set(flights.map((f) => f.airline)));

  const filteredFlights = flights.filter((flight) => {
    const inPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];
    const inAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);
    return inPrice && inAirline;
  });

  const handleBookFlight = (flight: UIFlight) => {
    setSelectedFlight(flight);
    setShowPlaneAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowPlaneAnimation(false);
    if (selectedFlight) {
      navigate("/booking", { state: { flight: selectedFlight } });
    }
  };

  const getTagIcon = (tag?: string) => {
    switch (tag) {
      case "Hot":
        return <Flame className="h-4 w-4" />;
      case "Rising":
        return <TrendingUp className="h-4 w-4" />;
      case "Cheapest":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AnimationOverlay
          isVisible={showPlaneAnimation}
          color={selectedFlight ? getAirlineColor(selectedFlight.airline) : "#f97316"}
        />
        <PlaneAnimation
          isVisible={showPlaneAnimation}
          airlineColor={selectedFlight ? getAirlineColor(selectedFlight.airline) : "#f97316"}
          onComplete={handleAnimationComplete}
        />
        <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl mb-8">Available Flights</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={30000}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4">Airlines</h3>
                  <div className="space-y-3">
                    {airlines.map((airline) => (
                      <div key={airline} className="flex items-center gap-2">
                        <Checkbox
                          id={airline}
                          checked={selectedAirlines.includes(airline)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAirlines([...selectedAirlines, airline]);
                            } else {
                              setSelectedAirlines(
                                selectedAirlines.filter((a) => a !== airline)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={airline}
                          className="text-sm cursor-pointer"
                        >
                          {airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Plane className="h-5 w-5 text-accent" />
                          <span className="font-medium">{flight.airline}</span>
                          {flight.tag && (
                            <Badge
                              variant={
                                flight.tag === "Cheapest"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`gap-1 ${
                                flight.tag === "Hot"
                                  ? "bg-red-500 text-white"
                                  : flight.tag === "Rising"
                                  ? "bg-orange-500 text-white"
                                  : "bg-accent text-white"
                              }`}
                            >
                              {getTagIcon(flight.tag)}
                              {flight.tag}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <div className="text-2xl">
                              {flight.departure_time}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Departure
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                            <div className="text-sm text-muted-foreground">
                              {flight.duration}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl">{flight.arrival_time}</div>
                            <div className="text-sm text-muted-foreground">
                              Arrival
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                          {flight.seats_left} seats left
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-3xl text-accent">
                            ${flight.price}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per person
                          </div>
                        </div>
                        <BookButton
                          onClick={() => handleBookFlight(flight)}
                          className={showPlaneAnimation && selectedFlight?.id === flight.id ? "opacity-50 pointer-events-none" : ""}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
