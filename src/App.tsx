import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Cards from "./pages/Cards";
import Loans from "./pages/Loans";
import Assistant from "./pages/Assistant";
import Admin from "./pages/Admin";
import UPI from "./pages/UPI";
import Support from "./pages/Support";
import BillPayments from "./pages/BillPayments";
import FundTransfer from "./pages/FundTransfer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
    <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
    <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
    <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
    <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    <Route path="/upi" element={<ProtectedRoute><UPI /></ProtectedRoute>} />
    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
    <Route path="/bills" element={<ProtectedRoute><BillPayments /></ProtectedRoute>} />
    <Route path="/transfer" element={<ProtectedRoute><FundTransfer /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="dark">
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
