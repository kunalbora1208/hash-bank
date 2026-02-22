import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { profile, accounts } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your finances today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BalanceCard title="Total Balance" amount={totalBalance} change={12.5} type="total" delay={0.1} />
          <BalanceCard title="Monthly Income" amount={82000.00} change={8.2} type="income" delay={0.15} />
          <BalanceCard title="Monthly Expenses" amount={51000.00} change={-3.1} type="expense" delay={0.2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
          <QuickActions />
        </div>

        <RecentTransactions />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
