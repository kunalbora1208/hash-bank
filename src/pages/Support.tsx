import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Bot, Send, User, TicketCheck, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

const Support = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your **Hash Bank Support Agent** 🛡️\n\nI can help with account issues, transaction disputes, card problems, and more. If I can't resolve it, I'll help you create a support ticket.\n\nWhat's your issue?" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeTab === "tickets") loadTickets();
  }, [activeTab]);

  const loadTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  const createTicket = async () => {
    if (!ticketSubject.trim() || !ticketDesc.trim() || !user) return;
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: ticketSubject,
      description: ticketDesc,
      priority: ticketPriority,
    });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create ticket." });
    } else {
      toast({ title: "Ticket Created", description: "We'll get back to you soon." });
      setTicketSubject("");
      setTicketDesc("");
      setShowCreateTicket(false);
      loadTickets();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: input };
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
        mode: "support",
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          toast({ variant: "destructive", title: "Error", description: err });
          setIsStreaming(false);
        },
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to connect." });
      setIsStreaming(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "open") return <Clock className="w-4 h-4 text-warning" />;
    if (status === "resolved") return <CheckCircle className="w-4 h-4 text-success" />;
    return <AlertCircle className="w-4 h-4 text-info" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-5rem)]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
          <p className="text-sm text-muted-foreground mt-1">AI chat support & ticket management</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["chat", "tickets"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              )}
            >
              {tab === "chat" ? "💬 Chat Support" : "🎫 My Tickets"}
            </button>
          ))}
        </div>

        {activeTab === "chat" ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-info" />
                    </div>
                  )}
                  <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed", msg.role === "user" ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-card border border-border/50 text-foreground rounded-bl-md")}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
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
                  <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-info" /></div>
                  <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-border flex gap-2">
              <button onClick={() => { setActiveTab("tickets"); setShowCreateTicket(true); }} className="px-3 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-sm flex items-center gap-2">
                <TicketCheck className="w-4 h-4" /> Ticket
              </button>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex-1 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your issue..." disabled={isStreaming} className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50" />
                <button type="submit" disabled={!input.trim() || isStreaming} className="px-4 py-3 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            <button onClick={() => setShowCreateTicket(!showCreateTicket)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
              <Plus className="w-4 h-4" /> New Ticket
            </button>

            {showCreateTicket && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                <input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder="Describe your issue in detail..." rows={4} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Priority:</span>
                  {["low", "medium", "high"].map((p) => (
                    <button key={p} onClick={() => setTicketPriority(p)} className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", ticketPriority === p ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{p}</button>
                  ))}
                </div>
                <button onClick={createTicket} disabled={!ticketSubject.trim() || !ticketDesc.trim()} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-40">Submit Ticket</button>
              </motion.div>
            )}

            {tickets.length === 0 && !showCreateTicket && (
              <div className="text-center py-12 text-muted-foreground">
                <TicketCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No tickets yet</p>
              </div>
            )}

            {tickets.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(t.status)}
                      <span className="text-sm font-medium text-foreground truncate">{t.subject}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", t.priority === "high" ? "bg-destructive/20 text-destructive" : t.priority === "medium" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground")}>{t.priority}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(t.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;
