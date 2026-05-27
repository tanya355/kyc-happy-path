/**
 * QueueMetricsBar — horizontal strip of aggregate case counts for the Work Queue.
 *
 * Displays: Total Cases | Analyst Review | Pending Feedback | Breaching Today | Completed This Week.
 * Polled every 15 seconds via useQueueMetrics (TanStack Query).
 *
 * Used only on the Work Queue screen; lives in the screen folder per architecture rules.
 */

import { AlertCircle, CheckCircle2, Clock, Users, LayoutList } from "lucide-react";
import { cn } from "@/lib/cn";
import { useQueueMetrics } from "@/lib/api/queries/work-queue";
import type { QueueMetrics } from "@/lib/types";

type MetricTile = {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  highlight?: "critical" | "warning" | "positive";
};

function buildTiles(m: QueueMetrics | undefined): MetricTile[] {
  return [
    {
      label: "Total Cases",
      value: m?.total,
      icon: <LayoutList size={14} aria-hidden />,
    },
    {
      label: "Analyst Review",
      value: m?.analystReview,
      icon: <Users size={14} aria-hidden />,
      highlight: m?.analystReview && m.analystReview > 5 ? "warning" : undefined,
    },
    {
      label: "Pending Feedback",
      value: m?.pendingFeedback,
      icon: <Clock size={14} aria-hidden />,
    },
    {
      label: "Breaching Today",
      value: m?.breachingToday,
      icon: <AlertCircle size={14} aria-hidden />,
      highlight: m?.breachingToday && m.breachingToday > 0 ? "critical" : undefined,
    },
    {
      label: "Completed This Week",
      value: m?.completedThisWeek,
      icon: <CheckCircle2 size={14} aria-hidden />,
      highlight: m?.completedThisWeek && m.completedThisWeek > 0 ? "positive" : undefined,
    },
  ];
}

export function QueueMetricsBar() {
  const { data: metrics } = useQueueMetrics();
  const tiles = buildTiles(metrics);

  return (
    <div
      className="shrink-0 flex items-stretch border-b divide-x"
      style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-base-white)" }}
      role="region"
      aria-label="Queue metrics"
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex flex-col justify-center px-5 py-2.5 flex-1 min-w-0"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={cn(
                "shrink-0",
                tile.highlight === "critical" ? "text-red-600"    :
                tile.highlight === "warning"  ? "text-amber-700"  :
                tile.highlight === "positive" ? "text-green-700"  :
                "text-neutral-400"
              )}
            >
              {tile.icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 whitespace-nowrap">
              {tile.label}
            </span>
          </div>
          <p
            className={cn(
              "text-[22px] font-bold leading-none tabular-nums",
              tile.highlight === "critical" ? "text-red-700"   :
              tile.highlight === "positive" ? "text-green-700" :
              "text-neutral-800"
            )}
          >
            {tile.value ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
