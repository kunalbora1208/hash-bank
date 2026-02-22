import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  title: string;
  amount: number;
  change: number;
  type: "total" | "income" | "expense";
  delay?: number;
}

const iconMap = {
  total: Wallet,
  income: ArrowDownLeft,
  expense: ArrowUpRight,
};

const bgMap = {
  total: "gradient-primary",
  income: "bg-card",
  expense: "bg-card",
};

export const BalanceCard = ({ title, amount, change, type, delay = 0 }: BalanceCardProps) => {
  const [hidden, setHidden] = useState(false);
  const Icon = iconMap[type];
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-2xl p-5 border border-border/50 shadow-card relative overflow-hidden",
        bgMap[type]
      )}
    >
      {type === "total" && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium",
            type === "total" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              type === "total" ? "bg-primary-foreground/20" : "bg-muted"
            )}>
              <Icon className={cn("w-4 h-4", type === "total" ? "text-primary-foreground" : "text-foreground")} />
            </div>
            {title}
          </div>
          <button
            onClick={() => setHidden(!hidden)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              type === "total"
                ? "hover:bg-primary-foreground/10 text-primary-foreground/60"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className={cn(
          "text-2xl md:text-3xl font-bold font-mono-nums tracking-tight mb-2",
          type === "total" ? "text-primary-foreground" : "text-foreground"
        )}>
          {hidden ? "••••••" : `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        </div>

        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={cn(
            "text-xs font-semibold",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className={cn(
            "text-xs",
            type === "total" ? "text-primary-foreground/50" : "text-muted-foreground"
          )}>
            vs last month
          </span>
        </div>
      </div>
    </motion.div>
  );
};
