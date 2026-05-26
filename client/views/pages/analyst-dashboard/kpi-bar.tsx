/**
 * KpiBar — horizontal strip of KPI metric tiles for the Analyst Dashboard.
 *
 * Data: usesDashboardMetrics() TanStack Query hook (polled every 15 s).
 * Tiles: Total Cases | In Progress | Completed This Week | Breaching SLA | Avg. Resolution
 */

import { LayoutList, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDashboardMetrics } from "@/lib/api/queries/cases";
import type { ApiDashboardMetrics } from "@/lib/api/types";

type Tile = {
  label: string;
  value: (m: ApiDashboardMetrics) => string | number;
  icon: React.ReactNode;
  highlight?: (m: ApiDashboardMetrics) => "critical" | "positive" | undefined;
};

const TILES: Tile[] = [
  { label: "Total Cases",          value: m => m.totalCases,          icon: <LayoutList size={13} aria-hidden /> },
  { label: "In Progress",          value: m => m.inProgress,          icon: <Loader2 size={13} aria-hidden />,     highlight: m => m.inProgress > 20 ? "critical" : undefined },
  { label: "Completed This Week",  value: m => m.completedThisWeek,   icon: <CheckCircle2 size={13} aria-hidden />, highlight: m => m.completedThisWeek > 5 ? "positive" : undefined },
  { label: "Breaching SLA",        value: m => m.breachingSla,        icon: <AlertCircle size={13} aria-hidden />,  highlight: m => m.breachingSla > 0 ? "critical" : undefined },
  { label: "Avg. Resolution (d)",  value: m => m.avgResolutionDays.toFixed(1), icon: <Clock size={13} aria-hidden /> },
];

export function KpiBar() {
  const { data: metrics } = useDashboardMetrics();

  return (
    <div
      className="shrink-0 flex items-stretch border-b divide-x"
      style={{ borderColor: "var(--color-neutral-200)", background: "#fff" }}
      role="region"
      aria-label="Dashboard KPIs"
    >
      {TILES.map((tile) => {
        const hl = metrics ? tile.highlight?.(metrics) : undefined;
        return (
          <div key={tile.label} className="flex flex-col justify-center px-5 py-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={cn("shrink-0", hl === "critical" ? "text-red-600" : hl === "positive" ? "text-green-700" : "text-neutral-400")}>
                {tile.icon}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">
                {tile.label}
              </span>
            </div>
            <p className={cn("text-[22px] font-bold tabular-nums leading-none", hl === "critical" ? "text-red-700" : hl === "positive" ? "text-green-700" : "text-neutral-800")}>
              {metrics ? tile.value(metrics) : "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
