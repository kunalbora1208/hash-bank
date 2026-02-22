import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { CreditCard, Copy, Check, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Accounts = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ id: string; type: "deposit" | "withdraw" } | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { accounts, user, refreshAccounts } = useAuth();
  const { toast } = useToast();

  const copyNumber = (id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = async () => {
    if (!activeAction || !amount || !user) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast({ variant: "destructive", title: "Invalid amount" });

    const account = accounts.find((a) => a.id === activeAction.id);
    if (!account) return;

    if (activeAction.type === "withdraw" && amt > Number(account.balance)) {
      return toast({ variant: "destructive", title: "Insufficient balance" });
    }

    setLoading(true);
    const newBalance = activeAction.type === "deposit" ? Number(account.balance) + amt : Number(account.balance) - amt;

    try {
      await supabase.from("accounts").update({ balance: newBalance }).eq("id", account.id);
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: amt,
        transaction_type: activeAction.type,
        ...(activeAction.type === "deposit" ? { to_account_id: account.id } : { from_account_id: account.id }),
        description: `${activeAction.type === "deposit" ? "Deposit" : "Withdrawal"} - ${account.account_type}`,
        category: activeAction.type,
      });
      await refreshAccounts();
      toast({ title: `${activeAction.type === "deposit" ? "Deposited" : "Withdrawn"} ₹${amt.toLocaleString("en-IN")}` });
      setActiveAction(null);
      setAmount("");
    } catch {
      toast({ variant: "destructive", title: "Action failed" });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your bank accounts</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map((acc, i) => (
            <motion.div key={acc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-card">
              <div className="gradient-primary p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">{acc.account_type} Account</span>
                    <CreditCard className="w-6 h-6 text-primary-foreground/50" />
                  </div>
                  <p className="text-2xl font-bold font-mono-nums text-primary-foreground tracking-wider mb-3">{acc.account_number}</p>
                  <button onClick={() => copyNumber(acc.id, acc.account_number)} className="flex items-center gap-1 text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {copiedId === acc.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === acc.id ? "Copied" : "Copy number"}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-xl font-bold font-mono-nums text-foreground">₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", acc.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", acc.status === "active" ? "bg-success" : "bg-destructive")} />
                    {acc.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setActiveAction({ id: acc.id, type: "deposit" }); setAmount(""); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">
                    <ArrowDownLeft className="w-4 h-4" /> Deposit
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setActiveAction({ id: acc.id, type: "withdraw" }); setAmount(""); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                    <ArrowUpRight className="w-4 h-4" /> Withdraw
                  </motion.button>
                </div>

                {activeAction?.id === acc.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" type="number"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <div className="flex gap-2">
                      <button onClick={handleAction} disabled={loading || !amount} className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-40">
                        {loading ? "Processing..." : `Confirm ${activeAction.type === "deposit" ? "Deposit" : "Withdrawal"}`}
                      </button>
                      <button onClick={() => setActiveAction(null)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
