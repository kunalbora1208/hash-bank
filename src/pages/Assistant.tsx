import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hello! I'm your **Hash Bank AI Assistant** 🏦\n\nI can help you with:\n- 💰 Account balances & transactions\n- 📊 Spending insights & budgeting\n- 🏠 Loan eligibility & EMI calculations\n- 💳 Card management\n- 📱 UPI & payment guidance\n\nHow can I help you today?",
  },
];

const suggestions = [
  "What's my spending summary?",
  "How do I send money via UPI?",
  "Am I eligible for a loan?",
  "Explain my recent transactions",
];

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isStreaming) return;

    const userMsg: Message = { role: "user", content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev.slice(0, newMessages.length), { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        mode: "assistant",
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          toast({ variant: "destructive", title: "AI Error", description: err });
          setIsStreaming(false);
        },
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to connect to AI assistant." });
      setIsStreaming(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-5rem)]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Powered by AI · Your personal banking assistant</p>
        </motion.div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" && "justify-end")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border/50 text-foreground rounded-bl-md"
              )}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-3 border-t border-border"
        >
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your balance, loans, spending..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-4 py-3 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI assistant provides guidance only · Cannot perform transactions
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
