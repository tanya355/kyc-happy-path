import { useState } from "react";
import { TopNav } from "@/components/kyc/TopNav";
import { useWorkQueue } from "@/lib/api/queries/work-queue";
import type { WorkQueueFilterState } from "@/lib/types";
import { getWorkQueueData } from "./WorkQueueData";
import { WorkQueueHeader } from "./components/WorkQueueHeader";
import { QueueMetricsBar } from "./components/QueueMetricsTiles";
import { QueueFilters, EMPTY_FILTERS } from "./components/QueueFiltersBar";
import { WorkQueueStateView } from "./components/WorkQueueStateView";

export default function WorkQueue() {
  const { data: groups = [], isLoading, isError } = useWorkQueue();
  const [filters, setFilters] = useState<WorkQueueFilterState>(EMPTY_FILTERS);
  const { header, states } = getWorkQueueData();

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <TopNav />
      <WorkQueueHeader title={header.title} subtitle={header.subtitle} />
      <QueueMetricsBar />
      <QueueFilters filters={filters} onChange={setFilters} />
      <WorkQueueStateView
        isLoading={isLoading}
        isError={isError}
        groups={groups}
        filters={filters}
        loadingMessage={states.loading}
        errorMessage={states.error}
      />
    </div>
  );
}
