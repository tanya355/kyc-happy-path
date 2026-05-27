import type { ReactNode } from "react";
import type { DrgGroup, WorkQueueFilterState } from "@/lib/types";
import { DrgEntityGrid } from "./DrgEntityGrid";

interface WorkQueueStateViewProps {
  isLoading: boolean;
  isError: boolean;
  groups: DrgGroup[];
  filters: WorkQueueFilterState;
  loadingMessage: string;
  errorMessage: string;
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex-1 flex items-center justify-center">{children}</div>;
}

export function WorkQueueStateView({
  isLoading,
  isError,
  groups,
  filters,
  loadingMessage,
  errorMessage,
}: WorkQueueStateViewProps) {
  if (isLoading) {
    return (
      <Centered>
        <p className="text-[13px] text-neutral-400 animate-pulse">{loadingMessage}</p>
      </Centered>
    );
  }
  if (isError) {
    return (
      <Centered>
        <p className="text-[13px] text-red-600">{errorMessage}</p>
      </Centered>
    );
  }
  return <DrgEntityGrid groups={groups} filters={filters} />;
}
