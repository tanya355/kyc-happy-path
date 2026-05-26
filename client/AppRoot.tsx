import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QaHelpAgent } from "@/components/kyc/QaHelpAgent";
import Launch from "./pages/Launch";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import EvidenceLocker from "./pages/EvidenceLocker";
import QaDashboard from "./pages/QaDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import QaWorkHub from "./pages/QaWorkHub";
import WorkQueue from "./pages/work-queue/index";
import NotFound from "./pages/NotFound";

// ── Architecture-compliant views/ pages ──
import ProfileView        from "./views/pages/profile/index";
import AnalystDashboardV2 from "./views/pages/analyst-dashboard/index";
import AnalystWorkQueue   from "./views/pages/analyst-work-queue/index";
import QaWorkQueueV2      from "./views/pages/qa-work-queue/index";
import ReportsV2          from "./views/pages/reports/index";
import EvidenceLockerV2   from "./views/pages/evidence-locker/index";

const queryClient = new QueryClient();

export function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Launch />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/case" element={<Index />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/evidence-locker" element={<EvidenceLocker />} />
            <Route path="/qa-dashboard" element={<QaDashboard />} />
            <Route path="/analyst-dashboard" element={<AnalystDashboard />} />
            <Route path="/qa-work-hub" element={<QaWorkHub />} />
            <Route path="/work-queue"  element={<WorkQueue />} />

            {/* ── Architecture v2 routes (views/ pages) ── */}
            <Route path="/v2/profile"            element={<ProfileView />} />
            <Route path="/v2/analyst-dashboard"  element={<AnalystDashboardV2 />} />
            <Route path="/v2/analyst-work-queue" element={<AnalystWorkQueue />} />
            <Route path="/v2/qa-work-queue"      element={<QaWorkQueueV2 />} />
            <Route path="/v2/reports"            element={<ReportsV2 />} />
            <Route path="/v2/evidence-locker"    element={<EvidenceLockerV2 />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <QaHelpAgent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
