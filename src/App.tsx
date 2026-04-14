import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import ConsentDialog from "@/components/ConsentDialog";
import Onboarding from "@/components/Onboarding";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Rides from "@/pages/Rides";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Integrations from "@/pages/Integrations";
import CompareApps from "@/pages/CompareApps";
import Gamification from "@/pages/Gamification";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { applyTheme, getThemeMode } from "@/lib/theme";

const queryClient = new QueryClient();

const HIDE_NAV_ROUTES = ["/login"];

function AppContent() {
  const location = useLocation();
  const shouldHideNav = HIDE_NAV_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <ConsentDialog />
      <Onboarding />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/corridas" element={<ProtectedRoute><Rides /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/integracoes" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/comparar-apps" element={<ProtectedRoute><CompareApps /></ProtectedRoute>} />
        <Route path="/conquistas" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}

const App = () => {
  useEffect(() => {
    applyTheme(getThemeMode());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" closeButton={true} swipeDirections={["left", "right"]} />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
