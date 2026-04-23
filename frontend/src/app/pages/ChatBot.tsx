import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const sampleResponses: Record<string, string> = {
  cheapest: "The cheapest fares usually show up on Tue/Wed. Try setting a price alert and flexible dates for better deals.",
  visa: "Visa requirements depend on your passport and destination. Share your route and I can suggest the usual visa checklist.",
  baggage: "Most economy tickets include 1 cabin bag; check-in allowance depends on fare class and airline policy.",
  recommendations: "For a short vibe trip: Goa. For budget + food: Vietnam. For content and beaches: Bali.",
};

function getSampleResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("cheap")) return sampleResponses.cheapest;
  if (q.includes("visa")) return sampleResponses.visa;
  if (q.includes("baggage") || q.includes("luggage")) return sampleResponses.baggage;
  if (q.includes("recommend") || q.includes("where") || q.includes("destination")) {
    return sampleResponses.recommendations;
  }
  return "I can help with cheapest flights, visa requirements, baggage limits, and travel recommendations.";
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content:
        "Hi! I'm your SkyDash AI assistant. Ask me about flights, visas, baggage, or travel recommendations!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await apiFetch<{ answer: string }>(
        "/chatbot/ask",
        {
          method: "POST",
          body: JSON.stringify({ question: userMessage.content }),
        },
        getAccessToken() || undefined
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: getSampleResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
      toast.error(error instanceof Error ? `${error.message}. Showing local response.` : "Chat service unavailable. Showing local response.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl mb-8">AI Travel Assistant</h1>

        <Card className="h-[600px] flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "bot" && (
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-accent text-white"
                          : "bg-card"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-card rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about travel..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "cheapest flights",
            "visa requirements",
            "baggage limits",
            "travel recommendations",
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              onClick={() => {
                setInput(suggestion);
              }}
              className="text-sm"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
