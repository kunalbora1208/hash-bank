import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Zap, Smartphone, Wifi, Tv, Droplets, GraduationCap, Receipt, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const billers = [
  { icon: Zap, label: "Electricity", category: "electricity" },
  { icon: Smartphone, label: "Mobile Recharge", category: "mobile" },
  { icon: Wifi, label: "Broadband", category: "broadband" },
  { icon: Tv, label: "DTH / Cable", category: "dth" },
  { icon: Droplets, label: "Water", category: "water" },
  { icon: GraduationCap, label: "Education", category: "education" },
];

const BillPayments = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, accounts, refreshAccounts } = useAuth();
  const { toast } = useToast();
  const primaryAccount = accounts[0];

  const handlePay = async () => {
    if (!billerName.trim() || !amount || !user || !primaryAccount || !selectedCategory) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast({ variant: "destructive", title: "Invalid amount" });
    if (amt > Number(primaryAccount.balance)) return toast({ variant: "destructive", title: "Insufficient balance" });

    setLoading(true);
    try {
      await supabase.from("accounts").update({ balance: Number(primaryAccount.balance) - amt }).eq("id", primaryAccount.id);
      await supabase.from("bill_payments").insert({ user_id: user.id, biller_name: billerName, biller_category: selectedCategory, amount: amt, account_id: primaryAccount.id });
      await supabase.from("transactions").insert({ user_id: user.id, amount: amt, transaction_type: "bill_payment", from_account_id: primaryAccount.id, description: `Bill payment - ${billerName}`, category: selectedCategory });
      await refreshAccounts();
      toast({ title: "Bill Paid ✅", description: `₹${amt.toLocaleString("en-IN")} paid to ${billerName}` });
      setBillerName("");
      setAmount("");
      setSelectedCategory(null);
    } catch {
      toast({ variant: "destructive", title: "Payment failed" });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Receipt className="w-6 h-6 text-primary" /> Bill Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Pay your utility bills instantly</p>
        </motion.div>

        {primaryAccount && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 text-sm">
            <span className="text-muted-foreground">Available Balance: </span>
            <span className="font-mono-nums font-bold text-foreground">₹{Number(primaryAccount.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {billers.map((b) => (
            <motion.button key={b.category} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedCategory(b.category); setBillerName(""); setAmount(""); }}
              className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors", selectedCategory === b.category ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted")}>
              <b.icon className={cn("w-6 h-6", selectedCategory === b.category ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium text-foreground">{b.label}</span>
            </motion.button>
          ))}
        </div>

        {selectedCategory && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground capitalize">{billers.find((b) => b.category === selectedCategory)?.label}</h3>
            <input value={billerName} onChange={(e) => setBillerName(e.target.value)} placeholder="Provider / Account ID" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" type="number" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePay} disabled={loading || !billerName.trim() || !amount}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? "Processing..." : <><span>Pay Now</span><ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillPayments;
