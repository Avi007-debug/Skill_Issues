import { useState } from "react";
import { Leaf, TrendingDown } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import BookButton from "../components/BookButton";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import PlaneAnimation from "../components/PlaneAnimation";
import { getAirlineColor } from "../utils/airlineColors";
import PageTransition from "../components/PageTransition";
import AnimationOverlay from "../components/AnimationOverlay";

interface EcoFlight {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  carbonEmission: number;
  isEcoFriendly: boolean;
}

const mockEcoFlights: EcoFlight[] = [
  {
    id: "1",
    airline: "GreenWings Airlines",
    departureTime: "09:00 AM",
    arrivalTime: "12:30 PM",
    duration: "3h 30m",
    price: 329,
    carbonEmission: 120,
    isEcoFriendly: true,
  },
  {
    id: "2",
    airline: "SkyWings Airlines",
    departureTime: "10:15 AM",
    arrivalTime: "01:45 PM",
    duration: "3h 30m",
    price: 299,
    carbonEmission: 185,
    isEcoFriendly: false,
  },
  {
    id: "3",
    airline: "EcoJet Airways",
    departureTime: "02:30 PM",
    arrivalTime: "06:00 PM",
    duration: "3h 30m",
    price: 349,
    carbonEmission: 110,
    isEcoFriendly: true,
  },
  {
    id: "4",
    airline: "CloudJet International",
    departureTime: "05:45 PM",
    arrivalTime: "09:15 PM",
    duration: "3h 30m",
    price: 425,
    carbonEmission: 195,
    isEcoFriendly: false,
  },
];

export default function CarbonTracker() {
  const navigate = useNavigate();
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<EcoFlight | null>(null);

  const handleBookFlight = (flight: EcoFlight) => {
    setSelectedFlight(flight);
    setShowPlaneAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowPlaneAnimation(false);
    if (selectedFlight) {
      navigate("/booking", { state: { flight: selectedFlight } });
    }
  };

  const getEmissionColor = (emission: number) => {
    if (emission < 130) return "text-green-500";
    if (emission < 170) return "text-yellow-500";
    return "text-red-500";
  };

  const getEmissionBadge = (emission: number) => {
    if (emission < 130) return "Low";
    if (emission < 170) return "Medium";
    return "High";
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <AnimationOverlay
          isVisible={showPlaneAnimation}
          color={selectedFlight ? getAirlineColor(selectedFlight.airline) : "#f97316"}
        />
        <PlaneAnimation
          isVisible={showPlaneAnimation}
          airlineColor={selectedFlight ? getAirlineColor(selectedFlight.airline) : "#f97316"}
          onComplete={handleAnimationComplete}
        />
        <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Leaf className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl mb-4">Eco-Friendly Flights</h1>
          <p className="text-muted-foreground">
            Choose flights with lower carbon emissions and help protect our planet
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          {mockEcoFlights.map((flight, index) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  flight.isEcoFriendly ? "border-green-500 border-2 hover:border-green-400" : "border-2 hover:border-accent/20"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-medium">{flight.airline}</span>
                        {flight.isEcoFriendly && (
                          <Badge className="gap-1 bg-green-500 text-white">
                            <Leaf className="h-3 w-3" />
                            Recommended Eco Option
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <div className="text-2xl">{flight.departureTime}</div>
                          <div className="text-sm text-muted-foreground">
                            Departure
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <TrendingDown className="h-4 w-4 text-muted-foreground mb-1" />
                          <div className="text-sm text-muted-foreground">
                            {flight.duration}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl">{flight.arrivalTime}</div>
                          <div className="text-sm text-muted-foreground">
                            Arrival
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Carbon Emission:{" "}
                          </span>
                          <span
                            className={`text-sm ${getEmissionColor(
                              flight.carbonEmission
                            )}`}
                          >
                            {flight.carbonEmission}kg CO₂
                          </span>
                        </div>
                        <Badge
                          variant={
                            flight.carbonEmission < 130 ? "default" : "secondary"
                          }
                          className={
                            flight.carbonEmission < 130
                              ? "bg-green-500 text-white"
                              : flight.carbonEmission < 170
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {getEmissionBadge(flight.carbonEmission)} Impact
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-3xl text-accent">${flight.price}</div>
                        <div className="text-sm text-muted-foreground">
                          per person
                        </div>
                      </div>
                      <BookButton
                        onClick={() => handleBookFlight(flight)}
                        variant={flight.isEcoFriendly ? "eco" : "default"}
                        className={showPlaneAnimation && selectedFlight?.id === flight.id ? "opacity-50 pointer-events-none" : ""}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 max-w-5xl mx-auto">
          <Card className="bg-green-500/10 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Leaf className="h-8 w-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl mb-2">Why Choose Eco-Friendly Flights?</h3>
                  <p className="text-muted-foreground">
                    By choosing flights with lower carbon emissions, you're contributing
                    to a more sustainable future. Our eco-friendly options use newer
                    aircraft with better fuel efficiency and carbon offset programs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
