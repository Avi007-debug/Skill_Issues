import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

export default function PriceAlerts() {
  const [savedAlerts, setSavedAlerts] = useState<Array<Record<string, string>>>([]);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    preferredPrice: "",
    email: "",
    phone: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email && !formData.phone) {
      toast.error("Please provide email or phone number");
      return;
    }

    setSavedAlerts((prev) => [
      {
        from: formData.from,
        to: formData.to,
        date: formData.date,
        preferredPrice: formData.preferredPrice,
        email: formData.email,
        phone: formData.phone,
      },
      ...prev,
    ]);

    try {
      if (formData.email) {
        await apiFetch(
          "/price-alerts",
          {
            method: "POST",
            body: JSON.stringify({
              route_from: formData.from,
              route_to: formData.to,
              travel_date: formData.date,
              preferred_price: Number(formData.preferredPrice),
              email: formData.email,
            }),
          },
          getAccessToken() || undefined
        );
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ from: "", to: "", date: "", preferredPrice: "", email: "", phone: "" });
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set price alert");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <Bell className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-4xl mb-4">Price Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when flight prices drop for your route
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="Departure city"
                  required
                  value={formData.from}
                  onChange={(e) =>
                    setFormData({ ...formData, from: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="Destination city"
                  required
                  value={formData.to}
                  onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Travel Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
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
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredPrice">Preferred Price</Label>
                <Input
                  id="preferredPrice"
                  type="number"
                  placeholder="e.g. 5000"
                  required
                  min="1"
                  value={formData.preferredPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredPrice: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                Set Price Alert
              </Button>
            </form>

            {savedAlerts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Saved locally: {savedAlerts.length} alert(s)
              </p>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <Card className="w-96">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl mb-2">Alert Set!</h3>
                  <p className="text-muted-foreground">
                    We'll notify you when prices drop for this route
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </PageTransition>
  );
}
