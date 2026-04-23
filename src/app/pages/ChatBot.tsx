import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PageTransition from "../components/PageTransition";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const botResponses: Record<string, string> = {
  "cheapest flights":
    "The cheapest flights are usually on Tuesdays and Wednesdays. I recommend booking 3-6 weeks in advance for domestic flights and 2-3 months for international routes.",
  "visa requirements":
    "Visa requirements depend on your destination and nationality. I can help you check specific country requirements. Which country are you traveling to?",
  "baggage limits":
    "Most airlines allow 1 carry-on (7-10kg) and 1 checked bag (23kg) for economy. Premium cabins offer higher limits. Always check with your specific airline.",
  "travel recommendations":
    "I'd love to help! Are you looking for adventure, relaxation, culture, or food experiences? And what's your approximate budget?",
  default:
    "I'm here to help with flight bookings, travel tips, visa info, and more. Try asking about cheapest flights, visa requirements, or baggage limits!",
};

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

  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    for (const [key, value] of Object.entries(botResponses)) {
      if (lowerInput.includes(key)) {
        return value;
      }
    }
    return botResponses.default;
  };

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

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: getBotResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
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
