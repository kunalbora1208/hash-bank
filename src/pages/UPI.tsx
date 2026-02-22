import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Send, QrCode, UserPlus, Clock, Shield, ArrowRight, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UPI = () => {
  const { profile, accounts, user, refreshAccounts } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "qr" | "history">("send");
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const myUpiId = profile?.upi_id || "loading...";
  const primaryAccount = accounts?.[0];

  const copyUpiId = () => {
    navigator.clipboard.writeText(myUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !amount || !upiPin) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (amt > Number(primaryAccount?.balance || 0)) {
      toast({ title: "Insufficient balance", description: "You don't have enough funds", variant: "destructive" });
      return;
    }
    if (upiId === myUpiId) {
      toast({ title: "Error", description: "Cannot send to yourself", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Find recipient by UPI ID
    const { data: recipient } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("upi_id", upiId)
      .single();

    if (!recipient) {
      setLoading(false);
      toast({ title: "UPI ID not found", description: "No user found with this UPI ID", variant: "destructive" });
      return;
    }

    // Get recipient's account
    const { data: recipientAccount } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", recipient.user_id)
      .limit(1)
      .single();

    if (!recipientAccount) {
      setLoading(false);
      toast({ title: "Error", description: "Recipient account not found", variant: "destructive" });
      return;
    }

    // Debit sender
    const { error: debitError } = await supabase
      .from("accounts")
      .update({ balance: Number(primaryAccount.balance) - amt })
      .eq("id", primaryAccount.id);

    if (debitError) {
      setLoading(false);
      toast({ title: "Transaction failed", description: debitError.message, variant: "destructive" });
      return;
    }

    // Credit recipient
    await supabase
      .from("accounts")
      .update({ balance: Number(recipientAccount.balance) + amt })
      .eq("id", recipientAccount.id);

    // Record transaction for sender
    await supabase.from("transactions").insert({
      user_id: user!.id,
      from_account_id: primaryAccount.id,
      to_account_id: recipientAccount.id,
      amount: amt,
      transaction_type: "upi_send",
      description: note || `UPI payment to ${upiId}`,
      category: "UPI Transfer",
      upi_id: upiId,
    });

    // Record transaction for recipient
    await supabase.from("transactions").insert({
      user_id: recipient.user_id,
      from_account_id: primaryAccount.id,
      to_account_id: recipientAccount.id,
      amount: amt,
      transaction_type: "upi_receive",
      description: `UPI received from ${myUpiId}`,
      category: "UPI Transfer",
      upi_id: myUpiId,
    });

    await refreshAccounts();
    setLoading(false);
    setUpiId("");
    setAmount("");
    setUpiPin("");
    setNote("");
    toast({ title: "Payment successful! ✅", description: `₹${amt.toLocaleString("en-IN")} sent to ${upiId}` });
  };

  const handleSetPin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      toast({ title: "Error", description: "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ title: "Error", description: "PINs don't match", variant: "destructive" });
      return;
    }
    await supabase.from("profiles").update({ upi_pin: newPin }).eq("user_id", user!.id);
    setShowPinSetup(false);
    setNewPin("");
    setConfirmPin("");
    toast({ title: "UPI PIN set successfully!" });
  };

  const loadHistory = async () => {
    setTxLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .in("transaction_type", ["upi_send", "upi_receive"])
      .order("created_at", { ascending: false })
      .limit(20);
    setTransactions(data || []);
    setTxLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">UPI Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Send and receive money instantly via UPI</p>
        </motion.div>

        {/* My UPI Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Your UPI ID</p>
              <p className="text-lg font-bold font-mono text-primary-foreground mt-1">{myUpiId}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">
                Balance: ₹{Number(primaryAccount?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyUpiId} className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                {copied ? <Check className="w-4 h-4 text-primary-foreground" /> : <Copy className="w-4 h-4 text-primary-foreground" />}
              </button>
              <button onClick={() => setShowPinSetup(true)} className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* PIN Setup Modal */}
        {showPinSetup && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Set / Change UPI PIN</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="New 4-digit PIN"
                className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-center text-sm tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Confirm PIN"
                className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-center text-sm tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSetPin} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
                Set PIN
              </button>
              <button onClick={() => setShowPinSetup(false)} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium border border-border">
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { key: "send", label: "Send Money", icon: Send },
            { key: "qr", label: "QR Code", icon: QrCode },
            { key: "history", label: "History", icon: Clock },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "history") loadHistory();
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Send Money */}
        {activeTab === "send" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 shadow-card">
            <form onSubmit={handleSendMoney} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recipient UPI ID</label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="user@hashbank"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono-nums text-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">UPI PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={upiPin}
                  onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-center text-sm tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pay Now <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* QR Code */}
        {activeTab === "qr" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-8 shadow-card text-center">
            <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 mb-4">
              <div className="w-full h-full bg-foreground/5 rounded-lg flex items-center justify-center relative">
                {/* Simple QR-like pattern */}
                <div className="grid grid-cols-8 gap-[2px] w-32 h-32">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-[1px]",
                        Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                      )}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">#</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Scan to pay</p>
            <p className="text-base font-semibold font-mono text-foreground">{myUpiId}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Share this QR code to receive payments instantly
            </p>
          </motion.div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl shadow-card overflow-hidden">
            {txLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No UPI transactions yet. Start by sending money!
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        tx.transaction_type === "upi_receive" ? "bg-success/10" : "bg-muted"
                      )}>
                        <Send className={cn(
                          "w-4 h-4",
                          tx.transaction_type === "upi_receive" ? "text-success rotate-180" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold font-mono-nums",
                      tx.transaction_type === "upi_receive" ? "text-success" : "text-foreground"
                    )}>
                      {tx.transaction_type === "upi_receive" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UPI;
