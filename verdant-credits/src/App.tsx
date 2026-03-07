import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import LandingPage from "./pages/LandingPage";
import BuyerLogin from "./pages/BuyerLogin";
import FarmerDashboard from "./pages/FarmerDashboard";
import CertificatePage from "./pages/CertificatePage";
import MarketPage from "./pages/MarketPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/buyer-login" element={<BuyerLogin />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
