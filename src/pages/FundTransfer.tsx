import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FundTransfer = () => {
  const [mode, setMode] = useState<"neft" | "imps">("imps");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, accounts, refreshAccounts } = useAuth();
  const { toast } = useToast();
  const primaryAccount = accounts[0];

  const handleTransfer = async () => {
    if (!accountNumber.trim() || !ifsc.trim() || !beneficiary.trim() || !amount || !user || !primaryAccount) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast({ variant: "destructive", title: "Invalid amount" });
    if (amt > Number(primaryAccount.balance)) return toast({ variant: "destructive", title: "Insufficient balance" });

    setLoading(true);
    try {
      await supabase.from("accounts").update({ balance: Number(primaryAccount.balance) - amt }).eq("id", primaryAccount.id);
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: amt,
        transaction_type: mode,
        from_account_id: primaryAccount.id,
        description: `${mode.toUpperCase()} to ${beneficiary} (${accountNumber})${note ? ` - ${note}` : ""}`,
        category: "transfer",
      });
      await refreshAccounts();
      toast({ title: `${mode.toUpperCase()} Transfer Successful ✅`, description: `₹${amt.toLocaleString("en-IN")} sent to ${beneficiary}` });
      setAccountNumber("");
      setIfsc("");
      setBeneficiary("");
      setAmount("");
      setNote("");
    } catch {
      toast({ variant: "destructive", title: "Transfer failed" });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Fund Transfer</h1>
          <p className="text-sm text-muted-foreground mt-1">Send money via NEFT or IMPS</p>
        </motion.div>

        {primaryAccount && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 text-sm">
            <span className="text-muted-foreground">From: {primaryAccount.account_number} · </span>
            <span className="font-mono-nums font-bold text-foreground">₹{Number(primaryAccount.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="flex gap-2">
          {(["imps", "neft"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors", mode === m ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted")}>
              {m.toUpperCase()}
              <span className="block text-[10px] opacity-70">{m === "imps" ? "Instant" : "Within 2 hrs"}</span>
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
          <input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Beneficiary Name" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="IFSC Code" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" type="number" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTransfer} disabled={loading || !accountNumber.trim() || !ifsc.trim() || !beneficiary.trim() || !amount}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? "Processing..." : <><ArrowLeftRight className="w-4 h-4" /><span>Transfer via {mode.toUpperCase()}</span><ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FundTransfer;
