import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  ShoppingCart,
  Zap,
  Home,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  { id: "TXN-001", name: "Salary Deposit", category: "Income", amount: 52000, type: "credit" as const, icon: Briefcase, time: "Today, 9:00 AM" },
  { id: "TXN-002", name: "Coffee Shop", category: "Food & Drink", amount: -380, type: "debit" as const, icon: Coffee, time: "Today, 8:15 AM" },
  { id: "TXN-003", name: "Amazon Purchase", category: "Shopping", amount: -10999, type: "debit" as const, icon: ShoppingCart, time: "Yesterday, 6:30 PM" },
  { id: "TXN-004", name: "Electric Bill", category: "Utilities", amount: -2540, type: "debit" as const, icon: Zap, time: "Yesterday, 2:00 PM" },
  { id: "TXN-005", name: "Rent Payment", category: "Housing", amount: -15000, type: "debit" as const, icon: Home, time: "Feb 1, 12:00 AM" },
  { id: "TXN-006", name: "Freelance Payment", category: "Income", amount: 12000, type: "credit" as const, icon: CreditCard, time: "Jan 30, 4:15 PM" },
];

export const RecentTransactions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card border border-border/50 rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
        <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              tx.type === "credit" ? "bg-success/10" : "bg-muted"
            )}>
              <tx.icon className={cn(
                "w-4.5 h-4.5",
                tx.type === "credit" ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
              <p className="text-xs text-muted-foreground">{tx.time}</p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-sm font-semibold font-mono-nums",
                tx.type === "credit" ? "text-success" : "text-foreground"
              )}>
                {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-0.5">
                {tx.type === "credit" ? (
                  <ArrowDownLeft className="w-3 h-3 text-success" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-[10px] text-muted-foreground">{tx.category}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
