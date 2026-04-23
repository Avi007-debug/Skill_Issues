import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PlaneAnimation from "../components/PlaneAnimation";
import { getAirlineColor } from "../utils/airlineColors";
import PageTransition from "../components/PageTransition";
import AnimationOverlay from "../components/AnimationOverlay";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        "/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            flight_id: flight.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          }),
        },
        getAccessToken() || undefined
      );

      setShowPlaneAnimation(true);
      toast.success("Booking confirmed!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    }
  };

  const handleAnimationComplete = () => {
    setShowPlaneAnimation(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No flight selected</h2>
          <Button onClick={() => navigate("/flights")}>Browse Flights</Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-24 w-24 text-accent mx-auto mb-6" />
          <h2 className="text-3xl mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Redirecting to home page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <AnimationOverlay
          isVisible={showPlaneAnimation}
          color={flight ? getAirlineColor(flight.airline) : "#f97316"}
        />
        <PlaneAnimation
          isVisible={showPlaneAnimation}
          airlineColor={flight ? getAirlineColor(flight.airline) : "#f97316"}
          onComplete={handleAnimationComplete}
          withTicket={true}
        />
        <div className="container mx-auto px-6">
        <h1 className="text-4xl mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Passenger Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-white relative overflow-hidden group"
                    disabled={showPlaneAnimation}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <span className="relative z-10">
                      {showPlaneAnimation ? "Processing..." : "Confirm Booking"}
                    </span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Airline</div>
                  <div>{flight.airline}</div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Departure</div>
                    <div>{flight.departure_time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Arrival</div>
                    <div>{flight.arrival_time}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div>{flight.duration}</div>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-4">
                  <div className="text-lg">Total Price</div>
                  <div className="text-3xl text-accent">${flight.price}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
