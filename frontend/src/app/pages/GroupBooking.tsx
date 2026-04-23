import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Users, Plus, Trash2, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

interface Traveler {
  id: string;
  name: string;
}

export default function GroupBooking() {
  const [squadName, setSquadName] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: "1", name: "" },
  ]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const addTraveler = () => {
    setTravelers([...travelers, { id: Date.now().toString(), name: "" }]);
  };

  const removeTraveler = (id: string) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((t) => t.id !== id));
    }
  };

  const updateTravelerName = (id: string, name: string) => {
    setTravelers(
      travelers.map((t) => (t.id === id ? { ...t, name } : t))
    );
  };

  const costPerPerson = travelers.length > 0 ? totalCost / travelers.length : 0;

  const handleCreateSquad = async () => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to create a squad trip");
      return;
    }

    setSubmitting(true);
    try {
      const memberNames = travelers.map((t) => t.name.trim()).filter(Boolean);
      const squadRes = await apiFetch<{ squad: { id: string } }>(
        "/squads",
        {
          method: "POST",
          body: JSON.stringify({
            squad_name: squadName || "My Squad Trip",
            destination: destination || null,
            travel_date: travelDate || null,
            members: memberNames,
          }),
        },
        token
      );

      if (totalCost > 0) {
        await apiFetch(
          "/squads/expense",
          {
            method: "POST",
            body: JSON.stringify({
              squad_id: squadRes.squad.id,
              description: "Initial trip split",
              amount: totalCost,
              paid_by_member_id: null,
            }),
          },
          token
        );
      }

      toast.success("Squad trip created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create squad trip");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-4xl mb-4">Group Flight Booking</h1>
          <p className="text-muted-foreground">
            Book flights for multiple travelers and split the cost
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Travelers</span>
                  <Button
                    onClick={addTraveler}
                    size="sm"
                    className="gap-2 bg-accent hover:bg-accent/90 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Traveler
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="squad-name">Squad Name</Label>
                    <Input
                      id="squad-name"
                      placeholder="Trip Squad"
                      value={squadName}
                      onChange={(e) => setSquadName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Goa"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="travel-date">Travel Date</Label>
                    <Input
                      id="travel-date"
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {travelers.map((traveler, index) => (
                    <motion.div
                      key={traveler.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`traveler-${traveler.id}`}>
                          Traveler {index + 1}
                        </Label>
                        <Input
                          id={`traveler-${traveler.id}`}
                          placeholder="Full Name"
                          value={traveler.name}
                          onChange={(e) =>
                            updateTravelerName(traveler.id, e.target.value)
                          }
                        />
                      </div>
                      {travelers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTraveler(traveler.id)}
                          className="text-destructive hover:text-destructive mt-8"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="pt-4 space-y-2">
                  <Label htmlFor="total-cost">Total Flight Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="total-cost"
                      type="number"
                      placeholder="0"
                      value={totalCost || ""}
                      onChange={(e) => setTotalCost(Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Total Travelers
                  </div>
                  <div className="text-2xl">{travelers.length}</div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Total Cost
                  </div>
                  <div className="text-2xl text-accent">
                    ${totalCost.toFixed(2)}
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Cost Per Person
                  </div>
                  <div className="text-3xl text-accent">
                    ${costPerPerson.toFixed(2)}
                  </div>
                </div>

                <Button
                  onClick={handleCreateSquad}
                  disabled={submitting}
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                >
                  {submitting ? "Saving..." : "Create Squad Trip"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-medium mb-2">Split Payment Information</h3>
              <p className="text-sm text-muted-foreground">
                Each traveler will receive a payment link for their share. The
                booking will be confirmed once all payments are received.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
