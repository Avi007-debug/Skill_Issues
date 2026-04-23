import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { Heart, X, MapPin, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import PageTransition from "../components/PageTransition";
import { apiFetch, Destination } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

export default function SwipeDiscovery() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiFetch<{ items: Destination[] }>(
          "/destinations/swipe",
          {},
          getAccessToken() || undefined
        );
        setDestinations(result.items);
      } catch {
        // Fallback to all destinations
        try {
          const result = await apiFetch<{ items: Destination[] }>("/destinations");
          setDestinations(result.items);
        } catch (e) {
          toast.error("Could not load destinations");
        }
      }
    };
    load();
  }, []);

  const current = destinations[currentIndex];

  const handleSwipe = async (action: "like" | "skip") => {
    if (!current) return;
    setDirection(action === "like" ? "right" : "left");

    try {
      const token = getAccessToken();
      if (token) {
        await apiFetch(
          "/destinations/swipe",
          {
            method: "POST",
            body: JSON.stringify({ destination_id: current.id, action }),
          },
          token
        );
      }
    } catch {
      // silently continue even if not logged in
    }

    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 300);

    if (action === "like") {
      toast.success(`Added ${current.name} to your wishlist! ✨`);
    }
  };

  const vibeScore = current
    ? Math.round(
        (current.aesthetic_score +
          current.nightlife_score +
          current.trending_score +
          current.content_creation_score) /
          4
      )
    : 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-lg">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <h1 className="text-4xl mb-2">Discover Destinations</h1>
            <p className="text-muted-foreground">
              Swipe right if you vibe, left to skip ✌️
            </p>
          </div>

          <div className="relative h-[520px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: direction === "right" ? 300 : direction === "left" ? -300 : 0,
                    rotate: direction === "right" ? 15 : direction === "left" ? -15 : 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-card cursor-grab active:cursor-grabbing"
                >
                  {/* Image */}
                  <div className="relative h-72">
                    <img
                      src={current.image_url}
                      alt={current.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-white/80 text-sm">{current.country}</span>
                      </div>
                      <h2 className="text-3xl text-white font-bold">{current.name}</h2>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-500/90 text-white text-lg px-3 py-1 backdrop-blur">
                        {vibeScore}/10 ✨
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="text-muted-foreground mb-4">{current.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-purple-400">{current.aesthetic_score}</div>
                        <div className="text-xs text-muted-foreground">Aesthetic</div>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-pink-400">{current.nightlife_score}</div>
                        <div className="text-xs text-muted-foreground">Nightlife</div>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-orange-400">{current.trending_score}</div>
                        <div className="text-xs text-muted-foreground">Trending</div>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-cyan-400">{current.content_creation_score}</div>
                        <div className="text-xs text-muted-foreground">Content</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-2xl mb-2">You've seen all destinations!</h2>
                  <p className="text-muted-foreground">Check back later for new spots 🌍</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          {current && (
            <div className="flex justify-center gap-8 mt-6">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={() => handleSwipe("skip")}
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <X className="h-7 w-7" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={() => handleSwipe("like")}
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-2 border-green-400 text-green-400 hover:bg-green-400/10"
                >
                  <Heart className="h-7 w-7" />
                </Button>
              </motion.div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            {destinations.length - currentIndex} destinations remaining
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
