/**
 * AnalystWorkQueue — DRG entity grid for KYC Analysts.
 *
 * Route: /dashboard (existing route preserved for compatibility)
 * Architecture:
 *   Server state: useWorkQueue() + useQueueMetrics() (TanStack Query)
 *   UI state: local useState for filters (screen-scoped)
 *   Grid: DrgEntityGrid (TanStack Table v8, expandable DRG groups)
 */

import { useState } from "react";
import { TopNav } from "@/components/kyc/TopNav";
import { DrgEntityGrid } from "./drg-entity-grid";
import { QueueFilters, EMPTY_FILTERS } from "./queue-filters";
import { useWorkQueue, useQueueMetrics } from "@/lib/api/queries/work-queue";
import type { WorkQueueFilterState } from "@/lib/types";

export default function AnalystWorkQueue() {
  const { data: groups = [], isLoading, isError } = useWorkQueue();
  const { data: metrics } = useQueueMetrics();
  const [filters, setFilters] = useState<WorkQueueFilterState>(EMPTY_FILTERS);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />

      {/* Page header */}
      <div className="shrink-0 px-6 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)" }}>
        <div>
          <h1 className="text-[16px] font-bold text-neutral-800 leading-tight">Analyst Work Queue</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {metrics ? `${metrics.total} total · ${metrics.analystReview} in analyst review · ${metrics.breachingToday} breaching today` : "Loading…"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <QueueFilters filters={filters} onChange={setFilters} />

      {/* Grid */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-neutral-400 animate-pulse">Loading queue…</p>
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-red-600">Failed to load work queue.</p>
        </div>
      )}
      {!isLoading && !isError && <DrgEntityGrid groups={groups} filters={filters} />}
    </div>
  );
}
