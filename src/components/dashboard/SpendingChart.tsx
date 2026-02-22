import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", income: 4200, expenses: 3100 },
  { month: "Feb", income: 3800, expenses: 2900 },
  { month: "Mar", income: 5100, expenses: 3400 },
  { month: "Apr", income: 4600, expenses: 3800 },
  { month: "May", income: 5800, expenses: 3200 },
  { month: "Jun", income: 6200, expenses: 4100 },
  { month: "Jul", income: 5400, expenses: 3600 },
  { month: "Aug", income: 7100, expenses: 4200 },
  { month: "Sep", income: 6800, expenses: 3900 },
  { month: "Oct", income: 7500, expenses: 4500 },
  { month: "Nov", income: 6900, expenses: 4800 },
  { month: "Dec", income: 8200, expenses: 5100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-card">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm font-semibold font-mono-nums" style={{ color: item.color }}>
            ₹{item.value.toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SpendingChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card border border-border/50 rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Cash Flow</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(213, 94%, 55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(213, 94%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 16%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2}
              fill="url(#incomeGrad)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(213, 94%, 55%)"
              strokeWidth={2}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
