import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Shield, Users, AlertTriangle, CheckCircle2, XCircle, Search, Ban, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const stats = [
  { label: "Total Users", value: "2,847", icon: Users, color: "text-info" },
  { label: "Active Accounts", value: "2,631", icon: CheckCircle2, color: "text-success" },
  { label: "Frozen Accounts", value: "43", icon: Ban, color: "text-destructive" },
  { label: "Flagged Activity", value: "12", icon: AlertTriangle, color: "text-warning" },
];

const users = [
  { id: "USR-001", name: "Alice Johnson", email: "alice@example.com", account: "ACC-4829", balance: 154200.50, status: "active" as const, risk: "low" as const },
  { id: "USR-002", name: "Bob Smith", email: "bob@example.com", account: "ACC-7231", balance: 428000.00, status: "active" as const, risk: "low" as const },
  { id: "USR-003", name: "Carol Williams", email: "carol@example.com", account: "ACC-1954", balance: 8900.25, status: "frozen" as const, risk: "high" as const },
  { id: "USR-004", name: "David Brown", email: "david@example.com", account: "ACC-3847", balance: 672000.00, status: "active" as const, risk: "medium" as const },
  { id: "USR-005", name: "Eve Davis", email: "eve@example.com", account: "ACC-9182", balance: 31000.75, status: "active" as const, risk: "low" as const },
];

const Admin = () => {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.account.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Manage users, accounts, and monitor activity</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/50 rounded-2xl p-4 shadow-card"
            >
              <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
              <p className="text-2xl font-bold font-mono-nums text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {/* Users table */}
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
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Account</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Balance</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Risk</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{user.account}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold font-mono-nums text-foreground">
                        ₹{user.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                        user.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", user.status === "active" ? "bg-success" : "bg-destructive")} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={cn(
                        "text-xs font-medium",
                        user.risk === "low" ? "text-success" : user.risk === "medium" ? "text-warning" : "text-destructive"
                      )}>
                        {user.risk}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
                        user.status === "active"
                          ? "text-destructive border-destructive/20 hover:bg-destructive/10"
                          : "text-success border-success/20 hover:bg-success/10"
                      )}>
                        {user.status === "active" ? "Freeze" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
