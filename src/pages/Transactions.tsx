import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Coffee, ShoppingCart, Zap, Home, Briefcase, CreditCard, Wifi, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const allTransactions = [
  { id: "TXN-20240218-001", name: "Salary Deposit", category: "Income", amount: 52000, type: "credit" as const, icon: Briefcase, date: "Feb 18, 2026", time: "9:00 AM", status: "completed" as const },
  { id: "TXN-20240218-002", name: "Coffee Shop", category: "Food & Drink", amount: -380, type: "debit" as const, icon: Coffee, date: "Feb 18, 2026", time: "8:15 AM", status: "completed" as const },
  { id: "TXN-20240217-003", name: "Amazon Purchase", category: "Shopping", amount: -10999, type: "debit" as const, icon: ShoppingCart, date: "Feb 17, 2026", time: "6:30 PM", status: "completed" as const },
  { id: "TXN-20240217-004", name: "Electric Bill", category: "Utilities", amount: -2540, type: "debit" as const, icon: Zap, date: "Feb 17, 2026", time: "2:00 PM", status: "completed" as const },
  { id: "TXN-20240216-005", name: "Rent Payment", category: "Housing", amount: -15000, type: "debit" as const, icon: Home, date: "Feb 16, 2026", time: "12:00 AM", status: "completed" as const },
  { id: "TXN-20240215-006", name: "Freelance Payment", category: "Income", amount: 12000, type: "credit" as const, icon: CreditCard, date: "Feb 15, 2026", time: "4:15 PM", status: "completed" as const },
  { id: "TXN-20240214-007", name: "Internet Bill", category: "Utilities", amount: -1499, type: "debit" as const, icon: Wifi, date: "Feb 14, 2026", time: "10:00 AM", status: "pending" as const },
  { id: "TXN-20240213-008", name: "Petrol", category: "Transport", amount: -2130, type: "debit" as const, icon: Car, date: "Feb 13, 2026", time: "3:45 PM", status: "completed" as const },
];

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const filtered = allTransactions.filter((tx) => {
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || tx.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all your transactions</p>
        </motion.div>

        {/* Filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "credit", "debit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : f === "credit" ? "Income" : "Expenses"}
              </button>
            ))}
            <button className="px-3 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl shadow-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Transaction</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">ID</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.03 }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          tx.type === "credit" ? "bg-success/10" : "bg-muted"
                        )}>
                          <tx.icon className={cn("w-4 h-4", tx.type === "credit" ? "text-success" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{tx.id}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-foreground">{tx.date}</p>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        tx.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        "text-sm font-semibold font-mono-nums",
                        tx.type === "credit" ? "text-success" : "text-foreground"
                      )}>
                        {tx.type === "credit" ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
