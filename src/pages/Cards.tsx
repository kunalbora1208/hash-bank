import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { CreditCard, Wifi, Lock, Unlock, Eye, EyeOff, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const cards = [
  {
    id: "CARD-001",
    type: "Visa Platinum",
    number: "5412 •••• •••• 4829",
    expiry: "12/28",
    holder: "JOHN DOE",
    color: "from-[hsl(160,84%,35%)] to-[hsl(180,70%,30%)]",
    limit: 25000,
    spent: 3420,
    frozen: false,
  },
  {
    id: "CARD-002",
    type: "Mastercard Gold",
    number: "4231 •••• •••• 7812",
    expiry: "06/27",
    holder: "JOHN DOE",
    color: "from-[hsl(213,94%,45%)] to-[hsl(240,70%,40%)]",
    limit: 15000,
    spent: 8900,
    frozen: false,
  },
];

const Cards = () => {
  const [frozenCards, setFrozenCards] = useState<Set<string>>(new Set());

  const toggleFreeze = (id: string) => {
    setFrozenCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your debit and credit cards</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => {
            const isFrozen = frozenCards.has(card.id);
            const spentPercent = (card.spent / card.limit) * 100;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                {/* Card visual */}
                <div className={cn(
                  "relative rounded-2xl p-6 bg-gradient-to-br aspect-[1.6/1] flex flex-col justify-between overflow-hidden",
                  card.color,
                  isFrozen && "opacity-60 grayscale"
                )}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">{card.type}</span>
                      <Wifi className="w-5 h-5 text-primary-foreground/50 rotate-90" />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-3">
                    <p className="text-lg font-mono tracking-[0.2em] text-primary-foreground">{card.number}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-primary-foreground/50 uppercase">Card Holder</p>
                        <p className="text-xs font-medium text-primary-foreground tracking-wider">{card.holder}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary-foreground/50 uppercase">Expires</p>
                        <p className="text-xs font-medium text-primary-foreground">{card.expiry}</p>
                      </div>
                    </div>
                  </div>
                  {isFrozen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-20">
                      <div className="flex items-center gap-2 text-foreground">
                        <Snowflake className="w-5 h-5" />
                        <span className="text-sm font-semibold">Card Frozen</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card controls */}
                <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-card space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Spending Limit</span>
                      <span className="font-mono-nums font-medium text-foreground">
                        ₹{card.spent.toLocaleString("en-IN")} / ₹{card.limit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          spentPercent > 80 ? "bg-destructive" : "gradient-primary"
                        )}
                        style={{ width: `${spentPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFreeze(card.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all",
                        isFrozen
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      )}
                    >
                      {isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isFrozen ? "Unfreeze" : "Freeze Card"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cards;
