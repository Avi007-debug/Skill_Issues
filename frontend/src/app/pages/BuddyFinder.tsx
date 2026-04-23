import { useEffect, useState } from "react";
import { Users, Search, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import PageTransition from "../components/PageTransition";
import { apiFetch, BuddyProfile } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

export default function BuddyFinder() {
  const [destination, setDestination] = useState("");
  const [travelStart, setTravelStart] = useState("");
  const [travelEnd, setTravelEnd] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");

  const [searchDestination, setSearchDestination] = useState("");
  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBuddies = async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("destination", query);
      const token = getAccessToken() || undefined;
      const result = await apiFetch<{ items: BuddyProfile[] }>(
        `/buddies/find?${params.toString()}`,
        {},
        token
      );
      setBuddies(result.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not find buddies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuddies("");
  }, []);

  const handleCreateProfile = async () => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to create a buddy profile");
      return;
    }

    try {
      await apiFetch(
        "/buddies/profile",
        {
          method: "POST",
          body: JSON.stringify({
            destination,
            travel_start: travelStart || null,
            travel_end: travelEnd || null,
            interests: interests
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
            bio: bio || null,
          }),
        },
        token
      );
      toast.success("Buddy profile saved");
      loadBuddies(searchDestination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    }
  };

  const handleConnect = async (receiverId: string) => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to send match requests");
      return;
    }

    try {
      await apiFetch(
        "/buddies/match",
        {
          method: "POST",
          body: JSON.stringify({ receiver_id: receiverId, status: "pending" }),
        },
        token
      );
      toast.success("Connection request sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send request");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-8">
            <Users className="h-14 w-14 text-accent mx-auto mb-3" />
            <h1 className="text-4xl mb-2">Travel Buddy Finder</h1>
            <p className="text-muted-foreground">Find companions with matching destination and dates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Buddy Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="dest">Destination</Label>
                  <Input id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input id="start" type="date" value={travelStart} onChange={(e) => setTravelStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input id="end" type="date" value={travelEnd} onChange={(e) => setTravelEnd(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma separated)</Label>
                  <Input
                    id="interests"
                    placeholder="food, nightlife, photography"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleCreateProfile}>Save Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Find Buddies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search by destination"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => loadBuddies(searchDestination)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
                  {!loading && buddies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No matching travelers found yet.</p>
                  ) : null}

                  {buddies.map((buddy) => (
                    <Card key={buddy.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{buddy.profiles?.full_name || "Traveler"}</p>
                            <p className="text-sm text-muted-foreground">Destination: {buddy.destination}</p>
                            {buddy.travel_start || buddy.travel_end ? (
                              <p className="text-sm text-muted-foreground">
                                {buddy.travel_start || "?"} to {buddy.travel_end || "?"}
                              </p>
                            ) : null}
                            {buddy.interests?.length ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {buddy.interests.map((item) => (
                                  <Badge key={item} variant="secondary">{item}</Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <Button size="sm" onClick={() => handleConnect(buddy.user_id)} className="gap-1">
                            <UserPlus className="h-4 w-4" />
                            Connect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
