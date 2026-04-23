import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Users, Plus, Trash2, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";

interface Traveler {
  id: string;
  name: string;
}

export default function GroupBooking() {
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: "1", name: "" },
  ]);
  const [totalCost, setTotalCost] = useState<number>(0);

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

                <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                  Proceed to Payment
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
