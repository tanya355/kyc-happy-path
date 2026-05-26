
import { useState } from "react";
import { TopNav } from "@/components/kyc/TopNav";
import { QueueMetricsBar } from "./queue-metrics-bar";
import { QueueFilters, EMPTY_FILTERS } from "./queue-filters";
import { DrgEntityGrid } from "./drg-entity-grid";
import { useWorkQueue } from "@/lib/api/queries/work-queue";
import type { WorkQueueFilterState } from "@/lib/types";

export default function WorkQueue() {
  const { data: groups = [], isLoading, isError } = useWorkQueue();
  const [filters, setFilters] = useState<WorkQueueFilterState>(EMPTY_FILTERS);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">

      <TopNav />

      {/* ── Page header ── */}
      <div
        className="shrink-0 px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-neutral-200)" }}
      >
        <div>
          <h1 className="text-[18px] font-bold text-neutral-800 leading-tight">Work Queue</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            DRG entities awaiting KYC review — sorted by risk and due date
          </p>
        </div>
      </div>

      {/* ── Metrics bar ── */}
      <QueueMetricsBar />

      {/* ── Filter toolbar ── */}
      <QueueFilters filters={filters} onChange={setFilters} />

      {/* ── Grid ── */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-neutral-400 animate-pulse">Loading queue…</p>
        </div>
      )}

      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-red-600">Failed to load work queue. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <DrgEntityGrid groups={groups} filters={filters} />
      )}

    </div>
  );
}
