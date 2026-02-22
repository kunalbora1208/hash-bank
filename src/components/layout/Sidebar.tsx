import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  PiggyBank,
  Shield,
  Users,
  Bot,
  LogOut,
  X,
  ChevronRight,
  Smartphone,
  Receipt,
  Building2,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upi", icon: Smartphone, label: "UPI Payments" },
  { to: "/transfer", icon: Building2, label: "Fund Transfer" },
  { to: "/bills", icon: Receipt, label: "Bill Payments" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/cards", icon: CreditCard, label: "Cards" },
  { to: "/loans", icon: PiggyBank, label: "Loans" },
  { to: "/assistant", icon: Bot, label: "AI Assistant" },
  { to: "/support", icon: Headphones, label: "Support" },
];

const adminItems = [
  { to: "/admin", icon: Shield, label: "Admin Panel" },
  { to: "/admin/users", icon: Users, label: "Manage Users" },
];

export const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const { profile, user, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HB";

  return (
    <div className="w-[260px] h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-sm">#</span>
          </div>
          <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">
            Hash Bank
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sidebar-accent lg:hidden">
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Main
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-primary"
                />
              )}
              <item.icon className={cn("w-[18px] h-[18px]", isActive && "text-sidebar-primary")} />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-sidebar-primary/60" />
              )}
            </NavLink>
          );
        })}

        <p className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Administration
        </p>
        {adminItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", isActive && "text-sidebar-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Log out</span>
        </button>

        {/* User card */}
        <div className="mt-3 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-sidebar-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
