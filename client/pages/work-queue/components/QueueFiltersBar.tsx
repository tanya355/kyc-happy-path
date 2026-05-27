/**
 * QueueFilters — search + filter toolbar for the Work Queue grid.
 *
 * Controlled component: parent owns `filters` state and passes `onChange`.
 * Renders: global search input, view toggle (All / Periodic / Onboarding),
 * and filter chips for Risk Rating, Priority, and Status.
 *
 * ADA: all interactive elements have accessible labels.
 */

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WorkQueueFilterState } from "@/lib/types";
import type { RiskRating, Priority, CaseStatus } from "@/lib/utils/enums";
import { caseStatusLabel } from "@/lib/utils/format-utils";

export const EMPTY_FILTERS: WorkQueueFilterState = {
  search:       "",
  riskRatings:  [],
  priorities:   [],
  statuses:     [],
  jurisdictions:[],
  reviewType:   "all",
};

type QueueFiltersProps = {
  filters: WorkQueueFilterState;
  onChange: (filters: WorkQueueFilterState) => void;
};

const RISK_OPTIONS: RiskRating[]   = ["Elevated", "Moderate", "Minimal"];
const PRIORITY_OPTIONS: Priority[] = ["High", "Medium", "Low"];
const STATUS_OPTIONS: CaseStatus[] = [
  "not_started", "in_progress_agents", "analyst_review", "qa_review", "complete",
];

function ToggleChip<T extends string>({
  label,
  value,
  selected,
  onToggle,
}: {
  label: string;
  value: T;
  selected: boolean;
  onToggle: (v: T) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`Filter by ${label}`}
      onClick={() => onToggle(value)}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors whitespace-nowrap",
        selected
          ? "border-[var(--color-dark-blue-500)] bg-[var(--color-dark-blue-000)] text-[var(--color-dark-blue-700)]"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
      )}
    >
      {label}
    </button>
  );
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export function QueueFilters({ filters, onChange }: QueueFiltersProps) {
  const activeCount = [
    filters.riskRatings.length > 0,
    filters.priorities.length > 0,
    filters.statuses.length > 0,
    filters.jurisdictions.length > 0,
  ].filter(Boolean).length;

  const hasActiveFilters = filters.search !== "" || activeCount > 0;

  return (
    <div
      className="shrink-0 border-b bg-white"
      style={{ borderColor: "var(--color-neutral-200)" }}
    >
      {/* ── Top row: search + view tabs + clear ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white w-56 focus-within:border-[var(--color-dark-blue-400)] focus-within:ring-1 focus-within:ring-[var(--color-dark-blue-200)] transition-all"
          style={{ borderColor: "var(--color-neutral-200)" }}
        >
          <Search size={12} className="text-neutral-400 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search entities or DRGs…"
            aria-label="Search work queue"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="flex-1 min-w-0 text-[11px] text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400"
          />
          {filters.search && (
            <button
              aria-label="Clear search"
              onClick={() => onChange({ ...filters, search: "" })}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 border rounded-full px-1 py-0.5" style={{ borderColor: "var(--color-neutral-200)" }}>
          {(["all", "periodic", "onboarding"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={filters.reviewType === view}
              onClick={() => onChange({ ...filters, reviewType: view })}
              className={cn(
                "rounded-full px-3 py-0.5 text-[10px] font-semibold capitalize transition-colors",
                filters.reviewType === view
                  ? "bg-[var(--color-dark-blue-600)] text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {view === "all" ? "All" : view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            aria-label="Clear all filters"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-auto flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <X size={10} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Filter chips row ── */}
      <div className="flex items-center gap-4 px-5 py-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {/* Risk Rating */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Risk</span>
          <div className="flex items-center gap-1">
            {RISK_OPTIONS.map((r) => (
              <ToggleChip
                key={r}
                label={r}
                value={r}
                selected={filters.riskRatings.includes(r)}
                onToggle={(v) => onChange({ ...filters, riskRatings: toggle(filters.riskRatings, v) })}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-4 bg-neutral-200 shrink-0" aria-hidden />

        {/* Priority */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Priority</span>
          <div className="flex items-center gap-1">
            {PRIORITY_OPTIONS.map((p) => (
              <ToggleChip
                key={p}
                label={p}
                value={p}
                selected={filters.priorities.includes(p)}
                onToggle={(v) => onChange({ ...filters, priorities: toggle(filters.priorities, v) })}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-4 bg-neutral-200 shrink-0" aria-hidden />

        {/* Status */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Status</span>
          <div className="flex items-center gap-1">
            {STATUS_OPTIONS.map((s) => (
              <ToggleChip
                key={s}
                label={caseStatusLabel(s)}
                value={s}
                selected={filters.statuses.includes(s)}
                onToggle={(v) => onChange({ ...filters, statuses: toggle(filters.statuses, v) })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
