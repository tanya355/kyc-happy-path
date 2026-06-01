import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QaHelpAgent } from "@/components/kyc/QaHelpAgent";
import { AgentRunPanel } from "@/components/kyc/AgentRunPanel";
import Launch from "./pages/Launch";
import Home from "./pages/Home";
import Index from "./pages/CaseWorkspace";
import Reports from "./pages/Reports";
import EvidenceLocker from "./pages/EvidenceLocker";
import QaDashboard from "./pages/QaDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import QaWorkHub from "./pages/QaWorkHub";
import WorkQueue from "./pages/work-queue";
import NotFound from "./pages/NotFound";

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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <QaHelpAgent />
        <AgentRunPanel />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
