import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Calculator, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const loans = [
  { id: "LN-001", type: "Personal Loan", amount: 500000, remaining: 291000, emi: 20833, tenure: "24 months", nextDue: "Mar 1, 2026", status: "active" as const, progress: 42 },
  { id: "LN-002", type: "Home Loan", amount: 5000000, remaining: 4600000, emi: 46000, tenure: "360 months", nextDue: "Mar 5, 2026", status: "active" as const, progress: 8 },
];

const Loans = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(24);

  const monthlyRate = interestRate / 12 / 100;
  const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - loanAmount;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold text-foreground">Loans</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your loans and apply for new ones</p>
        </motion.div>

        {/* Active Loans */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Active Loans</h2>
          {loans.map((loan, i) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-card"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-base font-semibold text-foreground">{loan.type}</p>
                    <span className="text-xs font-mono text-muted-foreground">{loan.id}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-semibold font-mono-nums text-foreground">₹{loan.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-sm font-semibold font-mono-nums text-foreground">₹{loan.remaining.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">EMI</p>
                      <p className="text-sm font-semibold font-mono-nums text-primary">₹{loan.emi.toLocaleString("en-IN")}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-sm font-semibold text-foreground">{loan.nextDue}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="font-medium text-foreground">{loan.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${loan.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full gradient-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">EMI Calculator</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-foreground">Loan Amount</label>
                  <span className="font-mono-nums text-primary font-semibold">₹{loanAmount.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-foreground">Interest Rate</label>
                  <span className="font-mono-nums text-primary font-semibold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-foreground">Tenure (months)</label>
                  <span className="font-mono-nums text-primary font-semibold">{tenure} months</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="360"
                  step="6"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
                <p className="text-2xl font-bold font-mono-nums text-primary">
                  ₹{emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                <p className="text-lg font-semibold font-mono-nums text-warning">
                  ₹{totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
                <p className="text-lg font-semibold font-mono-nums text-foreground">
                  ₹{totalPayment.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-5 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-opacity"
          >
            Apply for Loan
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Loans;
