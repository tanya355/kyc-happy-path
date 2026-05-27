import { useEffect, useRef, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import {
  WorkQueueFilterPanel,
  WorkQueueFilters,
} from "@/components/kyc/WorkQueueFilterPanel";
import type { HomeViewKey, HomeViewOption } from "../HomeData";
import { ViewSegmentedControl } from "./ViewSegmentedControl";
import { ReviewSelectedButton } from "./ReviewSelectedButton";

interface HomeToolbarProps {
  search: string;
  onSearchChange: (next: string) => void;
  searchResultCount: number;
  filters: WorkQueueFilters;
  onFiltersChange: (next: WorkQueueFilters) => void;
  viewOptions: readonly HomeViewOption[];
  activeView: HomeViewKey;
  onActiveViewChange: (next: HomeViewKey) => void;
  selectedCount: number;
  onReviewSelected: () => void;
}

export function HomeToolbar({
  search,
  onSearchChange,
  searchResultCount,
  filters,
  onFiltersChange,
  viewOptions,
  activeView,
  onActiveViewChange,
  selectedCount,
  onReviewSelected,
}: HomeToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
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
    <div className="bg-white" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
      <div className="px-6 py-3 flex items-center gap-2">

        <label
          className="flex items-center gap-2 rounded-full px-3 py-1.5 w-72 shrink-0 transition-colors cursor-text"
          style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
        >
          <Search size={13} style={{ color: "var(--color-neutral-400)" }} className="shrink-0" aria-hidden />
          <input
            type="text"
            placeholder="Search entities…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 text-[12px] outline-none bg-transparent min-w-0"
            style={{ color: "var(--color-neutral-800)" }}
            aria-label="Search entities"
          />
          <span className="text-[10px] tabular-nums shrink-0" style={{ color: "var(--color-neutral-400)" }}>
            {searchResultCount}
          </span>
        </label>

        <div className="w-px h-4 shrink-0" style={{ background: "var(--color-neutral-200)" }} aria-hidden />

        <div ref={filterRef} className="relative shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="dashboard-filter-btn" onClick={() => setFilterOpen((o) => !o)}>
              <Button variant="outlined" size="small" label="Filter" showIconTrailing icon={<Filter size={13} />} />
            </div>
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
                style={{ background: "var(--color-dark-blue-600)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          {filterOpen && (
            <WorkQueueFilterPanel
              filters={filters}
              onChange={onFiltersChange}
              onClose={() => setFilterOpen(false)}
            />
          )}
        </div>

        <div className="w-px h-4 shrink-0" style={{ background: "var(--color-neutral-200)" }} aria-hidden />

        <ViewSegmentedControl options={viewOptions} value={activeView} onChange={onActiveViewChange} />

        <div className="flex-1" />

        <ReviewSelectedButton count={selectedCount} onClick={onReviewSelected} />
      </div>
    </div>
  );
}
