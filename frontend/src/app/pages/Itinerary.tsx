import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { MapPin, Calendar, DollarSign, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";
import { apiFetch, ItineraryDay } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

function buildDummyItinerary(destination: string, duration: number, interests: string[]): ItineraryDay[] {
  const map: Record<string, string[]> = {
    adventure: ["Sunrise trek", "ATV trail ride", "Water sports", "Cliff viewpoint"],
    food: ["Street food walk", "Cafe hopping", "Local cooking class", "Night market dinner"],
    shopping: ["Local artisan bazaar", "Outlet district", "Souvenir trail", "Vintage market"],
    nature: ["Botanical park", "Lake sunset", "Nature reserve walk", "Beach sunrise"],
  };

  return Array.from({ length: duration }, (_, idx) => {
    const activities = interests
      .flatMap((i) => map[i] || [])
      .slice(idx % 2, idx % 2 + 4);

    return {
      day: idx + 1,
      title: `Day ${idx + 1} in ${destination}`,
      activities: activities.length ? activities : ["City walk", "Local cafe", "Photo spots"],
    };
  });
}

export default function Itinerary() {
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    { id: "adventure", label: "Adventure" },
    { id: "food", label: "Food" },
    { id: "shopping", label: "Shopping" },
    { id: "nature", label: "Nature" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await apiFetch<{ plan: ItineraryDay[] }>(
        "/itinerary/generate",
        {
          method: "POST",
          body: JSON.stringify({
            destination: formData.destination,
            duration_days: parseInt(formData.duration),
            budget: formData.budget,
            interests,
          }),
        },
        getAccessToken() || undefined
      );
      setItinerary(result.plan || []);
    } catch (error) {
      const fallback = buildDummyItinerary(
        formData.destination,
        parseInt(formData.duration, 10),
        interests
      );
      setItinerary(fallback);
      toast.error(error instanceof Error ? `${error.message}. Showing local itinerary.` : "Could not generate itinerary. Showing local itinerary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <Sparkles className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-4xl mb-4">AI Itinerary Generator</h1>
          <p className="text-muted-foreground">
            Create personalized travel plans powered by AI
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Plan Your Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris"
                    required
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Duration (days)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="14"
                    placeholder="e.g., 5"
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $2000"
                    required
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <Checkbox
                        id={option.id}
                        checked={interests.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setInterests([...interests, option.id]);
                          } else {
                            setInterests(interests.filter((i) => i !== option.id));
                          }
                        }}
                      />
                      <label htmlFor={option.id} className="cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
              >
                <Sparkles className="h-5 w-5" />
                {loading ? "Generating..." : "Generate Itinerary"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {itinerary.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl mb-4">Your Personalized Itinerary</h2>
              {itinerary.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center">
                          {day.day}
                        </div>
                        {day.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {day.activities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </PageTransition>
  );
}
