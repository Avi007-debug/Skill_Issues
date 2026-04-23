import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { MapPin, Calendar, DollarSign, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

const generateItinerary = (
  destination: string,
  duration: number,
  interests: string[]
): ItineraryDay[] => {
  const activities: Record<string, string[]> = {
    adventure: [
      "Morning hiking expedition",
      "Water sports activity",
      "Rock climbing session",
    ],
    food: [
      "Food tour of local markets",
      "Cooking class with local chef",
      "Fine dining experience",
    ],
    shopping: [
      "Visit local artisan markets",
      "Shopping district tour",
      "Souvenir hunting",
    ],
    nature: [
      "Nature reserve visit",
      "Botanical garden tour",
      "Sunset viewpoint",
    ],
  };

  return Array.from({ length: duration }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${destination}`,
    activities: interests
      .flatMap((interest) => activities[interest] || [])
      .slice(0, 3),
  }));
};

export default function Itinerary() {
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const interestOptions = [
    { id: "adventure", label: "Adventure" },
    { id: "food", label: "Food" },
    { id: "shopping", label: "Shopping" },
    { id: "nature", label: "Nature" },
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = generateItinerary(
      formData.destination,
      parseInt(formData.duration),
      interests
    );
    setItinerary(generated);
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
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate Itinerary
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
