import { useEffect, useRef, useState } from "react";
import { Search, Filter } from "lucide-react";
import {
  WorkQueueFilterPanel,
  WorkQueueFilters,
} from "@/components/kyc/WorkQueueFilterPanel";
import type { QaViewKey, QaViewOption } from "../QaWorkHubData";

interface QaToolbarProps {
  search: string;
  onSearchChange: (next: string) => void;
  filters: WorkQueueFilters;
  onFiltersChange: (next: WorkQueueFilters) => void;
  viewOptions: readonly QaViewOption[];
  activeView: QaViewKey;
  onActiveViewChange: (next: QaViewKey) => void;
}

export function QaToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  viewOptions,
  activeView,
  onActiveViewChange,
}: QaToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const activeFilterCount = [
    filters.entity.trim() !== "",
    filters.dueDateFrom !== "" || filters.dueDateTo !== "",
    filters.jurisdictions.length > 0,
    filters.priorities.length > 0,
    filters.riskRatings.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="px-6 py-3 flex items-center gap-3 bg-white border-b border-kyc-neutral-100">

      <div className="flex items-center gap-2 border border-kyc-neutral-200 rounded-full px-3 py-1.5 bg-white shrink-0 w-64 focus-within:border-kyc-blue focus-within:ring-1 focus-within:ring-kyc-blue transition-all">
        <Search size={13} className="text-kyc-neutral-500 shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search entities..."
          aria-label="Search QA queue"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 text-[12px] outline-none text-kyc-neutral-800 placeholder:text-kyc-neutral-500 bg-transparent min-w-0"
        />
      </div>

      <div ref={filterRef} className="relative shrink-0">
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors"
          style={{
            borderColor: "var(--color-dark-blue-600)",
            color: "var(--color-dark-blue-600)",
            background: activeFilterCount > 0 ? "var(--color-dark-blue-000)" : "white",
          }}
          aria-label="Open filters"
        >
          <Filter size={13} aria-hidden />
          Filter
          {activeFilterCount > 0 && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
              style={{ background: "var(--color-dark-blue-600)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
        {filterOpen && (
          <WorkQueueFilterPanel
            filters={filters}
            onChange={onFiltersChange}
            onClose={() => setFilterOpen(false)}
          />
        )}
      </div>

      <div
        className="flex items-center gap-1 p-0.5 rounded-full shrink-0"
        style={{ background: "var(--color-neutral-100)" }}
        role="group"
        aria-label="Queue view"
      >
        {viewOptions.map((opt) => {
          const active = activeView === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onActiveViewChange(opt.key)}
              aria-pressed={active}
              className="px-3 py-1 text-[11px] font-semibold rounded-full transition-all"
              style={
                active
                  ? { background: "white", color: "var(--color-neutral-900)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "var(--color-neutral-600)" }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
