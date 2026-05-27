import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Filter } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { DrgTable } from "@/components/kyc/DrgTable";
import { WorkQueueFilterPanel, WorkQueueFilters, EMPTY_WQ_FILTERS } from "@/components/kyc/WorkQueueFilterPanel";

// Map analyst statuses → QA statuses for display in the shared DrgTable
const QA_STATUS_MAP: Record<string, string> = {
  "Not Started":       "Ready for QA",
  "In Progress":       "QA In Progress",
  "Pending Feedback":  "Rework Requested",
  "Complete":          "Final Closure",
};

export default function QaWorkHub() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState("");
  const [activeView, setActiveView]   = useState<"all" | "periodic" | "onboarding">("all");
  const [filters, setFilters]         = useState<WorkQueueFilters>(EMPTY_WQ_FILTERS);
  const [filterOpen, setFilterOpen]   = useState(false);
  const filterRef                     = useRef<HTMLDivElement | null>(null);

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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <div className="relative flex flex-col flex-1">

        <TopNav />

        {/* ── Toolbar ── */}
        <div className="px-6 py-3 flex items-center gap-3 bg-white border-b border-kyc-neutral-100">

          {/* Search */}
          <div className="flex items-center gap-2 border border-kyc-neutral-200 rounded-full px-3 py-1.5 bg-white shrink-0 w-64 focus-within:border-kyc-blue focus-within:ring-1 focus-within:ring-kyc-blue transition-all">
            <Search size={13} className="text-kyc-neutral-500 shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search entities..."
              aria-label="Search QA queue"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[12px] outline-none text-kyc-neutral-800 placeholder:text-kyc-neutral-500 bg-transparent min-w-0"
            />
          </div>

          {/* Filter button — outlined */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => setFilterOpen(o => !o)}
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
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white" style={{ background: "var(--color-dark-blue-600)" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {filterOpen && (
              <WorkQueueFilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setFilterOpen(false)}
              />
            )}
          </div>

          {/* View toggle pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-full shrink-0" style={{ background: "var(--color-neutral-100)" }} role="group" aria-label="Queue view">
            {(["all", "periodic", "onboarding"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                aria-pressed={activeView === v}
                className="px-3 py-1 text-[11px] font-semibold rounded-full transition-all"
                style={activeView === v
                  ? { background: "white", color: "var(--color-neutral-900)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "var(--color-neutral-600)" }
                }
              >
                {v === "all" ? "All" : v === "periodic" ? "Periodic Refresh" : "Onboarding"}
              </button>
            ))}
          </div>

        </div>

        {/* ── QA DRG Table ── */}
        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-6 text-[14px]" aria-label="QA Work Queue">
          <DrgTable
            selected={new Set()}
            onSelectionChange={() => {}}
            filters={filters}
            statusMap={QA_STATUS_MAP}
            hideGroupCheckbox
            hideAllCheckboxes
            onEntityClick={() => navigate("/qa-dashboard")}
          />
        </main>

      </div>
    </div>
  );
}
