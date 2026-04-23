import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../lib/api";
import { clearAccessToken, getAccessToken } from "../lib/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAccessToken();
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        const result = await apiFetch<ProfileData>("/auth/profile", {}, token);
        setProfile(result);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load profile");
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearAccessToken();
    toast.success("Logged out");
    navigate("/auth");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <h1 className="text-4xl mb-8">Your Profile</h1>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div>{profile?.full_name || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div>{profile?.email || "-"}</div>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
