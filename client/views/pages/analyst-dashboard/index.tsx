/**
 * AnalystDashboard — overview screen for KYC Analysts.
 *
 * Shows: KPI metrics bar, recent case activity, quick-action links.
 * Server state: useDashboardMetrics() via TanStack Query.
 * Route: /analyst-dashboard
 */

import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { KpiBar } from "./kpi-bar";
import { cn } from "@/lib/cn";

type AlertItem = {
  id: string;
  severity: "critical" | "warning" | "info" | "positive";
  title: string;
  sub: string;
};

const ALERTS: AlertItem[] = [
  { id: "a1", severity: "critical",  title: "3 cases breaching SLA today",              sub: "KYC-2194, KYC-2210, KYC-2188 — immediate action required" },
  { id: "a2", severity: "warning",   title: "Decision Support queue up 14% since Monday", sub: "22 cases pending analyst determination" },
  { id: "a3", severity: "positive",  title: "8 client responses received overnight",      sub: "Blocking rate down 6% vs last week" },
  { id: "a4", severity: "info",      title: "Active case volume projected to decline 34%", sub: "Workflow efficiency improving on current trajectory" },
];

const SEV_ICON: Record<AlertItem["severity"], React.ReactNode> = {
  critical: <AlertCircle size={14} className="text-red-600 shrink-0" />,
  warning:  <Clock       size={14} className="text-amber-600 shrink-0" />,
  positive: <CheckCircle2 size={14} className="text-green-700 shrink-0" />,
  info:     <TrendingUp  size={14} className="text-blue-600 shrink-0" />,
};

const SEV_STYLE: Record<AlertItem["severity"], string> = {
  critical: "bg-red-50 border-red-200",
  warning:  "bg-amber-50 border-amber-200",
  positive: "bg-green-50 border-green-200",
  info:     "bg-blue-50 border-blue-100",
};

export default function AnalystDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />

      {/* Page header */}
      <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div>
          <h1 className="text-[18px] font-bold text-neutral-800 leading-tight">Dashboard</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">KYC Analyst overview — AI operational briefing</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
          style={{ background: "var(--color-dark-blue-600)", color: "#fff" }}
        >
          Open Work Queue <ArrowRight size={11} />
        </button>
      </div>

      {/* KPI bar */}
      <KpiBar />

      {/* AI operational briefing */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">AI Operational Briefing</p>

        {ALERTS.map((a) => (
          <div
            key={a.id}
            className={cn("flex items-start gap-3 px-4 py-3 rounded-lg border", SEV_STYLE[a.severity])}
          >
            {SEV_ICON[a.severity]}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-neutral-800 leading-snug">{a.title}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{a.sub}</p>
            </div>
          </div>
        ))}

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Work Queue",     sub: "Review pending cases",     path: "/dashboard" },
            { label: "Evidence Locker", sub: "Browse source documents", path: "/evidence-locker" },
            { label: "Reports",         sub: "Operational analytics",   path: "/reports" },
          ].map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-start gap-1 p-4 rounded-lg border text-left transition-colors hover:bg-neutral-50"
              style={{ borderColor: "var(--color-neutral-200)" }}
            >
              <p className="text-[12px] font-semibold text-neutral-800">{link.label}</p>
              <p className="text-[10.5px] text-neutral-500">{link.sub}</p>
              <ArrowRight size={11} className="text-neutral-400 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
