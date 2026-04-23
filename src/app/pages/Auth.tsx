import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { motion } from "motion/react";
import { Plane } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Auth() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", loginForm);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup:", signupForm);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-6">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Plane className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-3xl brand">Welcome to SkyDash</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to manage your bookings
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-white"
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      required
                      value={signupForm.name}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-white"
                  >
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </motion.div>
      </div>
    </PageTransition>
  );
}
