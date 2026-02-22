import { motion } from "framer-motion";
import { Send, Plus, FileText, CreditCard, QrCode, Building2, Receipt, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Send, label: "Send via UPI", color: "bg-primary/10 text-primary", path: "/upi" },
  { icon: Building2, label: "Fund Transfer", color: "bg-info/10 text-info", path: "/transfer" },
  { icon: Receipt, label: "Pay Bills", color: "bg-warning/10 text-warning", path: "/bills" },
  { icon: Plus, label: "Add Funds", color: "bg-success/10 text-success", path: "/accounts" },
  { icon: Headphones, label: "Support", color: "bg-destructive/10 text-destructive", path: "/support" },
  { icon: QrCode, label: "Scan & Pay", color: "bg-muted text-foreground", path: "/upi" },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card border border-border/50 rounded-2xl p-5 shadow-card"
    >
      <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border/50"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", action.color)}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
